import { Body, Controller, Post, Get, Param } from '@nestjs/common';
import { CreatePaymentSessionUseCase } from '../../application/use-cases/create-payment-session.use-case';
import { CheckSubscriptionUseCase } from '../../application/use-cases/check-subscription.use-case';
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
  constructor(
    private readonly createPaymentSessionUseCase: CreatePaymentSessionUseCase,
    private readonly checkSubscriptionUseCase: CheckSubscriptionUseCase,
  ) {}

  @Post('create-session')
  async createSession(@Body() body: CreateSessionDto) {
    return this.createPaymentSessionUseCase.execute(body);
  }

  @Get('subscription-status/:userId')
  async getSubscriptionStatus(@Param('userId') userId: string) {
    return this.checkSubscriptionUseCase.execute(userId);
  }
}
