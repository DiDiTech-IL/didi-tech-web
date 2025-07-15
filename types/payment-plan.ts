// types/payment-plan.ts
export interface PaymentPlan {
  id: string;
  name: string;
  description?: string;
  planType: 'ONE_TIME' | 'RECURRING' | 'FREEMIUM' | 'TRIAL';
  price: number;
  currency: 'ILS' | 'EUR' | 'GBP' | 'ILS' | 'CAD' | 'AUD';
  billingInterval: 'MONTHLY' | 'YEARLY' | 'QUARTERLY' | 'WEEKLY' | 'ONE_TIME';
  trialDays?: number;
  features: string[];
  userLimit?: number;
  storageLimit?: number;
  apiCallsLimit?: number;
  discountPercentage?: number;
  discountValidUntil?: string; // ISO string for serialization
  isPopular?: boolean;
  isActive: boolean;
  displayOrder: number;
}
