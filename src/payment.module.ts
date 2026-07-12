import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

import { PaymentGatewayPort } from './application/ports/payment-gateway.port';
import { MainApiNotifierPort } from './application/ports/main-api-notifier.port';

import { CreatePaymentSessionUseCase } from './application/use-cases/create-payment-session.use-case';
import { HandleWebhookUseCase } from './application/use-cases/handle-webhook.use-case';

import { StripeGatewayAdapter } from './infrastructure/stripe/stripe-gateway.adapter';
import { HttpMainApiNotifier } from './infrastructure/http-notifier/http-notifier.adapter';

import { PaymentController } from './infrastructure/controllers/payment.controller';
import { WebhookController } from './infrastructure/controllers/webhook.controller';

@Module({
  imports: [
    HttpModule,
    ConfigModule,
  ],
  controllers: [
    PaymentController,
    WebhookController,
  ],
  providers: [
    CreatePaymentSessionUseCase,
    HandleWebhookUseCase,
    {
      provide: PaymentGatewayPort,
      useClass: StripeGatewayAdapter,
    },
    {
      provide: MainApiNotifierPort,
      useClass: HttpMainApiNotifier,
    },
  ],
})
export class PaymentModule {}
