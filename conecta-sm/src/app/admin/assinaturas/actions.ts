'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// -- PLANOS --

export async function getSubscriptionPlans() {
  return await prisma.subscriptionPlan.findMany({
    orderBy: { createdAt: 'desc' }
  });
}

export async function upsertSubscriptionPlan(data: any) {
  if (data.id) {
    await prisma.subscriptionPlan.update({
      where: { id: data.id },
      data: {
        name: data.name,
        description: data.description,
        price: parseFloat(data.price),
        interval: data.interval,
        isActive: data.isActive,
        features: data.features // String com benefícios
      }
    });
  } else {
    await prisma.subscriptionPlan.create({
      data: {
        name: data.name,
        description: data.description,
        price: parseFloat(data.price),
        interval: data.interval,
        isActive: data.isActive,
        features: data.features
      }
    });
  }
  revalidatePath('/admin/assinaturas');
}

export async function togglePlanStatus(id: string, currentStatus: boolean) {
  await prisma.subscriptionPlan.update({
    where: { id },
    data: { isActive: !currentStatus }
  });
  revalidatePath('/admin/assinaturas');
}

export async function deletePlan(id: string) {
  await prisma.subscriptionPlan.delete({ where: { id } });
  revalidatePath('/admin/assinaturas');
}

// -- SERVIÇOS AVULSOS --

export async function getCommercialServices() {
  return await prisma.commercialService.findMany({
    orderBy: { createdAt: 'desc' }
  });
}

export async function upsertCommercialService(data: any) {
  if (data.id) {
    await prisma.commercialService.update({
      where: { id: data.id },
      data: {
        type: data.type,
        name: data.name,
        description: data.description,
        price: data.price ? parseFloat(data.price) : null,
        status: data.status
      }
    });
  } else {
    await prisma.commercialService.create({
      data: {
        type: data.type,
        name: data.name,
        description: data.description,
        price: data.price ? parseFloat(data.price) : null,
        status: data.status
      }
    });
  }
  revalidatePath('/admin/assinaturas');
}

export async function deleteCommercialService(id: string) {
  await prisma.commercialService.delete({ where: { id } });
  revalidatePath('/admin/assinaturas');
}
