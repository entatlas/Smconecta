'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getEmailTemplates() {
  return await prisma.emailTemplate.findMany({
    orderBy: { createdAt: 'desc' }
  });
}

export async function saveEmailTemplate(data: { id?: string, name: string, subject: string, body: string }) {
  try {
    if (data.id) {
      await prisma.emailTemplate.update({
        where: { id: data.id },
        data: { name: data.name, subject: data.subject, body: data.body }
      });
    } else {
      await prisma.emailTemplate.create({
        data: { name: data.name, subject: data.subject, body: data.body }
      });
    }
    revalidatePath('/admin/configuracoes/emails');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteEmailTemplate(id: string) {
  try {
    await prisma.emailTemplate.delete({ where: { id } });
    revalidatePath('/admin/configuracoes/emails');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
