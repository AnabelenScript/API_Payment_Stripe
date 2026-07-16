import { PlanType } from '../../domain/enums/plan.enum';
import { BillingCycle } from '../../domain/enums/billing-cycle.enum';

export interface PaymentSuccessPayload {
  user_id: string;
  plan: PlanType;
  billing_cycle: BillingCycle;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  latest_stripe_payment_intent_id: string;
  paid_at: string;
}

export interface MainApiNotifierPort {
  notifyPaymentSuccess(payload: PaymentSuccessPayload): Promise<void>;
  notifySubscriptionDeleted(stripeSubscriptionId: string): Promise<void>;
}

export const MainApiNotifierPort = Symbol('MainApiNotifierPort');
