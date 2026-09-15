import { prisma } from '@/lib/prisma';
import crypto from 'crypto';


// Maximum retries for webhook failure
const MAX_ATTEMPTS = 3;

/**
 * Dispatches an event to all registered and active webhooks.
 * This function should ideally be called asynchronously (without await) 
 * so it doesn't block the API response.
 */
export async function dispatchWebhook(event: string, payload: any) {
  try {
    const webhooks = await prisma.webhook.findMany({
      where: { active: true, events: { has: event } }
    });

    if (webhooks.length === 0) return;

    const payloadString = JSON.stringify(payload);

    // Creates the delivery records and triggers the requests
    const promises = webhooks.map(async (webhook) => {
      const delivery = await prisma.webhookDelivery.create({
        data: {
          webhookId: webhook.id,
          event,
          payload: payloadString,
          status: 'PENDING',
          attempts: 0
        }
      });

      // Dispatch non-blocking fetch
      return deliverWebhook(delivery.id, webhook.url, webhook.secret, payloadString, 1);
    });

    await Promise.allSettled(promises);
  } catch (error) {
    console.error(`Error dispatching webhook event ${event}:`, error);
  }
}

/**
 * Handles the actual HTTP request to the target URL.
 */
async function deliverWebhook(deliveryId: string, url: string, secret: string | null, payloadString: string, attempt: number) {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'ConectaSM-Webhook/1.0',
    };

    if (secret) {
      // Signature for verification on the receiver side
      const signature = crypto.createHmac('sha256', secret).update(payloadString).digest('hex');
      headers['X-Conecta-Signature'] = signature;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: payloadString,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const responseBody = await response.text();
    const success = response.ok;

    await prisma.webhookDelivery.update({
      where: { id: deliveryId },
      data: {
        status: success ? 'DELIVERED' : (attempt >= MAX_ATTEMPTS ? 'FAILED' : 'PENDING'),
        attempts: attempt,
        responseCode: response.status,
        responseBody: responseBody.substring(0, 1000), // Trim to avoid huge logs
        deliveredAt: success ? new Date() : null
      }
    });

    // Simple Retry Mechanism if not ok and attempts < MAX
    if (!success && attempt < MAX_ATTEMPTS) {
      // Wait for a backoff time (e.g. 5 seconds * attempt)
      setTimeout(() => {
        deliverWebhook(deliveryId, url, secret, payloadString, attempt + 1);
      }, 5000 * attempt);
    }

  } catch (error: any) {
    console.error(`Webhook delivery ${deliveryId} failed:`, error.message);
    
    await prisma.webhookDelivery.update({
      where: { id: deliveryId },
      data: {
        status: attempt >= MAX_ATTEMPTS ? 'FAILED' : 'PENDING',
        attempts: attempt,
        responseCode: 0,
        responseBody: error.message
      }
    });

    if (attempt < MAX_ATTEMPTS) {
      setTimeout(() => {
        deliverWebhook(deliveryId, url, secret, payloadString, attempt + 1);
      }, 5000 * attempt);
    }
  }
}
