"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, DollarSign, Clock, Crown, Copy } from "lucide-react";

interface PaymentPlan {
  id: string;
  name: string;
  description?: string;
  planType: string;
  price: number;
  currency: string;
  billingInterval: string;
  trialDays?: number;
  features: string[];
  userLimit?: number;
  storageLimit?: number;
  apiCallsLimit?: number;
  discountPercentage?: number;
  discountValidUntil?: string;
  isPopular?: boolean;
  displayOrder: number;
}

interface Product {
  id: string;
  name: string;
  description: string;
  domain?: string;
  status: string;
}

interface PaymentPlansResponse {
  product: Product;
  plans: PaymentPlan[];
  metadata: {
    totalPlans: number;
    hasFreeTrial: boolean;
    hasDiscount: boolean;
    currencies: string[];
    priceRange: {
      min: number;
      max: number;
    };
  };
}

export default function PaymentGatewayDemo() {
  const [productIdentifier, setProductIdentifier] = useState("");
  const [paymentData, setPaymentData] = useState<PaymentPlansResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<PaymentPlan | null>(null);

  const fetchPaymentPlans = async () => {
    if (!productIdentifier.trim()) {
      setError("Please enter a product ID or name");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/public/payment-plans/${encodeURIComponent(productIdentifier)}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch payment plans');
      }

      const data = await response.json();
      setPaymentData(data);
    } catch (error) {
      console.error('Error fetching payment plans:', error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
      setPaymentData(null);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  const getBillingText = (interval: string) => {
    const intervals = {
      MONTHLY: 'per month',
      YEARLY: 'per year',
      QUARTERLY: 'per quarter',
      WEEKLY: 'per week',
      ONE_TIME: 'one-time',
    };
    return intervals[interval as keyof typeof intervals] || interval.toLowerCase();
  };

  const copyApiUrl = async () => {
    const url = `${window.location.origin}/api/public/payment-plans/${productIdentifier}`;
    try {
      await navigator.clipboard.writeText(url);
      alert('API URL copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Payment Gateway Demo</h1>
        <p className="text-gray-600">
          This demo shows what pay.tachles.dev would receive when fetching payment plans for a product.
        </p>
      </div>

      {/* Input Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Fetch Payment Plans</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">
                Product ID, Name, or Domain
              </label>
              <Input
                value={productIdentifier}
                onChange={(e) => setProductIdentifier(e.target.value)}
                placeholder="Enter product identifier..."
                onKeyDown={(e) => e.key === 'Enter' && fetchPaymentPlans()}
              />
            </div>
            <Button onClick={fetchPaymentPlans} disabled={loading}>
              {loading ? 'טוען...' : 'שלוף תוכניות'}
            </Button>
            {paymentData && (
              <Button variant="outline" onClick={copyApiUrl}>
                <Copy className="h-4 w-4 mr-2" />
                Copy API URL
              </Button>
            )}
          </div>
          {error && (
            <Alert className="mt-4" variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Results Section */}
      {paymentData && (
        <div className="space-y-6">
          {/* Product Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {paymentData.product.name}
                <Badge variant={paymentData.product.status === 'LIVE' ? 'default' : 'secondary'}>
                  {paymentData.product.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">{paymentData.product.description}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium">Total Plans:</span> {paymentData.metadata.totalPlans}
                </div>
                <div>
                  <span className="font-medium">Has Trial:</span> {paymentData.metadata.hasFreeTrial ? 'Yes' : 'No'}
                </div>
                <div>
                  <span className="font-medium">Has Discount:</span> {paymentData.metadata.hasDiscount ? 'Yes' : 'No'}
                </div>
                <div>
                  <span className="font-medium">Price Range:</span> 
                  {formatPrice(paymentData.metadata.priceRange.min, paymentData.metadata.currencies[0])} - 
                  {formatPrice(paymentData.metadata.priceRange.max, paymentData.metadata.currencies[0])}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Plans */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paymentData.plans.map((plan) => (
              <Card 
                key={plan.id} 
                className={`relative cursor-pointer transition-all hover:shadow-lg ${
                  plan.isPopular ? 'ring-2 ring-blue-500' : ''
                } ${
                  selectedPlan?.id === plan.id ? 'ring-2 ring-green-500 bg-green-50' : ''
                }`}
                onClick={() => setSelectedPlan(plan)}
              >
                {plan.isPopular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-500 text-white">
                      <Crown className="h-3 w-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  {plan.description && (
                    <p className="text-gray-600 text-sm">{plan.description}</p>
                  )}
                  <div className="mt-4">
                    <div className="flex items-baseline justify-center">
                      <span className="text-3xl font-bold">
                        {formatPrice(plan.price, plan.currency)}
                      </span>
                      <span className="text-gray-600 ml-2">
                        {getBillingText(plan.billingInterval)}
                      </span>
                    </div>
                    {plan.discountPercentage && (
                      <Badge variant="secondary" className="mt-2">
                        {plan.discountPercentage}% OFF
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent>
                  {plan.trialDays && (
                    <div className="flex items-center text-green-600 mb-4">
                      <Clock className="h-4 w-4 mr-2" />
                      {plan.trialDays} days free trial
                    </div>
                  )}

                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {(plan.userLimit || plan.storageLimit || plan.apiCallsLimit) && (
                    <div className="border-t pt-4 space-y-1 text-xs text-gray-600">
                      {plan.userLimit && <div>Up to {plan.userLimit} users</div>}
                      {plan.storageLimit && <div>{plan.storageLimit}GB storage</div>}
                      {plan.apiCallsLimit && <div>{plan.apiCallsLimit.toLocaleString()} API calls/month</div>}
                    </div>
                  )}

                  <Button 
                    className="w-full mt-4" 
                    variant={selectedPlan?.id === plan.id ? "default" : "outline"}
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    {selectedPlan?.id === plan.id ? 'Selected' : 'Select Plan'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* JSON Response */}
          <Card>
            <CardHeader>
              <CardTitle>Raw API Response</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-xs">
                {JSON.stringify(paymentData, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
