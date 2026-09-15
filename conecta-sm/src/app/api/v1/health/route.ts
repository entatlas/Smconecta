import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api/response';
import { applyRateLimit, apiLog } from '@/lib/api/middlewares';


export async function GET(req: NextRequest) {
  const rateLimitError = applyRateLimit(req);
  if (rateLimitError) return rateLimitError;

  try {
    // Check Database connection
    await prisma.$queryRaw`SELECT 1`;
    
    const responseData = {
      status: "ok",
      database: "ok",
      version: "1.0.0",
      timestamp: new Date().toISOString()
    };

    apiLog(req, 200);
    return successResponse(responseData, "API e Banco de Dados operacionais");
  } catch (error: any) {
    apiLog(req, 500, error);
    return errorResponse('SERVICE_UNAVAILABLE', 'Erro ao conectar com o banco de dados', 500);
  }
}
