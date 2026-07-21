import { Inject, Injectable } from '@nestjs/common';
import { PaymentGatewayPort } from '../ports/payment-gateway.port';

@Injectable()
export class CancelSubscriptionUseCase {
  constructor(
    @Inject(PaymentGatewayPort)
    private readonly paymentGateway: PaymentGatewayPort,
  ) {}

  async execute(stripeSubscriptionId: string, cancelAtPeriodEnd: boolean = true): Promise<any> {
    return this.paymentGateway.cancelSubscription(stripeSubscriptionId, cancelAtPeriodEnd);
  }
}
