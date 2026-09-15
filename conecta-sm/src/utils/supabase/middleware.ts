import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          fetch: (url, init) => fetch(url, { ...init, cache: 'no-store' })
        },
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
            supabaseResponse = NextResponse.next({
              request,
            })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Rotas protegidas
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin/') || request.nextUrl.pathname === '/admin'
  const isCandidateRoute = request.nextUrl.pathname.startsWith('/candidato/') || request.nextUrl.pathname === '/candidato'
  const isCompanyRoute = request.nextUrl.pathname.startsWith('/empresa/') || request.nextUrl.pathname === '/empresa'
  
  if (
    !user &&
    (isAdminRoute || isCandidateRoute || isCompanyRoute || request.nextUrl.pathname === '/perfil')
  ) {
    // no user, potentially respond by redirecting the user to the login page
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user) {
    // Se o usuário está logado, precisamos checar o tipo no banco de dados para evitar acesso indevido.
    // Como middleware roda no Edge, consultar o banco toda hora pode ser lento, 
    // mas faremos uma consulta simples de profile.
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, tipo')
      .eq('auth_user_id', user.id)
      .single()

    if (error) {
      console.error('Middleware Supabase Profile Error:', error)
    }

    let tipo = profile?.tipo || 'CANDIDATE'
    if (user.email === 'alysontrx@gmail.com') {
      tipo = 'ADMIN'
    }

    // Regras de Roteamento Baseadas no Perfil
    if (isAdminRoute && tipo !== 'ADMIN') {
      const url = request.nextUrl.clone()
      if (tipo === 'COMPANY') url.pathname = '/empresa/dashboard'
      else url.pathname = '/candidato/dashboard'
      return NextResponse.redirect(url)
    }

    if (tipo !== 'ADMIN') {
      if (isCandidateRoute && tipo !== 'CANDIDATE') {
        const url = request.nextUrl.clone()
        url.pathname = tipo === 'COMPANY' ? '/empresa/dashboard' : '/acesso-negado'
        return NextResponse.redirect(url)
      }

      if (isCompanyRoute && tipo !== 'COMPANY') {
        const url = request.nextUrl.clone()
        url.pathname = tipo === 'CANDIDATE' ? '/candidato/dashboard' : '/acesso-negado'
        return NextResponse.redirect(url)
      }

    }

    // Rota auxiliar para redirecionar para o dashboard correto
    if (request.nextUrl.pathname === '/redirect-dashboard' || request.nextUrl.pathname === '/login') {
      const url = request.nextUrl.clone()
      if (tipo === 'ADMIN') url.pathname = '/admin/dashboard'
      else if (tipo === 'COMPANY') url.pathname = '/empresa/dashboard'
      else url.pathname = '/candidato/dashboard'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
