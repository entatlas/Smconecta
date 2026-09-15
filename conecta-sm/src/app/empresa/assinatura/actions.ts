'use server'

import { prisma } from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';

export async function getCurrentPlan() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const profile = await prisma.profile.findUnique({
    where: { auth_user_id: user.id },
    include: { companyProfile: true }
  });

  if (!profile || !profile.companyProfile) {
    if (profile?.tipo === 'ADMIN') return 'plan_free'; // Admin fallbacks to free
    return null;
  }

  if (profile.companyProfile.subscriptionStatus === 'ACTIVE') {
    // Busca assinatura ativa real
    const sub = await prisma.subscription.findFirst({
      where: { company: { id: profile.companyProfile.id }, status: 'ACTIVE' },
      include: { plan: true }
    })
    if (sub?.plan) return sub.plan.id
    return null
  }

  return 'plan_free'
}

import { cache } from 'react';

export const getAvailablePlans = cache(async () => {
  const plans = await prisma.subscriptionPlan.findMany({
    where: { isActive: true },
    orderBy: { price: 'asc' }
  })
  
  return plans.map(p => ({
    id: p.id,
    name: p.name,
    description: p.description,
    price: p.price,
    interval: p.interval,
    features: p.features ? JSON.parse(p.features) : { maxJobs: 1, canViewTalents: false }
  }))
})

export async function cancelSubscription() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const profile = await prisma.profile.findUnique({
    where: { auth_user_id: user.id },
    include: { companyProfile: true }
  });

  if (!profile || !profile.companyProfile) {
    if (profile?.tipo === 'ADMIN') return true;
    throw new Error('Forbidden');
  }

  // Em produção, aqui teria a chamada para a API do Mercado Pago para cancelar a assinatura:
  // await preference.cancel({ id: profile.companyProfile.subscriptionId })

  // Atualizar banco local
  await prisma.company.update({
    where: { id: profile.companyProfile.id },
    data: { subscriptionStatus: 'CANCELED' }
  });

  return true;
}

export async function createMercadoPagoCheckout(planId: string) {
  // 1. Validar Autenticação da Empresa
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const profile = await prisma.profile.findUnique({
    where: { auth_user_id: user.id },
    include: { companyProfile: true }
  });

  if (!profile) throw new Error('Forbidden');

  if (!profile.companyProfile) throw new Error('Empresa não encontrada');
  const companyId = profile.companyProfile.id;

  const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } })
  if (!plan) throw new Error('Plano inválido')

  // 3. Montar o Payload para o Mercado Pago
  // Aqui você deve usar o SDK do Mercado Pago ou fazer um fetch para a API deles.
  /*
  EXEMPLO DE COMO FAZER COM O SDK:
  
  import { MercadoPagoConfig, Preference } from 'mercadopago';
  
  const client = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN! });
  const preference = new Preference(client);

  const response = await preference.create({
    body: {
      items: [
        {
          id: planId,
          title: plan.title,
          quantity: 1,
          unit_price: plan.price,
          currency_id: 'BRL',
        }
      ],
      payer: {
        email: profile.email,
        name: profile.nome,
      },
      external_reference: profile.companyProfile.id, // IMPORTANTE: Passar o ID da empresa aqui para o webhook identificar quem pagou!
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_SITE_URL}/empresa/dashboard?payment=success`,
        failure: `${process.env.NEXT_PUBLIC_SITE_URL}/empresa/dashboard?payment=failure`,
        pending: `${process.env.NEXT_PUBLIC_SITE_URL}/empresa/dashboard?payment=pending`,
      },
      auto_return: 'approved',
      notification_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhooks/mercadopago`
    }
  });

  return response.init_point; // URL de pagamento
  */

  console.log(`Criando preferência para o plano ${plan.name} (R$${plan.price}) para a empresa ${companyId}`);
  
  // Como não temos a chave configurada no momento, atualizamos o status diretamente.
  // Em produção, isso deve ser substituído pelo SDK do MercadoPago.
  
    await prisma.company.update({
      where: { id: companyId },
      data: { subscriptionStatus: 'ACTIVE' }
    });

  return '/empresa/assinatura?payment=success';
}
