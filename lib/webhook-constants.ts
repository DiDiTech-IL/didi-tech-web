import z from "zod";

// Available webhook events with descriptions
export const WEBHOOK_EVENTS = {
  'payment.completed': 'Payment successfully processed',
  'payment.failed': 'Payment failed or was declined',
  'subscription.created': 'New subscription was created',
  'subscription.updated': 'Subscription was modified',
  'subscription.cancelled': 'Subscription was cancelled',
  'customer.created': 'New customer account created',
  'customer.updated': 'Customer information updated',
  'invoice.created': 'New invoice generated',
  'invoice.paid': 'Invoice was paid',
  'trial.started': 'Trial period started',
  'trial.ending': 'Trial period ending soon',
  'trial.ended': 'Trial period ended',
  'product.activated': 'Product access activated',
  'product.deactivated': 'Product access deactivated',
  'refund.processed': 'Refund was processed',
} as const;

export type WebhookEvent = keyof typeof WEBHOOK_EVENTS;


export interface WebhookPayload {
  planSelection: string;
  originUrl: string;
  destinationUrl: string;
  clientData: {
    email: string;
    companyName: string;
    fullName: string;
    phone?: string;
    subdomain: string;
  };
  paymentData: {
    transactionId: string;
    amount: number;
    currency: string;
    status: 'completed' | 'failed' | 'pending';
  };
  productName: string;
  webhookKey: string;
}

export interface WebhookResponse {
  success: boolean;
  message: string;
  data?: {
    accountId?: string;
    subdomainUrl?: string;
    adminCredentials?: {
      email: string;
      temporaryPassword: string;
    };
  };
  error?: {
    code: string;
    details: string;
  };
}

// Schema for Tachles webhook payload (updated with phone)
export const tachlesWebhookSchema = z.object({
  event: z.enum(["domain.activated", "domain.suspended", "domain.cancelled"]),
  leadId: z.string(),
  tachlesCustomerId: z.string(),
  domainInfo: z.object({
    subdomain: z.string(),
    organizationName: z.string(),
    contactEmail: z.string(),
    contactName: z.string(),
    contactPhone: z.string().optional(), // Customer's phone number
    subscriptionPlan: z.enum(["BASIC", "ADVANCED", "ENTERPRISE"]),
  }),
  timestamp: z.string(),
  signature: z.string(), // For webhook verification
});

// Types for outgoing webhook payloads
export type UserCreatedWebhookPayload = {
  event: "user.created";
  leadId: string;
  tachlesCustomerId: string;
  userInfo: {
    subdomain: string;
    domainUrl: string;
    email: string;
    temporaryPassword: string;
    activationRequired: boolean;
  };
  timestamp: string;
  signature: string;
};

export type UserActivatedWebhookPayload = {
  event: "user.activated";
  leadId: string;
  tachlesCustomerId: string;
  activationInfo: {
    subdomain: string;
    activatedAt: string;
    firstLoginCompleted: boolean;
  };
  timestamp: string;
  signature: string;
};
