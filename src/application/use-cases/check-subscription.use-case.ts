import { Inject, Injectable } from '@nestjs/common';
import { PaymentGatewayPort } from '../ports/payment-gateway.port';

@Injectable()
export class CheckSubscriptionUseCase {
  constructor(
    @Inject(PaymentGatewayPort)
    private readonly paymentGateway: PaymentGatewayPort,
  ) {}

  async execute(userId: string): Promise<any> {
    return this.paymentGateway.getSubscriptionStatusByUserId(userId);
  }
}
