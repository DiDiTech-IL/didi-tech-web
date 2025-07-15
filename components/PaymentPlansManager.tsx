import { Suspense } from 'react';
import { prisma } from '@/lib/prisma';
import type { PaymentPlan } from '@/types/payment-plan';
import PaymentPlansTable from './PaymentPlansTable';
import PaymentPlansLoading from './PaymentPlansLoading';

interface PaymentPlansManagerProps {
  productId: string;
}

async function fetchPaymentPlans(productId: string): Promise<PaymentPlan[]> {
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        paymentPlans: {
          orderBy: { displayOrder: 'asc' }
        }
      },
    });

    if (!product) {
      return [];
    }

    // Transform Prisma data to our interface
    const plans: PaymentPlan[] = product.paymentPlans.map(plan => ({
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

    return plans;
  } catch (error) {
    console.error('Failed to fetch payment plans:', error);
    return [];
  }
}

async function PaymentPlansContent({ productId }: { productId: string }) {
  const plans = await fetchPaymentPlans(productId);
  return <PaymentPlansTable productId={productId} initialPlans={plans} />;
}

export default function PaymentPlansManager({ productId }: PaymentPlansManagerProps) {
  return (
    <div className="space-y-6">
      <Suspense fallback={<PaymentPlansLoading />}>
        <PaymentPlansContent productId={productId} />
      </Suspense>
    </div>
  );
}