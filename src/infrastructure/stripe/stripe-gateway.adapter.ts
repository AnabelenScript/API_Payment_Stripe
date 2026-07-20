import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PaymentGatewayPort, CreateSessionParams } from '../../application/ports/payment-gateway.port';

@Injectable()
export class StripeGatewayAdapter implements PaymentGatewayPort {
  private readonly stripe: Stripe;
  private readonly webhookSecret: string;
  private readonly logger = new Logger(StripeGatewayAdapter.name);

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    this.webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET', 'whsec_test');
    
    if (!apiKey) {
      this.logger.warn('STRIPE_SECRET_KEY is not defined in environment variables');
    }

    this.stripe = new Stripe(apiKey || 'sk_test_mock', {
      apiVersion: '2026-06-24.dahlia' as any,
    });
  }

  async createCheckoutSession(params: CreateSessionParams): Promise<{ url: string; sessionId: string }> {
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription', // Using subscription for recurring plans
      line_items: [
        {
          price: params.stripePriceId,
          quantity: 1,
        },
      ],
      metadata: {
        userId: params.userId,
        plan: params.plan,
        billingCycle: params.billingCycle,
      },
      subscription_data: {
        metadata: {
          userId: params.userId,
          plan: params.plan,
          billingCycle: params.billingCycle,
        }
      },
      success_url: this.configService.get<string>('SUCCESS_URL', 'http://localhost:3000/success'),
      cancel_url: this.configService.get<string>('CANCEL_URL', 'http://localhost:3000/cancel'),
    });

    return { url: session.url || '', sessionId: session.id };
  }

  constructEventFromPayload(signature: string, payload: Buffer): any {
    return this.stripe.webhooks.constructEvent(payload, signature, this.webhookSecret);
  }

  async getSubscriptionStatusByUserId(userId: string): Promise<any> {
    this.logger.log(`Querying Stripe for active subscriptions of user: ${userId}`);
    const subscriptions = await this.stripe.subscriptions.search({
      query: `metadata['userId']:'${userId}' AND status:'active'`,
      limit: 1,
      expand: ['data.latest_invoice.payment_intent'],
    });

    this.logger.log(`Stripe returned ${subscriptions.data.length} active subscriptions for user ${userId}`);

    if (subscriptions.data.length > 0) {
      const sub = subscriptions.data[0];
      const latestInvoice = sub.latest_invoice as any;
      const paymentIntentId = latestInvoice?.payment_intent?.id || '';

      return {
        hasActiveSubscription: true,
        user_id: sub.metadata.userId,
        plan: sub.metadata.plan,
        billing_cycle: sub.metadata.billingCycle,
        stripe_customer_id: sub.customer as string,
        stripe_subscription_id: sub.id,
        latest_stripe_payment_intent_id: paymentIntentId,
        paid_at: new Date(((sub as any).current_period_start || (sub as any).created || Math.floor(Date.now() / 1000)) * 1000).toISOString(),
      };
    }

    return { hasActiveSubscription: false };
  }
}
