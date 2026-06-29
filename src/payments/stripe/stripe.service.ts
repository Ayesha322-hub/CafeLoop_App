import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
      apiVersion: '2023-10-16',

    });
  }

  // ── Create PaymentIntent ─────────────────────────────────────
  // Call this BEFORE placing the order. Mobile SDK confirms payment.
  async createPaymentIntent(amount: number, orderId: string, userId: string) {
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe uses smallest unit (paisas for PKR)
      currency: 'pkr',
      metadata: { orderId, userId },
      automatic_payment_methods: { enabled: true },
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  }

  // ── Verify Webhook Signature ─────────────────────────────────
  constructWebhookEvent(payload: Buffer, signature: string) {
    return this.stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET ?? '',
    );
  }
}
