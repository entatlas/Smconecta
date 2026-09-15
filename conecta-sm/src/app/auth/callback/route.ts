import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendWelcomeEmail } from '@/app/cadastro/actions';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = await createClient();
    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (session?.user) {
      // Verificar se já existe um Profile para este usuário no banco
      const profile = await prisma.profile.findUnique({
        where: { auth_user_id: session.user.id }
      });

      const tipoFromUrl = requestUrl.searchParams.get('tipo');

      if (!profile) {
        // Usuário acabou de logar com OAuth e não tem tipo definido.
        // Precisamos redirecioná-lo para escolher se é Candidato ou Empresa.
        return NextResponse.redirect(new URL('/completar-perfil', request.url));
      }

      // Se o usuário for novo (criado nos últimos 5 minutos) e a trigger o criou com o tipo errado por padrão
      const isNewUser = new Date().getTime() - new Date(session.user.created_at).getTime() < 300000;
      
      if (isNewUser && tipoFromUrl && profile.tipo !== tipoFromUrl && (tipoFromUrl === 'CANDIDATE' || tipoFromUrl === 'COMPANY')) {
        await prisma.profile.update({
          where: { id: profile.id },
          data: { tipo: tipoFromUrl }
        });

        if (tipoFromUrl === 'COMPANY') {
          // Trigger criou candidate por padrao, vamos apagar e criar company
          await prisma.candidate.deleteMany({ where: { profileId: profile.id } });
          await prisma.company.create({
            data: {
              profileId: profile.id,
              cnpj: 'PENDENTE-' + session.user.id,
              tradeName: profile.nome || 'Empresa Convidada',
              companyName: profile.nome || 'Empresa Convidada'
            }
          });
        } else if (tipoFromUrl === 'CANDIDATE') {
          // Caso a trigger mude o padrao no futuro
          await prisma.company.deleteMany({ where: { profileId: profile.id } });
          const candidateExists = await prisma.candidate.findUnique({ where: { profileId: profile.id } });
          if (!candidateExists) {
            await prisma.candidate.create({
              data: { profileId: profile.id }
            });
          }
        }

        // Dispara o e-mail de boas-vindas para cadastros via OAuth (Google/LinkedIn)
        if (session.user.email) {
          sendWelcomeEmail(session.user.email, profile.nome || 'Usuário', tipoFromUrl);
        }
      }

      const next = requestUrl.searchParams.get('next');
      if (next) {
        return NextResponse.redirect(new URL(next, request.url));
      }

      // Se já tem perfil, mandar para o dashboard correto
      return NextResponse.redirect(new URL('/redirect-dashboard', request.url));
    }
  }

  // Se der erro, mandar de volta pro login com aviso
  return NextResponse.redirect(new URL('/login?error=oauth', request.url));
}
