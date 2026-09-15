import React from 'react';
import { prisma } from '@/lib/prisma';
import AdminAssinaturasClient from './ClientPage';

export default async function AdminAssinaturasPage() {
  // Buscar os dados
  const subscriptions = await prisma.subscription.findMany({
    include: {
      candidate: {
        include: { profile: true }
      },
      company: true,
      plan: true,
    },
    orderBy: { createdAt: 'desc' }
  });

  const plans = await prisma.subscriptionPlan.findMany({
    orderBy: { createdAt: 'desc' }
  });

  const services = await prisma.commercialService.findMany({
    orderBy: { createdAt: 'desc' }
  });

  // Métricas Simuladas
  const activeCount = subscriptions.filter(s => s.status === 'ACTIVE' || s.status === 'TRIALING').length;
  const canceledCount = subscriptions.filter(s => s.status === 'CANCELED').length;
  
  const mrr = subscriptions
    .filter(s => s.status === 'ACTIVE')
    .reduce((acc, sub) => acc + (sub.plan.price), 0);

  return (
    <AdminAssinaturasClient 
      subscriptions={subscriptions}
      plans={plans}
      services={services}
      mrr={mrr}
      activeCount={activeCount}
      canceledCount={canceledCount}
    />
  );
}

