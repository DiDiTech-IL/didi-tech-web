"use client";

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { CouponUsageType, DiscountType } from '@prisma/client';
import { motion } from 'framer-motion';
import {
    AlertCircle,
    Calendar,
    CheckCircle,
    Copy,
    DollarSign,
    Edit,
    Gift,
    Plus,
    Trash2,
    Users
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface Coupon {
    id: string;
    code: string;
    name: string;
    description?: string;
    discountType: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_TRIAL' | 'FREE_MONTHS';
    discountValue: number;
    maxDiscountAmount?: number;
    usageType: 'PUBLIC' | 'TIME_LIMITED' | 'USER_SPECIFIC' | 'PRODUCT_SPECIFIC' | 'GLOBAL' | 'FIRST_TIME';
    maxUses?: number;
    maxUsesPerUser?: number;
    currentUses: number;
    validFrom: string;
    validUntil?: string;
    isGlobal: boolean;
    productIds: string[];
    planIds: string[];
    allowedEmails: string[];
    allowedDomains: string[];
    minimumAmount?: number;
    firstTimeOnly: boolean;
    isActive: boolean;
    totalRedemptions: number;
    totalDiscountGiven: number;
    createdAt: string;
    updatedAt: string;
}

interface Product {
    id: string;
    name: string;
}

interface Plan {
    id: string;
    name: string;
    price: number;
}

export default function CouponManager() {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
    const [formData, setFormData] = useState<Partial<Coupon>>({});

    const { toast } = useToast();

    useEffect(() => {
        loadCoupons();
        loadProducts();
        loadPlans();
    });

    const loadCoupons = async () => {
        try {
            const response = await fetch('/api/coupons');
            if (!response.ok) {
                throw new Error('Failed to fetch coupons');
            }
            const coupons = await response.json();
            setCoupons(coupons);
        } catch (error) {
            console.error('Failed to load coupons:', error);
            toast({
                title: "Error",
                description: "Failed to load coupons",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const loadProducts = async () => {
        try {
            const response = await fetch('/api/products');
            if (response.ok) {
                const data = await response.json();
                setProducts(data);
            }
        } catch (error) {
            console.error('Failed to load products:', error);
        }
    };

    const loadPlans = async () => {
        try {
            const response = await fetch('/api/plans');
            if (response.ok) {
                const data = await response.json();
                setPlans(data);
            }
        } catch (error) {
            console.error('Failed to load plans:', error);
        }
    };

    const openCreateDialog = () => {
        setEditingCoupon(null);
        setFormData({
            code: '',
            name: '',
            description: '',
            discountType: 'PERCENTAGE',
            discountValue: 0,
            usageType: 'PUBLIC',
            validFrom: new Date().toISOString().split('T')[0],
            isGlobal: true,
            productIds: [],
            planIds: [],
            allowedEmails: [],
            allowedDomains: [],
            firstTimeOnly: false,
            isActive: true,
        });
        setIsDialogOpen(true);
    };

    const openEditDialog = (coupon: Coupon) => {
        setEditingCoupon(coupon);
        setFormData({
            ...coupon,
            validFrom: coupon.validFrom.split('T')[0],
            validUntil: coupon.validUntil ? coupon.validUntil.split('T')[0] : undefined,
        });
        setIsDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const url = editingCoupon ? `/api/coupons/${editingCoupon.id}` : '/api/coupons';
            const method = editingCoupon ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    code: formData.code?.toUpperCase(),
                }),
            });

            if (response.ok) {
                toast({
                    title: "Success",
                    description: `Coupon ${editingCoupon ? 'updated' : 'created'} successfully`,
                });
                setIsDialogOpen(false);
                loadCoupons();
            } else {
                const error = await response.json();
                toast({
                    title: "Error",
                    description: error.error || 'Failed to save coupon',
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to save coupon",
                content: error instanceof Error ? error.message : 'Unknown error',
                variant: "destructive",
            });
        }
    };

    const handleDelete = async (couponId: string) => {
        if (!confirm('Are you sure you want to delete this coupon?')) return;

        try {
            const response = await fetch(`/api/coupons/${couponId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                toast({
                    title: "Success",
                    description: "Coupon deleted successfully",
                });
                loadCoupons();
            } else {
                toast({
                    title: "Error",
                    description: "Failed to delete coupon",
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete coupon",
                content: error instanceof Error ? error.message : 'Unknown error',
                variant: "destructive",
            });
        }
    };

    const copyCode = async (code: string) => {
        try {
            await navigator.clipboard.writeText(code);
            toast({
                title: "Copied!",
                description: `Coupon code ${code} copied to clipboard`,
            });
        } catch {
            toast({
                title: "Error",
                description: "Failed to copy coupon code",
                variant: "destructive",
            });
        }
    };

    const getDiscountText = (coupon: Coupon) => {
        switch (coupon.discountType) {
            case 'PERCENTAGE':
                return `${coupon.discountValue}% off`;
            case 'FIXED_AMOUNT':
                return `$${coupon.discountValue} off`;
            case 'FREE_TRIAL':
                return `${coupon.discountValue} days free trial`;
            case 'FREE_MONTHS':
                return `${coupon.discountValue} months free`;
            default:
                return 'Discount';
        }
    };

    const getUsageTypeColor = (type: string) => {
        const colors = {
            PUBLIC: 'bg-green-100 text-green-800',
            TIME_LIMITED: 'bg-yellow-100 text-yellow-800',
            USER_SPECIFIC: 'bg-blue-100 text-blue-800',
            PRODUCT_SPECIFIC: 'bg-purple-100 text-purple-800',
            GLOBAL: 'bg-gray-100 text-gray-800',
            FIRST_TIME: 'bg-orange-100 text-orange-800',
        };
        return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'ILS',
        }).format(amount);
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin h-8 w-8 border-2 border-blue-500 rounded-full border-t-transparent mx-auto mb-4"></div>
                        <p>Loading coupons...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">ניהול קופונים</h1>
                    <p className="text-gray-600 mt-1">צור ונהל קופוני הנחה עבור המוצרים שלך</p>
                </div>
                <Button onClick={openCreateDialog} className="flex items-center space-x-2">
                    <Plus className="h-4 w-4" />
                    <span>צור קופון</span>
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <Gift className="h-8 w-8 text-blue-500" />
                            <div>
                                <p className="text-sm text-gray-600">סה״כ קופונים</p>
                                <p className="text-2xl font-bold">{coupons.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <Users className="h-8 w-8 text-green-500" />
                            <div>
                                <p className="text-sm text-gray-600">סה״כ מימושים</p>
                                <p className="text-2xl font-bold">
                                    {coupons.reduce((sum, c) => sum + c.totalRedemptions, 0)}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <DollarSign className="h-8 w-8 text-purple-500" />
                            <div>
                                <p className="text-sm text-gray-600">סה״כ הנחות</p>
                                <p className="text-2xl font-bold">
                                    {formatCurrency(coupons.reduce((sum, c) => sum + c.totalDiscountGiven, 0))}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <CheckCircle className="h-8 w-8 text-emerald-500" />
                            <div>
                                <p className="text-sm text-gray-600">Active Coupons</p>
                                <p className="text-2xl font-bold">
                                    {coupons.filter(c => c.isActive).length}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Coupons List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {coupons.map((coupon, index) => (
                    <motion.div
                        key={coupon.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card className={`relative ${!coupon.isActive ? 'opacity-60' : ''}`}>
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <CardTitle className="text-lg">{coupon.name}</CardTitle>
                                            {!coupon.isActive && (
                                                <Badge variant="secondary" className="text-xs">
                                                    Inactive
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                                                {coupon.code}
                                            </code>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => copyCode(coupon.code)}
                                            >
                                                <Copy className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="flex space-x-1">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => openEditDialog(coupon)}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleDelete(coupon.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                {/* Discount Details */}
                                <div className="bg-blue-50 rounded-lg p-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Discount</span>
                                        <span className="font-bold text-blue-900">
                                            {getDiscountText(coupon)}
                                        </span>
                                    </div>
                                    {coupon.maxDiscountAmount && (
                                        <div className="flex items-center justify-between mt-1">
                                            <span className="text-xs text-gray-500">Max discount</span>
                                            <span className="text-xs text-gray-700">
                                                {formatCurrency(coupon.maxDiscountAmount)}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Usage Type */}
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Type</span>
                                    <Badge className={`text-xs ${getUsageTypeColor(coupon.usageType)}`}>
                                        {coupon.usageType.replace('_', ' ')}
                                    </Badge>
                                </div>

                                {/* Usage Stats */}
                                {coupon.maxUses && (
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600">Usage</span>
                                            <span>{coupon.currentUses} / {coupon.maxUses}</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-blue-500 h-2 rounded-full"
                                                style={{
                                                    width: `${Math.min((coupon.currentUses / coupon.maxUses) * 100, 100)}%`
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Validity */}
                                <div className="space-y-1">
                                    {coupon.validUntil && (
                                        <div className="flex items-center space-x-2 text-sm">
                                            <Calendar className="h-4 w-4 text-gray-400" />
                                            <span className="text-gray-600">
                                                Expires {new Date(coupon.validUntil).toLocaleDateString()}
                                            </span>
                                        </div>
                                    )}

                                    {coupon.validUntil && new Date(coupon.validUntil) < new Date() && (
                                        <Alert>
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertDescription className="text-xs">
                                                This coupon has expired
                                            </AlertDescription>
                                        </Alert>
                                    )}
                                </div>

                                {/* Performance */}
                                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">Redemptions</span>
                                        <span className="font-medium">{coupon.totalRedemptions}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">Total Discount Given</span>
                                        <span className="font-medium text-green-600">
                                            {formatCurrency(coupon.totalDiscountGiven)}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Create/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Basic Info */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="code">Coupon Code *</Label>
                                <Input
                                    id="code"
                                    value={formData.code || ''}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    placeholder="SAVE20"
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="name">Name *</Label>
                                <Input
                                    id="name"
                                    value={formData.name || ''}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="20% Off All Plans"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description || ''}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Describe what this coupon offers..."
                            />
                        </div>

                        {/* Discount Configuration */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="discountType">Discount Type *</Label>
                                <Select
                                    value={formData.discountType}
                                    onValueChange={(value) => setFormData({ ...formData, discountType: value as DiscountType })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PERCENTAGE">Percentage Off</SelectItem>
                                        <SelectItem value="FIXED_AMOUNT">Fixed Amount Off</SelectItem>
                                        <SelectItem value="FREE_TRIAL">Free Trial Days</SelectItem>
                                        <SelectItem value="FREE_MONTHS">Free Months</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="discountValue">
                                    {formData.discountType === 'PERCENTAGE' ? 'Percentage' :
                                        formData.discountType === 'FIXED_AMOUNT' ? 'Amount ($)' :
                                            'Days/Months'} *
                                </Label>
                                <Input
                                    id="discountValue"
                                    type="number"
                                    value={formData.discountValue || ''}
                                    onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) })}
                                    required
                                />
                            </div>
                        </div>

                        {formData.discountType === 'PERCENTAGE' && (
                            <div>
                                <Label htmlFor="maxDiscountAmount">Maximum Discount Amount ($)</Label>
                                <Input
                                    id="maxDiscountAmount"
                                    type="number"
                                    value={formData.maxDiscountAmount || ''}
                                    onChange={(e) => setFormData({ ...formData, maxDiscountAmount: parseFloat(e.target.value) })}
                                    placeholder="100"
                                />
                            </div>
                        )}

                        {/* Usage Configuration */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="usageType">Usage Type</Label>
                                <Select
                                    value={formData.usageType}
                                    onValueChange={(value) => setFormData({ ...formData, usageType: value as CouponUsageType })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PUBLIC">Public</SelectItem>
                                        <SelectItem value="TIME_LIMITED">Time Limited</SelectItem>
                                        <SelectItem value="USER_SPECIFIC">User Specific</SelectItem>
                                        <SelectItem value="PRODUCT_SPECIFIC">Product Specific</SelectItem>
                                        <SelectItem value="GLOBAL">Global</SelectItem>
                                        <SelectItem value="FIRST_TIME">First Time Only</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="maxUses">Maximum Total Uses</Label>
                                <Input
                                    id="maxUses"
                                    type="number"
                                    value={formData.maxUses || ''}
                                    onChange={(e) => setFormData({ ...formData, maxUses: parseInt(e.target.value) })}
                                    placeholder="1000"
                                />
                            </div>
                        </div>

                        {/* Validity Dates */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="validFrom">Valid From *</Label>
                                <Input
                                    id="validFrom"
                                    type="date"
                                    value={formData.validFrom || ''}
                                    onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="validUntil">Valid Until</Label>
                                <Input
                                    id="validUntil"
                                    type="date"
                                    value={formData.validUntil || ''}
                                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Minimum Amount */}
                        <div>
                            <Label htmlFor="minimumAmount">Minimum Order Amount ($)</Label>
                            <Input
                                id="minimumAmount"
                                type="number"
                                value={formData.minimumAmount || ''}
                                onChange={(e) => setFormData({ ...formData, minimumAmount: parseFloat(e.target.value) })}
                                placeholder="10"
                            />
                        </div>

                        {/* Settings */}
                        <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="isGlobal"
                                    checked={formData.isGlobal || false}
                                    onCheckedChange={(checked) => setFormData({ ...formData, isGlobal: checked })}
                                />
                                <Label htmlFor="isGlobal">Apply to all products</Label>
                            </div>

                            {!formData.isGlobal && (
                                <div className="space-y-3">
                                    <div>
                                        <Label>Specific Products</Label>
                                        <div className="max-h-32 overflow-y-auto border rounded p-2 space-y-1">
                                            {products.map((product) => (
                                                <div key={product.id} className="flex items-center space-x-2">
                                                    <input
                                                        type="checkbox"
                                                        id={`product-${product.id}`}
                                                        checked={formData.productIds?.includes(product.id) || false}
                                                        onChange={(e) => {
                                                            const productIds = formData.productIds || [];
                                                            if (e.target.checked) {
                                                                setFormData({
                                                                    ...formData,
                                                                    productIds: [...productIds, product.id]
                                                                });
                                                            } else {
                                                                setFormData({
                                                                    ...formData,
                                                                    productIds: productIds.filter(id => id !== product.id)
                                                                });
                                                            }
                                                        }}
                                                    />
                                                    <Label htmlFor={`product-${product.id}`} className="text-sm">
                                                        {product.name}
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <Label>Specific Plans</Label>
                                        <div className="max-h-32 overflow-y-auto border rounded p-2 space-y-1">
                                            {plans.map((plan) => (
                                                <div key={plan.id} className="flex items-center space-x-2">
                                                    <input
                                                        type="checkbox"
                                                        id={`plan-${plan.id}`}
                                                        checked={formData.planIds?.includes(plan.id) || false}
                                                        onChange={(e) => {
                                                            const planIds = formData.planIds || [];
                                                            if (e.target.checked) {
                                                                setFormData({
                                                                    ...formData,
                                                                    planIds: [...planIds, plan.id]
                                                                });
                                                            } else {
                                                                setFormData({
                                                                    ...formData,
                                                                    planIds: planIds.filter(id => id !== plan.id)
                                                                });
                                                            }
                                                        }}
                                                    />
                                                    <Label htmlFor={`plan-${plan.id}`} className="text-sm">
                                                        {plan.name} (${plan.price}/month)
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {formData.usageType === 'USER_SPECIFIC' && (
                                <div>
                                    <Label htmlFor="allowedEmails">Allowed Emails (comma-separated)</Label>
                                    <Textarea
                                        id="allowedEmails"
                                        value={formData.allowedEmails?.join(', ') || ''}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            allowedEmails: e.target.value.split(',').map(email => email.trim()).filter(Boolean)
                                        })}
                                        placeholder="user@example.com, user2@example.com"
                                    />
                                </div>
                            )}

                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="firstTimeOnly"
                                    checked={formData.firstTimeOnly || false}
                                    onCheckedChange={(checked) => setFormData({ ...formData, firstTimeOnly: checked })}
                                />
                                <Label htmlFor="firstTimeOnly">New customers only</Label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="isActive"
                                    checked={formData.isActive !== false}
                                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                                />
                                <Label htmlFor="isActive">Active</Label>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-2 pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit">
                                {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}