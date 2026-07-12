import { Inject, Injectable, Logger } from '@nestjs/common';
import { PaymentGatewayPort } from '../ports/payment-gateway.port';
import { MainApiNotifierPort } from '../ports/main-api-notifier.port';

@Injectable()
export class HandleWebhookUseCase {
  private readonly logger = new Logger(HandleWebhookUseCase.name);

  constructor(
    @Inject(PaymentGatewayPort)
    private readonly paymentGateway: PaymentGatewayPort,
    @Inject(MainApiNotifierPort)
    private readonly mainApiNotifier: MainApiNotifierPort,
  ) {}

  async execute(signature: string, payload: Buffer): Promise<void> {
    try {
      const event = this.paymentGateway.constructEventFromPayload(signature, payload);

      if (event.type === 'checkout.session.completed') {
        const session = event.data.object as any;
        
        // Ensure the payment was actually successful
        if (session.payment_status === 'paid') {
          const metadata = session.metadata;
          
          await this.mainApiNotifier.notifyPaymentSuccess({
            user_id: metadata.userId,
            plan: metadata.plan,
            billing_cycle: metadata.billingCycle,
            stripe_customer_id: session.customer,
            stripe_subscription_id: session.subscription || '',
            latest_stripe_payment_intent_id: session.payment_intent || '',
            paid_at: new Date().toISOString(),
          });
          
          this.logger.log(`Successfully processed payment for user ${metadata.userId}`);
        }
      }
    } catch (error) {
      this.logger.error(`Error processing webhook: ${error.message}`, error.stack);
      throw error;
    }
  }
}
