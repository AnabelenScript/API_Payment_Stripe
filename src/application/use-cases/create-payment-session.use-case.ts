import { Inject, Injectable } from '@nestjs/common';
import { PaymentGatewayPort, CreateSessionParams } from '../ports/payment-gateway.port';

@Injectable()
export class CreatePaymentSessionUseCase {
  constructor(
    @Inject(PaymentGatewayPort)
    private readonly paymentGateway: PaymentGatewayPort,
  ) {}

  async execute(params: CreateSessionParams): Promise<{ url: string; sessionId: string }> {
    return this.paymentGateway.createCheckoutSession(params);
  }
}
