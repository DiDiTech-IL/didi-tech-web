"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X, Plus } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

interface ProductFormData {
    name: string;
    nameEn?: string;
    description: string;
    domain?: string;
    repository?: string;
    category?: string;
    features?: string[];
    pricing?: object;
    apiBaseUrl?: string;
    apiKey?: string;
    dbConnectionString?: string;
    dbType?: string;
    ownerId?: string;
    status?: string;
    version?: string;
}

interface Product {
    id: string;
    name: string;
    nameEn?: string;
    description: string;
    domain?: string;
    repository?: string;
    category?: string;
    features?: string[];
    pricing?: object;
    apiBaseUrl?: string;
    apiKey?: string;
    dbConnectionString?: string;
    dbType?: string;
    ownerId?: string;
    status: string;
    version?: string;
}

interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
}

interface ProductFormProps {
    product?: Product;
    users: User[];
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: ProductFormData) => Promise<void>;
}

const PRODUCT_STATUSES = [
    { value: 'DEVELOPMENT', label: 'Development' },
    { value: 'BETA', label: 'Beta' },
    { value: 'LIVE', label: 'Live' },
    { value: 'MAINTENANCE', label: 'Maintenance' },
    { value: 'DEPRECATED', label: 'Deprecated' },
    { value: 'RETIRED', label: 'Retired' },
];

const DB_TYPES = [
    { value: 'postgresql', label: 'PostgreSQL' },
    { value: 'mysql', label: 'MySQL' },
    { value: 'mongodb', label: 'MongoDB' },
    { value: 'sqlite', label: 'SQLite' },
    { value: 'redis', label: 'Redis' },
];

export default function ProductForm({ product, users, isOpen, onClose, onSubmit }: ProductFormProps) {
    const { t } = useTranslation();
    const [formData, setFormData] = useState<ProductFormData>({
        name: '',
        nameEn: '',
        description: '',
        domain: '',
        repository: '',
        category: '',
        features: [],
        apiBaseUrl: '',
        apiKey: '',
        dbConnectionString: '',
        dbType: '',
        ownerId: '',
        status: 'DEVELOPMENT',
        version: '',
    });
    const [newFeature, setNewFeature] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name || '',
                nameEn: product.nameEn || '',
                description: product.description || '',
                domain: product.domain || '',
                repository: product.repository || '',
                category: product.category || '',
                features: product.features || [],
                apiBaseUrl: product.apiBaseUrl || '',
                apiKey: product.apiKey || '',
                dbConnectionString: product.dbConnectionString || '',
                dbType: product.dbType || '',
                ownerId: product.ownerId || '',
                status: product.status || 'DEVELOPMENT',
                version: product.version || '',
            });
        } else {
            setFormData({
                name: '',
                nameEn: '',
                description: '',
                domain: '',
                repository: '',
                category: '',
                features: [],
                apiBaseUrl: '',
                apiKey: '',
                dbConnectionString: '',
                dbType: '',
                ownerId: '',
                status: 'DEVELOPMENT',
                version: '',
            });
        }
    }, [product]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSubmit(formData);
            onClose();
        } catch (error) {
            console.error('Form submission error:', error);
        } finally {
            setLoading(false);
        }
    };

    const addFeature = () => {
        if (newFeature.trim() && !formData.features?.includes(newFeature.trim())) {
            setFormData(prev => ({
                ...prev,
                features: [...(prev.features || []), newFeature.trim()]
            }));
            setNewFeature('');
        }
    };

    const removeFeature = (featureToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            features: prev.features?.filter(feature => feature !== featureToRemove) || []
        }));
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addFeature();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {product ? 'ערוך מוצר' : 'צור מוצר חדש'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Basic Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Basic Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="name">{t('forms.name')} *</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        required
                                        placeholder="My SaaS Product"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="nameEn">שם באנגלית (עבור כתובות תשלום)</Label>
                                    <Input
                                        id="nameEn"
                                        value={formData.nameEn}
                                        onChange={(e) => setFormData(prev => ({ ...prev, nameEn: e.target.value }))}
                                        placeholder="my-saas-product"
                                        pattern="^[a-z0-9-]+$"
                                        title="Only lowercase letters, numbers, and hyphens allowed"
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Used in payment URLs: pay.tachles.dev/{formData.nameEn || 'product-name'}
                                    </p>
                                </div>
                                <div>
                                    <Label htmlFor="description">{t('forms.description')} *</Label>
                                    <Textarea
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                        required
                                        placeholder="Brief description of your product"
                                        rows={3}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="category">קטגוריה</Label>
                                    <Input
                                        id="category"
                                        value={formData.category}
                                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                                        placeholder="e.g., SaaS, E-commerce, Analytics"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="version">גרסה</Label>
                                    <Input
                                        id="version"
                                        value={formData.version}
                                        onChange={(e) => setFormData(prev => ({ ...prev, version: e.target.value }))}
                                        placeholder="1.0.0"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Status and Owner */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Status & Management</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="status">Status</Label>
                                    <Select
                                        value={formData.status}
                                        onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {PRODUCT_STATUSES.map((status) => (
                                                <SelectItem key={status.value} value={status.value}>
                                                    {status.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="owner">Product Owner (Optional)</Label>
                                    <Select
                                        value={formData.ownerId}
                                        onValueChange={(value) => setFormData(prev => ({ ...prev, ownerId: value }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={users.length > 0 ? "Select owner" : "No users available"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {users.length > 0 ? (
                                                users.map((user) => (
                                                    <SelectItem key={user.id} value={user.id}>
                                                        {user.firstName} {user.lastName} ({user.email})
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <SelectItem disabled value="none">
                                                    No users available
                                                </SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                    {users.length === 0 && (
                                        <p className="text-sm text-gray-500 mt-1">
                                            Users will be available after they sign in to the system.
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="domain">Domain</Label>
                                    <Input
                                        id="domain"
                                        value={formData.domain}
                                        onChange={(e) => setFormData(prev => ({ ...prev, domain: e.target.value }))}
                                        placeholder="myapp.com"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="repository">Repository URL</Label>
                                    <Input
                                        id="repository"
                                        value={formData.repository}
                                        onChange={(e) => setFormData(prev => ({ ...prev, repository: e.target.value }))}
                                        placeholder="https://github.com/user/repo"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Features */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Features</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex gap-2">
                                    <Input
                                        value={newFeature}
                                        onChange={(e) => setNewFeature(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder="Add a feature"
                                    />
                                    <Button type="button" onClick={addFeature} size="sm">
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {formData.features?.map((feature, index) => (
                                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                            {feature}
                                            <X
                                                className="h-3 w-3 cursor-pointer"
                                                onClick={() => removeFeature(feature)}
                                            />
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Technical Configuration */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Technical Configuration</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="apiBaseUrl">API Base URL</Label>
                                    <Input
                                        id="apiBaseUrl"
                                        value={formData.apiBaseUrl}
                                        onChange={(e) => setFormData(prev => ({ ...prev, apiBaseUrl: e.target.value }))}
                                        placeholder="https://api.myapp.com"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="apiKey">API Key</Label>
                                    <Input
                                        id="apiKey"
                                        type="password"
                                        value={formData.apiKey}
                                        onChange={(e) => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
                                        placeholder="Auto-generated if empty"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="dbType">Database Type</Label>
                                    <Select
                                        value={formData.dbType}
                                        onValueChange={(value) => setFormData(prev => ({ ...prev, dbType: value }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select database type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {DB_TYPES.map((type) => (
                                                <SelectItem key={type.value} value={type.value}>
                                                    {type.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="dbConnectionString">Database Connection String</Label>
                                    <Input
                                        id="dbConnectionString"
                                        type="password"
                                        value={formData.dbConnectionString}
                                        onChange={(e) => setFormData(prev => ({ ...prev, dbConnectionString: e.target.value }))}
                                        placeholder="Encrypted connection string"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="flex justify-end gap-2 pt-6 border-t">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Saving...' : (product ? 'Update Product' : 'Create Product')}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
