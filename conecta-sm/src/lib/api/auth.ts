import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { errorResponse } from './response';


/**
 * Retorna o usuário autenticado da requisição.
 * Idealmente, APIs de integração usarão JWT no header Authorization Bearer <token>.
 * O createClient do Supabase automaticamente checa cookies e headers.
 */
export async function getAuthUser(req: NextRequest) {
  const supabase = await createClient();
  
  // O Supabase Auth vai buscar o token dos cookies nativamente.
  // Se for uma requisição puramente de API (ex: Mobile), o token pode vir no header Authorization.
  const authHeader = req.headers.get('Authorization');
  if (authHeader) {
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return null;
    return user;
  }

  // Fallback para Cookies
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

export async function requireAuth(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) {
    return { error: errorResponse('UNAUTHORIZED', 'Não autenticado', 401), user: null, profile: null };
  }

  // Buscar perfil para verificar permissões
  const profile = await prisma.profile.findUnique({
    where: { auth_user_id: user.id }
  });

  if (!profile) {
    return { error: errorResponse('FORBIDDEN', 'Perfil não encontrado', 403), user, profile: null };
  }

  return { error: null, user, profile };
}

export async function requireRole(req: NextRequest, roles: string[]) {
  const authContext = await requireAuth(req);
  if (authContext.error) return authContext;

  if (!roles.includes(authContext.profile!.tipo)) {
    return { error: errorResponse('FORBIDDEN', 'Sem permissão para este recurso', 403), user: authContext.user, profile: authContext.profile };
  }

  return authContext;
}

export async function requirePermission(req: NextRequest, permission: string) {
  const authContext = await requireAuth(req);
  if (authContext.error) return authContext;

  const profile = authContext.profile!;
  
  // ADMIN can do anything
  if (profile.tipo === 'ADMIN') return authContext;

  // Granular check
  if (!profile.permissions.includes(permission)) {
    return { error: errorResponse('FORBIDDEN', `Falta a permissão requerida: ${permission}`, 403), user: authContext.user, profile: authContext.profile };
  }

  return authContext;
}
