"use client";

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Copy } from 'lucide-react';

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

interface ProductCouponManagerProps {
    productId: string;
    productName: string;
}

export default function ProductCouponManager({ productId, productName }: ProductCouponManagerProps) {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
    const [formData, setFormData] = useState<Partial<Coupon>>({});

    const { toast } = useToast();

    const loadCoupons = useCallback(async () => {
        try {
            const response = await fetch(`/api/coupons?productId=${productId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch coupons');
            }
            const data = await response.json();
            setCoupons(Array.isArray(data) ? data : []);
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
    }, [productId, toast]);

    useEffect(() => {
        loadCoupons();
    }, [loadCoupons]);

    const openCreateForm = () => {
        setEditingCoupon(null);
        setFormData({
            code: '',
            name: '',
            description: '',
            discountType: 'PERCENTAGE',
            discountValue: 0,
            usageType: 'PRODUCT_SPECIFIC',
            validFrom: new Date().toISOString().split('T')[0],
            isGlobal: false,
            productIds: [productId],
            planIds: [],
            allowedEmails: [],
            allowedDomains: [],
            firstTimeOnly: false,
            isActive: true,
        });
        setIsFormOpen(true);
    };

    const openEditForm = (coupon: Coupon) => {
        setEditingCoupon(coupon);
        setFormData({
            ...coupon,
            validFrom: coupon.validFrom.split('T')[0],
            validUntil: coupon.validUntil ? coupon.validUntil.split('T')[0] : undefined,
        });
        setIsFormOpen(true);
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
                    productIds: [productId], // Always ensure this coupon is for this product
                }),
            });

            if (response.ok) {
                toast({
                    title: "Success",
                    description: editingCoupon ? "Coupon updated successfully" : "Coupon created successfully",
                });
                loadCoupons();
                setIsFormOpen(false);
                setFormData({});
            } else {
                const errorData = await response.json();
                toast({
                    title: "Error",
                    description: errorData.message || "Failed to save coupon",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error('Error saving coupon:', error);
            toast({
                title: "Error",
                description: "Failed to save coupon",
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
            console.error('Error deleting coupon:', error);
            toast({
                title: "Error",
                description: "Failed to delete coupon",
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

    if (loading) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-center h-32">
                    <div className="text-center">
                        <div className="animate-spin h-6 w-6 border-2 border-blue-500 rounded-full border-t-transparent mx-auto mb-2"></div>
                        <p className="text-sm">Loading coupons...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h3 className="text-lg font-semibold">Coupons for {productName}</h3>
                    <p className="text-sm text-gray-600">Manage discount coupons for this product</p>
                </div>
                <Button onClick={openCreateForm} size="sm" className="w-full sm:w-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Coupon
                </Button>
            </div>

            {/* Coupons List */}
            {coupons.length === 0 ? (
                <Card>
                    <CardContent className="p-6 text-center">
                        <p className="text-gray-500">No coupons created yet</p>
                        <Button onClick={openCreateForm} className="mt-4">
                            Create First Coupon
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {coupons.map((coupon) => (
                        <Card key={coupon.id} className={`${!coupon.isActive ? 'opacity-60' : ''}`}>
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-medium">{coupon.name}</h4>
                                            {!coupon.isActive && (
                                                <Badge variant="secondary">Inactive</Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <code className="bg-gray-100 px-2 py-1 rounded text-sm">
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
                                    <div className="flex items-center gap-1">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => openEditForm(coupon)}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleDelete(coupon.id)}
                                            className="text-red-600"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-600">Discount</p>
                                        <p className="font-medium">{getDiscountText(coupon)}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Uses</p>
                                        <p className="font-medium">
                                            {coupon.totalRedemptions} / {coupon.maxUses || '∞'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Valid Until</p>
                                        <p className="font-medium">
                                            {coupon.validUntil ? new Date(coupon.validUntil).toLocaleDateString() : 'No expiry'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Total Saved</p>
                                        <p className="font-medium">${coupon.totalDiscountGiven}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Create/Edit Form */}
            {isFormOpen && (
                <Card>
                    <CardHeader>
                        <CardTitle>
                            {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                                        placeholder="20% Off Sale"
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
                                    placeholder="Limited time offer"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="discountType">Discount Type *</Label>
                                    <Select
                                        value={formData.discountType}
                                        onValueChange={(value) => setFormData({ ...formData, discountType: value as 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_TRIAL' | 'FREE_MONTHS' })}
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

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="maxUses">Maximum Uses</Label>
                                    <Input
                                        id="maxUses"
                                        type="number"
                                        value={formData.maxUses || ''}
                                        onChange={(e) => setFormData({ ...formData, maxUses: parseInt(e.target.value) })}
                                        placeholder="Unlimited"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="minimumAmount">Minimum Amount ($)</Label>
                                    <Input
                                        id="minimumAmount"
                                        type="number"
                                        value={formData.minimumAmount || ''}
                                        onChange={(e) => setFormData({ ...formData, minimumAmount: parseFloat(e.target.value) })}
                                        placeholder="No minimum"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="isActive"
                                    checked={formData.isActive || false}
                                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                                />
                                <Label htmlFor="isActive">Active</Label>
                            </div>

                            <div className="flex justify-end space-x-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsFormOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit">
                                    {editingCoupon ? 'Update' : 'Create'} Coupon
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
