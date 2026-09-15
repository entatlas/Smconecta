'use server';
import { prisma } from '@/lib/prisma';

import { revalidatePath } from 'next/cache';


export async function getFinancialSupportData() {
  const [categories, costCenters, companies] = await Promise.all([
    prisma.financialCategory.findMany({ where: { active: true }, orderBy: { name: 'asc' } }),
    prisma.costCenter.findMany({ where: { active: true }, orderBy: { name: 'asc' } }),
    prisma.company.findMany({ orderBy: { companyName: 'asc' } }),
  ]);

  return { categories, costCenters, companies };
}

export async function createTransaction(data: any) {
  // data should contain type, description, amount, categoryId, dueDate, etc.
  
  // validation
  if (!data.description || !data.amount || !data.categoryId || !data.dueDate) {
    throw new Error('Campos obrigatórios ausentes.');
  }

  const transaction = await prisma.financialTransaction.create({
    data: {
      type: data.type,
      description: data.description,
      amount: parseFloat(data.amount),
      categoryId: data.categoryId,
      costCenterId: data.costCenterId || null,
      companyId: data.companyId || null,
      issueDate: data.issueDate ? new Date(data.issueDate) : new Date(),
      dueDate: new Date(data.dueDate),
      status: data.status || 'PENDING',
      notes: data.notes || null,
      paymentMethod: data.paymentMethod || null,
      auditLogs: {
        create: {
          action: 'CREATED',
          newData: JSON.stringify(data)
        }
      }
    }
  });

  // Revalidate finance routes
  revalidatePath('/admin/financeiro');

  return transaction;
}

export async function markAsPaid(id: string, paidDate: string, paymentMethod: string) {
  const transaction = await prisma.financialTransaction.update({
    where: { id },
    data: {
      status: 'PAID',
      paidAt: new Date(paidDate),
      paymentMethod: paymentMethod || null,
      auditLogs: {
        create: {
          action: 'PAID',
          newData: JSON.stringify({ status: 'PAID', paidAt: paidDate, paymentMethod })
        }
      }
    }
  });

  revalidatePath('/admin/financeiro', 'layout');
  return transaction;
}

export async function cancelTransaction(id: string, reason: string) {
  const transaction = await prisma.financialTransaction.update({
    where: { id },
    data: {
      status: 'CANCELLED',
      cancelledAt: new Date(),
      cancellationReason: reason,
      auditLogs: {
        create: {
          action: 'CANCELLED',
          newData: JSON.stringify({ status: 'CANCELLED', reason })
        }
      }
    }
  });

  revalidatePath('/admin/financeiro', 'layout');
  return transaction;
}
