import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';


interface AuditLogOptions {
  profileId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  oldData?: any;
  newData?: any;
  metadata?: any;
  req?: NextRequest;
}

/**
 * Registra uma ação no sistema para auditoria (Prompt 12).
 * Captura automaticamente IP, UserAgent e Request ID se a requisição for fornecida.
 */
export async function logAuditAction(options: AuditLogOptions) {
  try {
    let ipAddress: string | null = null;
    let userAgent: string | null = null;
    let requestId: string | null = null;

    if (options.req) {
      ipAddress = options.req.headers.get('x-forwarded-for') || null;
      userAgent = options.req.headers.get('user-agent') || null;
      requestId = options.req.headers.get('x-request-id') || null;
    }

    await prisma.auditLog.create({
      data: {
        profileId: options.profileId,
        action: options.action,
        entityType: options.entityType,
        entityId: options.entityId,
        oldData: options.oldData ? JSON.stringify(options.oldData) : null,
        newData: options.newData ? JSON.stringify(options.newData) : null,
        metadata: options.metadata ? JSON.stringify(options.metadata) : null,
        ipAddress,
        userAgent,
        requestId,
      }
    });
  } catch (error) {
    console.error('Failed to write audit log:', error);
    // Silent fail in production to not break the main flow due to logging errors
  }
}
