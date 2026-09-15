import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api/response';
import { applyRateLimit, apiLog } from '@/lib/api/middlewares';
import { requireRole } from '@/lib/api/auth';


// GET Pública (Listar áreas)
export async function GET(req: NextRequest) {
  if (applyRateLimit(req)) return applyRateLimit(req);

  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const skip = (page - 1) * limit;

    const [areas, total] = await Promise.all([
      prisma.professionalArea.findMany({
        where: { active: true },
        skip,
        take: limit,
        orderBy: { name: 'asc' }
      }),
      prisma.professionalArea.count({ where: { active: true } })
    ]);

    apiLog(req, 200);
    return successResponse({
      data: areas,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }, "Áreas listadas com sucesso");

  } catch (error: any) {
    apiLog(req, 500, error);
    return errorResponse('INTERNAL_ERROR', 'Erro interno do servidor', 500);
  }
}

// POST Privada (Admin)
export async function POST(req: NextRequest) {
  if (applyRateLimit(req)) return applyRateLimit(req);

  const auth = await requireRole(req, ['ADMIN']);
  if (auth.error) return auth.error;

  try {
    const body = await req.json();
    const { name, slug, description } = body;

    if (!name || !slug) {
      return errorResponse('VALIDATION_ERROR', 'Name e slug são obrigatórios', 422);
    }

    const area = await prisma.professionalArea.create({
      data: { name, slug, description }
    });

    apiLog(req, 201);
    return successResponse(area, "Área criada com sucesso", 201);
  } catch (error: any) {
    apiLog(req, 500, error);
    return errorResponse('INTERNAL_ERROR', 'Erro ao criar área', 500);
  }
}
