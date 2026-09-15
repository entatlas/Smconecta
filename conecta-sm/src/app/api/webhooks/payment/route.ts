import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Rota genérica para Webhooks de Pagamento (Stripe, Pagar.me, etc)
// Futuramente, você vai plugar o SDK do Stripe ou do Pagar.me aqui
export async function POST(req: Request) {
  try {
    // 1. Obter o payload do webhook
    const body = await req.text();
    
    // 2. Verificar a assinatura do webhook (Segurança)
    // const signature = req.headers.get('stripe-signature') ou 'x-pagarme-signature';
    // const event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
    
    // SIMULAÇÃO DE EVENTO (Remover depois e usar o evento real do Gateway)
    const event = JSON.parse(body);

    switch (event.type) {
      case 'checkout.session.completed':
      case 'subscription.created': {
        // Exemplo: O pagamento inicial foi concluído!
        const subscriptionId = event.data.object.subscription;
        const customerId = event.data.object.customer;
        // Atualizar o banco de dados
        console.log(`Assinatura ${subscriptionId} criada com sucesso.`);
        break;
      }
      
      case 'invoice.payment_succeeded': {
        // Exemplo: Renovação mensal bem-sucedida!
        const subscriptionId = event.data.object.subscription;
        
        await prisma.subscription.updateMany({
          where: { gatewaySubId: subscriptionId },
          data: { status: 'ACTIVE' },
        });
        
        // Também pode atualizar o subscriptionStatus do candidato se quiser centralizar
        // Mas o mais fácil é o middleware ler o status da assinatura
        console.log(`Pagamento da assinatura ${subscriptionId} recebido.`);
        break;
      }

      case 'invoice.payment_failed': {
        // Exemplo: Cartão recusado na renovação
        const subscriptionId = event.data.object.subscription;
        
        // Colocamos PAST_DUE (Período de tolerância). 
        // O usuário pediu para considerar dias de tolerância.
        await prisma.subscription.updateMany({
          where: { gatewaySubId: subscriptionId },
          data: { status: 'PAST_DUE' },
        });
        
        console.log(`Pagamento falhou para a assinatura ${subscriptionId}.`);
        break;
      }

      case 'customer.subscription.deleted': {
        // Exemplo: Assinatura cancelada (churn)
        const subscriptionId = event.data.object.id;
        
        await prisma.subscription.updateMany({
          where: { gatewaySubId: subscriptionId },
          data: { 
            status: 'CANCELED',
            canceledAt: new Date()
          },
        });
        
        console.log(`Assinatura ${subscriptionId} foi cancelada.`);
        break;
      }
      
      default:
        console.log(`Evento não tratado: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Erro no Webhook de Pagamento:', error.message);
    return NextResponse.json({ error: 'Webhook Handler failed' }, { status: 400 });
  }
}
