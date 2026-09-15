import { NextRequest } from 'next/server';
import { errorResponse } from './response';

// Simples Rate Limiter em memória para fins arquiteturais (Map não sobrevive a reinicializações Serverless)
// Ideal: Redis ou Upstash no futuro.
const rateLimitMap = new Map<string, { count: number, resetAt: number }>();
const MAX_REQUESTS = 60; // Limite por IP por janela
const WINDOW_MS = 60000; // 1 minuto

export function applyRateLimit(req: NextRequest) {
  // Coletar IP do Header. Em Next.js na Vercel/Supabase, x-forwarded-for é comum.
  const ip = req.headers.get('x-forwarded-for') || 'unknown';

  const now = Date.now();
  const windowData = rateLimitMap.get(ip);

  if (!windowData) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return null; // OK
  }

  if (now > windowData.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return null; // OK
  }

  if (windowData.count >= MAX_REQUESTS) {
    return errorResponse('TOO_MANY_REQUESTS', 'Limite de requisições excedido. Tente novamente mais tarde.', 429);
  }

  windowData.count++;
  return null; // OK
}

// Log básico
export function apiLog(req: NextRequest, status: number = 200, error?: any) {
  const method = req.method;
  const url = req.url;
  const requestId = req.headers.get('x-request-id') || 'gen-' + Math.random().toString(36).substring(7);
  
  // Em produção, isso iria para o DataDog, AWS CloudWatch ou pino logger.
  console.log(`[API] ${method} ${url} - Status: ${status} - RequestID: ${requestId}`, error ? error : '');
}
