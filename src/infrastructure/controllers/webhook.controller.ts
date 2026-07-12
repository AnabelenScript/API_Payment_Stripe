import { Controller, Post, Req, Res } from '@nestjs/common';
import { HandleWebhookUseCase } from '../../application/use-cases/handle-webhook.use-case';

@Controller('webhooks')
export class WebhookController {
  constructor(private readonly handleWebhookUseCase: HandleWebhookUseCase) {}

  @Post('stripe')
  async handleStripeWebhook(@Req() req: any, @Res() res: any) {
    const signature = req.headers['stripe-signature'] as string;
    
    if (!signature) {
      return res.status(400).send('Missing stripe-signature header');
    }

    try {
      await this.handleWebhookUseCase.execute(signature, req.rawBody!);
      res.status(200).send('Webhook handled');
    } catch (error) {
      res.status(400).send(`Webhook Error: ${error.message}`);
    }
  }
}
