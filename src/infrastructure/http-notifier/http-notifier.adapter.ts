import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { MainApiNotifierPort, PaymentSuccessPayload } from '../../application/ports/main-api-notifier.port';

@Injectable()
export class HttpMainApiNotifier implements MainApiNotifierPort {
  private readonly logger = new Logger(HttpMainApiNotifier.name);
  private readonly mainApiUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.mainApiUrl = this.configService.get<string>('MAIN_API_URL', 'http://localhost:8080');
  }

  async notifyPaymentSuccess(payload: PaymentSuccessPayload): Promise<void> {
    try {
      const url = `${this.mainApiUrl}/internal/webhooks/payment-success`;
      await firstValueFrom(this.httpService.post(url, payload, {
        headers: {
          'x-api-key': this.configService.get<string>('MAIN_API_KEY', 'default-secret-key'),
        }
      }));
      this.logger.log(`Notified main API for user ${payload.user_id}`);
    } catch (error) {
      this.logger.error(`Failed to notify main API: ${error.message}`);
      throw error;
    }
  }

  async notifySubscriptionDeleted(stripeSubscriptionId: string): Promise<void> {
    try {
      const url = `${this.mainApiUrl}/api/v1/internal/webhooks/subscription-deleted`;
      await firstValueFrom(this.httpService.post(url, { stripeSubscriptionId }, {
        headers: {
          'x-api-key': this.configService.get<string>('MAIN_API_KEY', 'default-secret-key'),
        }
      }));
      this.logger.log(`Notified main API about deleted subscription ${stripeSubscriptionId}`);
    } catch (error) {
      this.logger.error(`Failed to notify main API about deleted subscription: ${error.message}`);
      throw error;
    }
  }
}
