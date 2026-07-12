import { Body, Controller, Post } from '@nestjs/common';
import { CreatePaymentSessionUseCase } from '../../application/use-cases/create-payment-session.use-case';
import { PlanType } from '../../domain/enums/plan.enum';
import { BillingCycle } from '../../domain/enums/billing-cycle.enum';

export class CreateSessionDto {
  userId: string;
  plan: PlanType;
  billingCycle: BillingCycle;
  stripePriceId: string;
}

@Controller('payments')
export class PaymentController {
  constructor(private readonly createPaymentSessionUseCase: CreatePaymentSessionUseCase) {}

  @Post('create-session')
  async createSession(@Body() body: CreateSessionDto) {
    return this.createPaymentSessionUseCase.execute(body);
  }
}
