import { Suspense } from 'react';
import { getAllPaymentPlans } from '@/lib/payment-plans-cache';
import PaymentPlansTable from './PaymentPlansTable';
import PaymentPlansLoading from './PaymentPlansLoading';
import PaymentPlansWithErrorBoundary from './PaymentPlansErrorBoundary';

interface BatchPaymentPlansManagerProps {
  products: Array<{ id: string; name: string, nameEn: string }>;
}

interface PaymentPlansServerContentProps {
  products: Array<{ id: string; name: string, nameEn: string }>;
}

// Server Component for async data fetching
async function PaymentPlansServerContent({ products }: PaymentPlansServerContentProps) {
  const productIds = products.map(p => p.id);
  const allPaymentPlans = await getAllPaymentPlans(productIds);

  return (
    <div className="space-y-6">
      {products.map((product) => {
        const plans = allPaymentPlans[product.id] || [];
        return (
          <div key={product.id} className="space-y-4">
            <h3 className="text-lg font-semibold">{product.name}</h3>
            <PaymentPlansTable
              productId={product.id}
              nameEn={product.nameEn}
              initialPlans={plans}
            />
          </div>
        );
      })}
    </div>
  );
}

// Main component - Server Component
export default function BatchPaymentPlansManager({ products }: BatchPaymentPlansManagerProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <PaymentPlansWithErrorBoundary>
      <Suspense fallback={<PaymentPlansLoading />}>
        <PaymentPlansServerContent products={products} />
      </Suspense>
    </PaymentPlansWithErrorBoundary>
  );
}
