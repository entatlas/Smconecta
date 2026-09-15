import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api/response';
import { applyRateLimit, apiLog } from '@/lib/api/middlewares';


// GET Pública (Listar Vagas com paginação e filtros)
export async function GET(req: NextRequest) {
  if (applyRateLimit(req)) return applyRateLimit(req);

  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'ACTIVE';
    
    const skip = (page - 1) * limit;

    const whereClause: any = {
      status,
    };

    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          company: {
            select: { id: true, companyName: true, tradeName: true, city: true, state: true }
          }
        }
      }),
      prisma.job.count({ where: whereClause })
    ]);

    apiLog(req, 200);
    return successResponse({
      data: jobs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }, "Vagas listadas com sucesso");

  } catch (error: any) {
    apiLog(req, 500, error);
    return errorResponse('INTERNAL_ERROR', 'Erro ao listar vagas', 500);
  }
}
