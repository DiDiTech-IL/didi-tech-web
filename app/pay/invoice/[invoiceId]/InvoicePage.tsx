'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Download, Mail, Printer } from 'lucide-react';

interface InvoiceData {
  invoice: {
    id: string;
    number: string;
    date: Date;
    amount: number;
    currency: string;
    status: 'paid';
    transactionId: string | null;
  };
  client: {
    name: string;
    email: string;
    company: string | null;
    phone: string | null;
  };
  product: {
    name: string;
    domain: string | null;
  };
  plan: {
    name: string;
    type: string;
  } | null;
  account: {
    subdomain: string;
    fullUrl: string;
  };
}

interface InvoicePageProps {
  data: InvoiceData;
}

export default function InvoicePage({ data }: InvoicePageProps) {
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    try {
      const response = await fetch(`/api/invoices/${data.invoice.id}/pdf?format=pdf`);
      
      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      // Create blob from response
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${data.invoice.number}.pdf`;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      // Fallback to print if PDF generation fails
      window.print();
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('he-IL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: currency === 'ILS' ? 'ILS' : 'ILS'
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8" dir="rtl">
      <div className="max-w-4xl mx-auto px-4">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            התשלום הושלם בהצלחה!
          </h1>
          <p className="text-lg text-gray-600">
            חשבונית מס׳ {data.invoice.number}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mb-8 print:hidden">
          <Button onClick={handlePrint} variant="outline" className="gap-2">
            <Printer className="h-4 w-4" />
            הדפסה
          </Button>
          <Button onClick={handleDownloadPDF} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            הורדת PDF
          </Button>
        </div>

        {/* Invoice Card */}
        <Card className="mb-8">
          <CardHeader className="border-b">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl mb-2">חשבונית</CardTitle>
                <p className="text-sm text-gray-600">
                  מספר חשבונית: {data.invoice.number}
                </p>
                <p className="text-sm text-gray-600">
                  תאריך: {formatDate(data.invoice.date)}
                </p>
              </div>
              <div className="text-left">
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  ✓ שולם
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {/* Client Details */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">פרטי הלקוח</h3>
                <div className="space-y-1 text-sm">
                  <p><strong>שם:</strong> {data.client.name}</p>
                  <p><strong>אימייל:</strong> {data.client.email}</p>
                  {data.client.company && (
                    <p><strong>חברה:</strong> {data.client.company}</p>
                  )}
                  {data.client.phone && (
                    <p><strong>טלפון:</strong> {data.client.phone}</p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">פרטי המוצר</h3>
                <div className="space-y-1 text-sm">
                  <p><strong>מוצר:</strong> {data.product.name}</p>
                  {data.plan && (
                    <p><strong>תוכנית:</strong> {data.plan.name}</p>
                  )}
                  <p><strong>תת-דומיין:</strong> {data.account.subdomain}</p>
                  <p><strong>כתובת:</strong> <a href={data.account.fullUrl} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">{data.account.fullUrl}</a></p>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Payment Details */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">פרטי התשלום</h3>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">סכום לתשלום:</span>
                  <span className="font-semibold text-lg">
                    {formatCurrency(data.invoice.amount, data.invoice.currency)}
                  </span>
                </div>
                
                {data.invoice.transactionId && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">מספר עסקה:</span>
                    <span className="font-mono">{data.invoice.transactionId}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Email Status Card */}
        <Card className="mb-8 print:hidden">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Mail className="h-5 w-5 text-blue-500" />
              <h3 className="font-semibold text-gray-900">עדכון במייל</h3>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900">חשבונית נשלחה למייל</p>
                  <p className="text-sm text-blue-700 mt-1">
                    העתק של החשבונית נשלח לכתובת: <strong>{data.client.email}</strong>
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-900">המתנה להפעלת החשבון</p>
                  <p className="text-sm text-yellow-700 mt-1">
                    ברגע שהחשבון שלך יוגדר במערכת, תקבל מייל נוסף עם פרטי הכניסה ללינק: <br />
                    <strong className="break-all">{data.account.fullUrl}</strong>
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 print:hidden">
          <p>תודה שבחרת בשירותים שלנו!</p>
          <p className="mt-1">לשאלות ותמיכה, צרו קשר איתנו</p>
        </div>
      </div>

      {/* Print-specific styles */}
      <style jsx global>{`
        @media print {
          body { font-size: 12pt; }
          .print\\:hidden { display: none !important; }
          .bg-gray-50 { background: white !important; }
          .shadow-lg { box-shadow: none !important; }
          .border { border: 1px solid #000 !important; }
        }
      `}</style>
    </div>
  );
}
