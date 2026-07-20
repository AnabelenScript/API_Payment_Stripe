import { PlanType } from '../../domain/enums/plan.enum';
import { BillingCycle } from '../../domain/enums/billing-cycle.enum';

export interface CreateSessionParams {
  userId: string;
  plan: PlanType;
  billingCycle: BillingCycle;
  stripePriceId: string;
}

export interface PaymentGatewayPort {
  createCheckoutSession(params: CreateSessionParams): Promise<{ url: string; sessionId: string }>;
  constructEventFromPayload(signature: string, payload: Buffer): any;
  getSubscriptionStatusByUserId(userId: string): Promise<any>;
}

export const PaymentGatewayPort = Symbol('PaymentGatewayPort');
