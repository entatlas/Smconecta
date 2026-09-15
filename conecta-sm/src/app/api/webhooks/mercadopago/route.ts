import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    console.log('[MERCADOPAGO_WEBHOOK]', body)

    // O MercadoPago envia eventos diferentes (payment, plan, subscription, etc.)
    // Vamos focar no básico: quando um pagamento é criado/aprovado.
    // Em produção, você deve verificar a assinatura do webhook (Signature) para garantir que veio do Mercado Pago!

    if (body.type === 'payment') {
      const paymentId = body.data.id
      
      // MOCK: Em produção, você faria um fetch para a API do Mercado Pago usando o paymentId 
      // para pegar o `external_reference` (que é o ID da Empresa) e o `status` (ex: 'approved').
      
      /*
      import { MercadoPagoConfig, Payment } from 'mercadopago';
      const client = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN! });
      const paymentAPI = new Payment(client);
      const paymentInfo = await paymentAPI.get({ id: paymentId });
      
      if (paymentInfo.status === 'approved' && paymentInfo.external_reference) {
         await prisma.company.update({
            where: { id: paymentInfo.external_reference },
            data: { subscriptionStatus: 'ACTIVE' }
         })
      }
      */
      
      // Neste momento, estamos apenas recebendo o ping do MercadoPago
    }

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 400 })
  }
}
