'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();

  useEffect(() => {
    const findInvoice = async () => {
      try {
        const product = params.productName as string;
        const subdomain = searchParams.get('subdomain');
        
        if (!product || !subdomain) {
          console.error('Missing product or subdomain parameters');
          return;
        }

        // Find the subscription by subdomain and product
        const response = await fetch('/api/find-invoice', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ product, subdomain }),
        });

        const data = await response.json();
        
        if (data.success && data.invoiceId) {
          // Redirect to invoice page
          router.push(`/pay/invoice/${data.invoiceId}`);
        } else {
          console.error('Failed to find invoice:', data.error);
          // Fallback redirect after a delay
          setTimeout(() => {
            window.location.href = `https://${subdomain}.mitnadvim.app`;
          }, 3000);
        }
      } catch (error) {
        console.error('Error finding invoice:', error);
        // Fallback redirect after a delay
        setTimeout(() => {
          const subdomain = searchParams.get('subdomain');
          if (subdomain) {
            window.location.href = `https://${subdomain}.mitnadvim.app`;
          }
        }, 3000);
      }
    };

    findInvoice();
  }, [router, searchParams, params.productName]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
      <div className="text-center">
        <LoadingSpinner />
        <h1 className="text-2xl font-bold text-gray-900 mt-4 mb-2">
          התשלום הושלם בהצלחה!
        </h1>
        <p className="text-gray-600">
          מעביר אותך לעמוד החשבונית...
        </p>
      </div>
    </div>
  );
}
