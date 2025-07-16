"use client";

import CouponManager from "@/components/CouponManager";
import PaymentPlansManager from "@/components/PaymentPlansManager";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductSubscription } from "@prisma/client";
import { motion } from "framer-motion";
import {
    AlertCircle,
    Calendar,
    CheckCircle,
    Crown,
    DollarSign,
    ExternalLink,
    Package,
    Plus,
    TrendingUp,
    Users
} from "lucide-react";
import { useEffect, useState } from "react";

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
    isPopular: boolean;
    isActive: boolean;
    displayOrder: number;
}

interface ProductWithPlans {
    id: string;
    name: string;
    nameEn: string;
    description: string;
    domain?: string;
    status: string;
    category?: string;
    features: string[];
    monthlyRevenue: number;
    totalRevenue: number;
    paymentPlans: PaymentPlan[];
    subscriptions: ProductSubscription[];
    stats: {
        totalSubscriptions: number;
        totalPayments: number;
    };
}

export default function ProductsRevenueDashboard() {
    const [products, setProducts] = useState<ProductWithPlans[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState("overview");

    useEffect(() => {
        loadProducts();
    });

    const loadProducts = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/dashboard/products');
            if (response.ok) {
                const data = await response.json();
                setProducts(data);
                if (data.length > 0 && !selectedProduct) {
                    setSelectedProduct(data[0].id);
                }
            }
        } catch (error) {
            console.error('Error loading products:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number, currency: string = 'ILS') => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
        }).format(amount);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'LIVE': return 'bg-green-100 text-green-800';
            case 'BETA': return 'bg-blue-100 text-blue-800';
            case 'DEVELOPMENT': return 'bg-yellow-100 text-yellow-800';
            case 'MAINTENANCE': return 'bg-orange-100 text-orange-800';
            case 'DEPRECATED': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getPlanTypeIcon = (planType: string) => {
        switch (planType) {
            case 'RECURRING': return <Calendar className="h-4 w-4" />;
            case 'ONE_TIME': return <DollarSign className="h-4 w-4" />;
            case 'FREEMIUM': return <Users className="h-4 w-4" />;
            case 'TRIAL': return <CheckCircle className="h-4 w-4" />;
            default: return <Package className="h-4 w-4" />;
        }
    };

    const selectedProductData = products.find(p => p.id === selectedProduct);
    const totalRevenue = products.reduce((sum: number, p) => sum + Number(p.totalRevenue), 0);
    const totalSubscriptions = products.reduce((sum, p) => sum + p.stats.totalSubscriptions, 0);
    const activeProducts = products.filter(p => p.status === 'LIVE').length;

    if (loading) {
        return (
            <div className="p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-32 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Products & Revenue</h1>
                    <p className="text-gray-600 mt-1">Manage your products, pricing plans, and track revenue</p>
                </div>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                    <Plus className="h-4 w-4 mr-2" />
                    New Product
                </Button>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <DollarSign className="h-6 w-6 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Users className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Subscriptions</p>
                                <p className="text-2xl font-bold text-gray-900">{totalSubscriptions}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <Package className="h-6 w-6 text-purple-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Active Products</p>
                                <p className="text-2xl font-bold text-gray-900">{activeProducts}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-orange-100 rounded-lg">
                                <TrendingUp className="h-6 w-6 text-orange-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                                <p className="text-2xl font-bold text-gray-900">12.5%</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Products List */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Your Products</h2>
                    {products.map((product, index) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card
                                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${selectedProduct === product.id ? 'ring-2 ring-blue-500' : ''
                                    }`}
                                onClick={() => setSelectedProduct(product.id)}
                            >
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-semibold truncate">{product.name}</h3>
                                        <Badge className={getStatusColor(product.status)}>
                                            {product.status}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>

                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Revenue</span>
                                            <span className="font-medium">{formatCurrency(product.totalRevenue)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Subscriptions</span>
                                            <span className="font-medium">{product.stats.totalSubscriptions}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Plans</span>
                                            <span className="font-medium">{product.paymentPlans.length}</span>
                                        </div>
                                    </div>

                                    {product.domain && (
                                        <div className="mt-3 pt-3 border-t">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="w-full"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    window.open(`https://pay.tachles.dev/${encodeURIComponent(product.name)}`, '_blank');
                                                }}
                                            >
                                                <ExternalLink className="h-4 w-4 mr-2" />
                                                View Payment Page
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* Product Details */}
                <div className="md:col-span-2">
                    {selectedProductData ? (
                        <Card>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            {selectedProductData.name}
                                            <Badge className={getStatusColor(selectedProductData.status)}>
                                                {selectedProductData.status}
                                            </Badge>
                                        </CardTitle>
                                        <p className="text-gray-600 mt-1">{selectedProductData.description}</p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Tabs value={activeTab} onValueChange={setActiveTab}>
                                    <TabsList className="grid w-full grid-cols-3">
                                        <TabsTrigger value="overview">Overview</TabsTrigger>
                                        <TabsTrigger value="plans">Payment Plans</TabsTrigger>
                                        <TabsTrigger value="coupons">Coupons</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="overview" className="space-y-6">
                                        {/* Revenue Chart Placeholder */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <Card>
                                                <CardHeader>
                                                    <CardTitle className="text-lg">Revenue Breakdown</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="space-y-4">
                                                        <div className="flex justify-between">
                                                            <span>Total Revenue</span>
                                                            <span className="font-bold">{formatCurrency(selectedProductData.totalRevenue)}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span>Monthly Revenue</span>
                                                            <span className="font-bold">{formatCurrency(selectedProductData.monthlyRevenue)}</span>
                                                        </div>
                                                        <Progress value={(selectedProductData.monthlyRevenue / selectedProductData.totalRevenue) * 100} />
                                                    </div>
                                                </CardContent>
                                            </Card>

                                            <Card>
                                                <CardHeader>
                                                    <CardTitle className="text-lg">Subscription Stats</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="space-y-4">
                                                        <div className="flex justify-between">
                                                            <span>Active Subscriptions</span>
                                                            <span className="font-bold">{selectedProductData.stats.totalSubscriptions}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span>Total Payments</span>
                                                            <span className="font-bold">{selectedProductData.stats.totalPayments}</span>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>

                                        {/* Payment Plans Overview */}
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Payment Plans Overview</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {selectedProductData.paymentPlans.map((plan) => (
                                                        <div key={plan.id} className="border rounded-lg p-4">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <div className="flex items-center gap-2">
                                                                    {getPlanTypeIcon(plan.planType)}
                                                                    <h4 className="font-medium">{plan.name}</h4>
                                                                </div>
                                                                {plan.isPopular && (
                                                                    <Badge variant="secondary">
                                                                        <Crown className="h-3 w-3 mr-1" />
                                                                        Popular
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <p className="text-2xl font-bold text-blue-600">
                                                                {formatCurrency(plan.price, plan.currency)}
                                                                <span className="text-sm font-normal text-gray-500">
                                                                    /{plan.billingInterval.toLowerCase()}
                                                                </span>
                                                            </p>
                                                            <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
                                                                {plan.isActive ? (
                                                                    <span className="flex items-center gap-1">
                                                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                                                        Active
                                                                    </span>
                                                                ) : (
                                                                    <span className="flex items-center gap-1">
                                                                        <AlertCircle className="h-4 w-4 text-gray-400" />
                                                                        Inactive
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </TabsContent>

                                    <TabsContent value="plans">
                                        <PaymentPlansManager productId={selectedProductData.id} nameEn={selectedProductData.name} />
                                    </TabsContent>

                                    <TabsContent value="coupons">
                                        <CouponManager />
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card>
                            <CardContent className="p-12 text-center">
                                <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No Product Selected</h3>
                                <p className="text-gray-600">Select a product from the list to view its details and manage payment plans.</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
