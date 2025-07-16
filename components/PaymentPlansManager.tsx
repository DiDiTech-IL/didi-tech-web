import { Suspense } from 'react';
import { getPaymentPlans } from '@/lib/payment-plans-cache';
import PaymentPlansTable from './PaymentPlansTable';
import PaymentPlansLoading from './PaymentPlansLoading';
import PaymentPlansWithErrorBoundary from './PaymentPlansErrorBoundary';

interface PaymentPlansManagerProps {
  productId: string;
  productName?: string;
  nameEn: string;
}

// This needs to be a Server Component (no 'use client')
async function PaymentPlansServerContent({ productId, nameEn, productName }: { productId: string; productName?: string, nameEn: string }) {
  const plans = await getPaymentPlans(productId);

  return (
    <div className="space-y-4">
      {productName && (
        <h3 className="text-lg font-semibold">{productName} - Payment Plans</h3>
      )}
      <PaymentPlansTable productId={productId} nameEn={nameEn} initialPlans={plans} />
    </div>
  );
}

// This is the main component - Server Component
export default function PaymentPlansManager({ productId, nameEn, productName }: PaymentPlansManagerProps) {
  return (
    <PaymentPlansWithErrorBoundary>
      <div className="space-y-6">
        <Suspense
          fallback={<PaymentPlansLoading />}
          key={`payment-plans-${productId}`}
        >
          <PaymentPlansServerContent productId={productId} nameEn={nameEn} productName={productName} />
        </Suspense>
      </div>
    </PaymentPlansWithErrorBoundary>
  );
}