import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api/response';
import { applyRateLimit, apiLog } from '@/lib/api/middlewares';
import { requireRole } from '@/lib/api/auth';


// GET Privada (Obter perfil do candidato logado)
export async function GET(req: NextRequest) {
  if (applyRateLimit(req)) return applyRateLimit(req);

  const auth = await requireRole(req, ['CANDIDATE']);
  if (auth.error) {
    apiLog(req, 403);
    return auth.error;
  }

  try {
    const candidate = await prisma.candidate.findFirst({
      where: { profileId: auth.profile!.id },
      include: {
        experiences: true,
        education: true,
        professionalInterests: {
          include: { professionalArea: true }
        }
      }
    });

    if (!candidate) {
      return errorResponse('NOT_FOUND', 'Perfil de candidato não encontrado', 404);
    }

    apiLog(req, 200);
    return successResponse(candidate, "Perfil carregado com sucesso");

  } catch (error: any) {
    apiLog(req, 500, error);
    return errorResponse('INTERNAL_ERROR', 'Erro ao carregar perfil', 500);
  }
}

// PATCH Privada (Atualizar perfil do candidato logado)
export async function PATCH(req: NextRequest) {
  if (applyRateLimit(req)) return applyRateLimit(req);

  const auth = await requireRole(req, ['CANDIDATE']);
  if (auth.error) return auth.error;

  try {
    const body = await req.json();
    
    // Validate fields before updating (avoid mass assignment vulnerability)
    const allowedFields = ['phone', 'city', 'professionalObjective'];
    const updateData: any = {};
    
    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    });

    if (Object.keys(updateData).length === 0) {
      return errorResponse('BAD_REQUEST', 'Nenhum dado válido para atualização', 400);
    }

    const candidate = await prisma.candidate.findFirst({
      where: { profileId: auth.profile!.id }
    });

    if (!candidate) {
      return errorResponse('NOT_FOUND', 'Candidato não encontrado', 404);
    }

    const updated = await prisma.candidate.update({
      where: { id: candidate.id },
      data: updateData
    });

    apiLog(req, 200);
    return successResponse(updated, "Perfil atualizado com sucesso");

  } catch (error: any) {
    apiLog(req, 500, error);
    return errorResponse('INTERNAL_ERROR', 'Erro ao atualizar perfil', 500);
  }
}
