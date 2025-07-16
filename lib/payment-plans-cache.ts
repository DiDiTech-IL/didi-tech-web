import { cache } from 'react';
import { getPaymentPlans as _getPaymentPlans, getAllPaymentPlans as _getAllPaymentPlans } from '@/app/dashboard/products/actions';
import type { PaymentPlan } from '@/types/payment-plan';

// Deduplicated version of getPaymentPlans using React's cache
export const getPaymentPlans = cache(_getPaymentPlans);

// Deduplicated version of getAllPaymentPlans using React's cache
export const getAllPaymentPlans = cache(_getAllPaymentPlans);

// Request deduplication for the same product ID within the same render cycle
const requestCache = new Map<string, Promise<PaymentPlan[]>>();

export function dedupedGetPaymentPlans(productId: string) {
  const cacheKey = `payment-plans-${productId}`;
  
  if (requestCache.has(cacheKey)) {
    return requestCache.get(cacheKey)!;
  }
  
  const promise = getPaymentPlans(productId);
  requestCache.set(cacheKey, promise);
  
  // Clear the cache after the request completes
  promise.finally(() => {
    requestCache.delete(cacheKey);
  });
  
  return promise;
}
