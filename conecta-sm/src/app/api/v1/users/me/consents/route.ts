import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api/response';
import { applyRateLimit, apiLog } from '@/lib/api/middlewares';
import { requireAuth } from '@/lib/api/auth';
import { logAuditAction } from '@/lib/api/audit';


// POST Privada (Salvar aceite de LGPD)
export async function POST(req: NextRequest) {
  if (applyRateLimit(req)) return applyRateLimit(req);

  const auth = await requireAuth(req);
  if (auth.error) return auth.error;

  try {
    const body = await req.json();
    const { documentType, version, accepted } = body;

    if (!documentType || !version || accepted === undefined) {
      return errorResponse('VALIDATION_ERROR', 'Campos documentType, version e accepted são obrigatórios', 422);
    }

    const consent = await prisma.userConsent.create({
      data: {
        profileId: auth.profile!.id,
        documentType,
        version,
        accepted,
        ipAddress: req.headers.get('x-forwarded-for') || null,
        userAgent: req.headers.get('user-agent') || null,
      }
    });

    await logAuditAction({
      profileId: auth.profile!.id,
      action: 'CONSENT_RECORDED',
      entityType: 'USER_CONSENT',
      entityId: consent.id,
      newData: { documentType, version, accepted },
      req
    });

    apiLog(req, 201);
    return successResponse(consent, "Consentimento registrado com sucesso", 201);

  } catch (error: any) {
    apiLog(req, 500, error);
    return errorResponse('INTERNAL_ERROR', 'Erro ao salvar consentimento', 500);
  }
}
