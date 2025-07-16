"use client";

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { PaymentPlan } from '@/types/payment-plan';
import { AlertTriangle, ExternalLink, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import PaymentPlansLoading from './PaymentPlansLoading';
import PaymentPlansTable from './PaymentPlansTable';

interface ProductPaymentPlansManagerProps {
    productId: string;
    productName: string;
    nameEn: string;

}

export default function ProductPaymentPlansManager({ productId, nameEn }: ProductPaymentPlansManagerProps) {
    const [plans, setPlans] = useState<PaymentPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const { toast } = useToast();

    const loadPlans = useCallback(async (showToast = false) => {
        try {
            if (showToast) setRefreshing(true);

            // Force fresh data by calling the API directly with all plans
            const response = await fetch(`/api/products/${productId}/payment-plans?includeInactive=true`, {
                cache: 'no-store'
            });

            if (!response.ok) {
                throw new Error('Failed to fetch payment plans');
            }

            const data = await response.json();
            setPlans(data.plans || []);

            if (showToast) {
                toast({
                    title: "Refreshed",
                    description: `Found ${data.plans?.length || 0} payment plans`,
                });
            }
        } catch (error) {
            console.error('Failed to load payment plans:', error);
            toast({
                title: "Error",
                description: "Failed to load payment plans",
                variant: "destructive",
            });
            setPlans([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [productId, toast]);

    useEffect(() => {
        loadPlans();
    }, [loadPlans]);

    const handleRefresh = () => {
        loadPlans(true);
    };

    const openPaymentPage = () => {
        window.open(`https://pay.tachles.dev/${nameEn}`, '_blank');
    };

    if (loading) {
        return <PaymentPlansLoading />;
    }

    return (
        <div className="space-y-4">
            <div className="border-b pb-4">
                <div className="flex items-center justify-between">
                    <div>

                        <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline">
                                {plans.length} total plans
                            </Badge>
                            <Badge variant="outline">
                                {plans.filter(p => p.isActive).length} active
                            </Badge>
                            {plans.filter(p => !p.isActive).length > 0 && (
                                <Badge variant="secondary">
                                    {plans.filter(p => !p.isActive).length} inactive
                                </Badge>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRefresh}
                            disabled={refreshing}
                        >
                            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                        <Button variant="outline" size="sm" onClick={openPaymentPage}>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Preview Page
                        </Button>
                    </div>
                </div>

                {plans.length > 0 && plans.filter(p => !p.isActive).length > 0 && (
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center gap-2 text-yellow-800">
                            <AlertTriangle className="h-4 w-4" />
                            <span className="text-sm font-medium">
                                You have {plans.filter(p => !p.isActive).length} inactive plans that won&apos;t appear on your payment page
                            </span>
                        </div>
                    </div>
                )}
            </div>

            <PaymentPlansTable
                productId={productId}
                nameEn={nameEn}
                initialPlans={plans}
            />
        </div>
    );
}
