"use server";

// Payment Plans Server Actions
// 
// This module uses a "Pure Optimistic UI" approach to avoid endless request loops:
// - NO automatic revalidation calls (no revalidatePath/revalidateTag)
// - Client components handle optimistic updates for immediate UI feedback
// - Server data is only refreshed on page navigation or manual refresh
// - Reduces server load and eliminates revalidation-induced infinite loops

import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { unstable_cache } from 'next/cache';
import type { PaymentPlan } from '@/types/payment-plan';

interface CreatePlanData {
  name: string;
  description?: string;
  planType: PaymentPlan['planType'];
  price: number;
  currency: PaymentPlan['currency'];
  billingInterval: PaymentPlan['billingInterval'];
  trialDays?: number;
  features: string[];
  userLimit?: number;
  storageLimit?: number;
  apiCallsLimit?: number;
  discountPercentage?: number;
  discountValidUntil?: string;
  isPopular: boolean;
  isActive: boolean;
  displayOrder: number;
}

// Cache for payment plans to avoid repeated database calls
const getCachedPaymentPlans = unstable_cache(
  async (productId: string, userId: string) => {
    const product = await prisma.product.findFirst({
      where: { 
        id: productId,
        ownerId: userId 
      },
      include: {
        paymentPlans: {
          orderBy: { displayOrder: 'asc' }
        }
      },
    });

    if (!product) {
      return [];
    }

    return product.paymentPlans.map(plan => ({
      id: plan.id,
      name: plan.name,
      description: plan.description || undefined,
      planType: plan.planType as PaymentPlan['planType'],
      price: Number(plan.price),
      currency: plan.currency as PaymentPlan['currency'],
      billingInterval: plan.billingInterval as PaymentPlan['billingInterval'],
      trialDays: plan.trialDays || undefined,
      features: plan.features,
      userLimit: plan.userLimit || undefined,
      storageLimit: plan.storageLimit || undefined,
      apiCallsLimit: plan.apiCallsLimit || undefined,
      discountPercentage: plan.discountPercentage ? Number(plan.discountPercentage) : undefined,
      discountValidUntil: plan.discountValidUntil?.toISOString(),
      isPopular: plan.isPopular || false,
      isActive: plan.isActive,
      displayOrder: plan.displayOrder,
    }));
  },
  ['payment-plans'],
  {
    revalidate: 60, // Cache for 1 minute
    tags: ['payment-plans']
  }
);

// Batch load all payment plans for multiple products
export async function getAllPaymentPlans(productIds: string[]): Promise<Record<string, PaymentPlan[]>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return {};
    }

    // Single database query to get all products and their payment plans
    const products = await prisma.product.findMany({
      where: { 
        id: { in: productIds },
        ownerId: userId 
      },
      include: {
        paymentPlans: {
          orderBy: { displayOrder: 'asc' }
        }
      },
    });

    // Transform into the expected format
    const result: Record<string, PaymentPlan[]> = {};
    
    products.forEach(product => {
      result[product.id] = product.paymentPlans.map(plan => ({
        id: plan.id,
        name: plan.name,
        description: plan.description || undefined,
        planType: plan.planType as PaymentPlan['planType'],
        price: Number(plan.price),
        currency: plan.currency as PaymentPlan['currency'],
        billingInterval: plan.billingInterval as PaymentPlan['billingInterval'],
        trialDays: plan.trialDays || undefined,
        features: plan.features,
        userLimit: plan.userLimit || undefined,
        storageLimit: plan.storageLimit || undefined,
        apiCallsLimit: plan.apiCallsLimit || undefined,
        discountPercentage: plan.discountPercentage ? Number(plan.discountPercentage) : undefined,
        discountValidUntil: plan.discountValidUntil?.toISOString(),
        isPopular: plan.isPopular || false,
        isActive: plan.isActive,
        displayOrder: plan.displayOrder,
      }));
    });

    return result;
  } catch (error) {
    console.error('Failed to fetch all payment plans:', error);
    return {};
  }
}

export async function getPaymentPlans(productId: string): Promise<PaymentPlan[]> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return [];
    }

    return await getCachedPaymentPlans(productId, userId);
  } catch (error) {
    console.error('Failed to fetch payment plans:', error);
    return [];
  }
}

export async function createPaymentPlan(productId: string, data: CreatePlanData) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error('Unauthorized');
    }

    // Verify product ownership
    const product = await prisma.product.findFirst({
      where: { 
        id: productId,
        ownerId: userId
      }
    });

    if (!product) {
      throw new Error('Product not found or access denied');
    }

    // Get next display order
    const maxOrder = await prisma.paymentPlan.aggregate({
      where: { productId },
      _max: { displayOrder: true }
    });

    const newPlan = await prisma.paymentPlan.create({
      data: {
        productId,
        name: data.name,
        description: data.description,
        planType: data.planType,
        price: data.price,
        currency: data.currency,
        billingInterval: data.billingInterval,
        trialDays: data.trialDays || null,
        features: data.features,
        userLimit: data.userLimit || null,
        storageLimit: data.storageLimit || null,
        apiCallsLimit: data.apiCallsLimit || null,
        discountPercentage: data.discountPercentage || null,
        discountValidUntil: data.discountValidUntil ? new Date(data.discountValidUntil) : null,
        isPopular: data.isPopular,
        isActive: data.isActive,
        displayOrder: data.displayOrder || (maxOrder._max.displayOrder || 0) + 1,
      }
    });

    // NO REVALIDATION - Let optimistic UI handle everything
    // Data will be fresh on next page navigation
    
    return { success: true, plan: newPlan };
  } catch (error) {
    console.error('Failed to create payment plan:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create payment plan' 
    };
  }
}

export async function updatePaymentPlan(productId: string, planId: string, data: CreatePlanData) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error('Unauthorized');
    }

    // Verify product ownership
    const product = await prisma.product.findFirst({
      where: { 
        id: productId,
        ownerId: userId
      }
    });

    if (!product) {
      throw new Error('Product not found or access denied');
    }

    const updatedPlan = await prisma.paymentPlan.update({
      where: { 
        id: planId,
        productId: productId
      },
      data: {
        name: data.name,
        description: data.description,
        planType: data.planType,
        price: data.price,
        currency: data.currency,
        billingInterval: data.billingInterval,
        trialDays: data.trialDays || null,
        features: data.features,
        userLimit: data.userLimit || null,
        storageLimit: data.storageLimit || null,
        apiCallsLimit: data.apiCallsLimit || null,
        discountPercentage: data.discountPercentage || null,
        discountValidUntil: data.discountValidUntil ? new Date(data.discountValidUntil) : null,
        isPopular: data.isPopular,
        isActive: data.isActive,
        displayOrder: data.displayOrder,
      }
    });

    // NO REVALIDATION - Let optimistic UI handle everything
    // Data will be fresh on next page navigation
    
    return { success: true, plan: updatedPlan };
  } catch (error) {
    console.error('Failed to update payment plan:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update payment plan' 
    };
  }
}

export async function deletePaymentPlan(productId: string, planId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error('Unauthorized');
    }

    // Verify product ownership
    const product = await prisma.product.findFirst({
      where: { 
        id: productId,
        ownerId: userId
      }
    });

    if (!product) {
      throw new Error('Product not found or access denied');
    }

    await prisma.paymentPlan.delete({
      where: { 
        id: planId,
        productId: productId
      }
    });

    // NO REVALIDATION - Let optimistic UI handle everything
    // Data will be fresh on next page navigation
    
    return { success: true };
  } catch (error) {
    console.error('Failed to delete payment plan:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete payment plan' 
    };
  }
}
