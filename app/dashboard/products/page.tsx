"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { Database, DollarSign, Edit, Globe, Key, Play, Plus, Receipt, Trash2, Users, Webhook } from "lucide-react";
import { useEffect, useState } from "react";

import PaymentPlansManager from "@/components/PaymentPlansManager";
import ProductForm from "@/components/ProductForm";
import { useToast } from "@/hooks/use-toast";
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
    status: string;
    domain?: string;
    repository?: string;
    category?: string;
    features?: string[];
    pricing?: object;
    apiBaseUrl?: string;
    dbConnectionString?: string;
    dbType?: string;
    version?: string;
    monthlyRevenue: number;
    totalRevenue: number;
    launchedAt?: Date;
    owner?: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
    subscriptions: Array<{
        id: string;
        client: {
            id: string;
            name: string;
            email: string;
            company?: string;
        };
        plan: string;
        status: string;
        amount: number;
        currency: string;
        startDate: Date;
        nextBilling?: Date;
    }>;
    webhooks: Array<{
        id: string;
        url: string;
        events: string[];
        isActive: boolean;
    }>;
}

interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
}

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<Record<string, number>>({});
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedTab, setSelectedTab] = useState("overview");
    const { toast } = useToast();
    const { t } = useTranslation();

    const loadProducts = async () => {
        try {
            const response = await fetch('/api/products');
            const data = await response.json();
            setProducts(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to load products:', error);
            setProducts([]);
            toast({
                title: "שגיאת חיבור",
                description: "לא ניתן לטעון מוצרים. אנא בדוק את החיבור שלך.",
                variant: "destructive",
            });
        }
    };

    const loadStats = async () => {
        try {
            const response = await fetch('/api/products/stats');
            const data = await response.json();
            setStats(data || {});
        } catch (error) {
            console.error('Failed to load stats:', error);
            setStats({});
        }
    };

    const loadUsers = async () => {
        try {
            console.log('Loading users...');
            const response = await fetch('/api/users');
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Failed to fetch users - Status:', response.status, 'Response:', errorText);
                toast({
                    title: "Failed to Load Users",
                    description: `Server returned ${response.status}: ${response.statusText}. Some features may be limited.`,
                    variant: "destructive",
                });
                setUsers([]);
                return;
            }
            const data = await response.json();
            console.log('Users loaded successfully:', data.length, 'users');
            setUsers(data);
        } catch (error) {
            console.error('Failed to load users:', error);
            setUsers([]);
            toast({
                title: "User Loading Error",
                description: "Unable to connect to the server to load users. Product ownership features may be limited.",
                variant: "destructive",
            });
        }
    };

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            try {
                await Promise.all([
                    loadProducts(),
                    loadStats(),
                    loadUsers()
                ]);
            } catch (error) {
                console.error('Failed to load initial data:', error);
            } finally {
                setLoading(false);
            }
        };
        init();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleCreateProduct = async (data: ProductFormData) => {
        try {
            const response = await fetch('/api/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const error = await response.json();
                toast({
                    title: "Failed to Create Product",
                    description: error.error || 'An unexpected error occurred while creating the product',
                    variant: "destructive",
                });
                return;
            }

            toast({
                title: "הצלחה",
                description: "המוצר נוצר בהצלחה",
            });

            await loadProducts();
            await loadStats();
        } catch (error) {
            console.error('Error creating product:', error);
            toast({
                title: "Network Error",
                description: "Unable to connect to the server. Please check your connection and try again.",
                variant: "destructive",
            });
        }
    };

    const handleEditProduct = async (data: ProductFormData) => {
        if (!selectedProduct) return;

        try {
            const response = await fetch(`/api/products/${selectedProduct.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const error = await response.json();
                toast({
                    title: "Failed to Update Product",
                    description: error.error || 'An unexpected error occurred while updating the product',
                    variant: "destructive",
                });
                return;
            }

            toast({
                title: "Success",
                description: "Product updated successfully",
            });

            await loadProducts();
            await loadStats();
        } catch (error) {
            console.error('Error updating product:', error);
            toast({
                title: "Network Error",
                description: "Unable to connect to the server. Please check your connection and try again.",
                variant: "destructive",
            });
        }
    };

    const handleDeleteProduct = async (productId: string) => {
        if (!confirm('האם אתה בטוח שברצונך למחוק את המוצר הזה? פעולה זו תשבית גם את כל הוובהוקס ותבטל מנויים פעילים.')) {
            return;
        }

        try {
            const response = await fetch(`/api/products/${productId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const error = await response.json();
                toast({
                    title: "Failed to Delete Product",
                    description: error.error || 'An unexpected error occurred while deleting the product',
                    variant: "destructive",
                });
                return;
            }

            toast({
                title: "Success",
                description: "המוצר נמחק בהצלחה",
            });

            await loadProducts();
            await loadStats();
        } catch (error) {
            console.error('Error deleting product:', error);
            toast({
                title: "Network Error",
                description: "Unable to connect to the server. Please check your connection and try again.",
                variant: "destructive",
            });
        }
    };

    const testApiEndpoint = async (productId: string, endpoint: string = '/health') => {
        try {
            const response = await fetch(`/api/products/${productId}/test-api`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ endpoint }),
            });

            const result = await response.json();

            toast({
                title: result.success ? "API Test Successful" : "API Test Failed",
                description: result.success
                    ? `Status: ${result.status} ${result.statusText} - API endpoint is responding correctly`
                    : result.error || 'API endpoint is not responding or returned an error',
                variant: result.success ? "default" : "destructive",
            });
        } catch (error) {
            console.error('Error testing API endpoint:', error);
            toast({
                title: "API Test Failed",
                description: "Unable to connect to the API endpoint. Please check the connection and try again.",
                variant: "destructive",
            });
        }
    };

    const executeDbOperation = async (productId: string, operation: 'backup' | 'migrate' | 'status') => {
        try {
            const response = await fetch(`/api/products/${productId}/db-operation`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ operation }),
            });

            const result = await response.json();

            toast({
                title: result.success ? "Database Operation Successful" : "Database Operation Failed",
                description: result.success
                    ? result.data || `Database ${operation} operation completed successfully`
                    : result.error || `Failed to execute database ${operation} operation`,
                variant: result.success ? "default" : "destructive",
            });
        } catch (error) {
            console.error('Error executing database operation:', error);
            toast({
                title: "Database Operation Failed",
                description: "Unable to connect to the database. Please check the connection and try again.",
                variant: "destructive",
            });
        }
    };

    const generateInvoice = async (productId: string) => {
        try {
            const response = await fetch('/api/invoices/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ productId }),
            });

            if (!response.ok) {
                const error = await response.json();
                toast({
                    title: "Failed to Generate Invoice",
                    description: error.error || 'An unexpected error occurred while generating the invoice',
                    variant: "destructive",
                });
                return;
            }

            toast({
                title: "Success",
                description: "Invoice generated successfully and is ready for download",
            });
        } catch (error) {
            console.error('Error generating invoice:', error);
            toast({
                title: "Invoice Generation Failed",
                description: "Unable to connect to the server. Please check your connection and try again.",
                variant: "destructive",
            });
        }
    };

    const getStatusColor = (status: string) => {
        const colors = {
            DEVELOPMENT: 'bg-blue-100 text-blue-800',
            BETA: 'bg-yellow-100 text-yellow-800',
            LIVE: 'bg-green-100 text-green-800',
            MAINTENANCE: 'bg-purple-100 text-purple-800',
            DEPRECATED: 'bg-orange-100 text-orange-800',
            RETIRED: 'bg-red-100 text-red-800',
        };
        return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    };

    const openCreateForm = () => {
        setSelectedProduct(null);
        setIsFormOpen(true);
    };

    const openEditForm = (product: Product) => {
        setSelectedProduct(product);
        setIsFormOpen(true);
    };

    const closeForm = () => {
        setSelectedProduct(null);
        setIsFormOpen(false);
    };

    const createPaymentPlan = () => {
        // This will be handled by the PaymentPlansManager component
        // We could navigate to a specific product or focus on the payment plans tab
        setSelectedTab("payment-plans");
        toast({
            title: "Payment Plans",
            description: "השתמש במנהל תוכניות התשלום למטה כדי ליצור ולנהל תוכניות עבור המוצר הזה.",
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                <span className="ml-2">טוען מוצרים...</span>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">ניהול מוצרים</h1>
                    <p className="text-slate-600 dark:text-slate-400">Manage your SaaS products, subscriptions, and deployments</p>
                </div>
                <Button
                    onClick={openCreateForm}
                    className="bg-gradient-to-r from-purple-600 to-cyan-600"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    New Product
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">מוצרים פעילים</p>
                                    <p className="text-2xl font-bold">{stats.liveProducts || 0}</p>
                                </div>
                                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                                    <Globe className="h-4 w-4 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">מוצרי בטא</p>
                                    <p className="text-2xl font-bold">{stats.betaProducts || 0}</p>
                                </div>
                                <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                                    <Play className="h-4 w-4 text-yellow-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">מנויים פעילים</p>
                                    <p className="text-2xl font-bold">{stats.activeSubscriptions || 0}</p>
                                </div>
                                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                                    <Users className="h-4 w-4 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">הכנסות חודשיות</p>
                                    <p className="text-2xl font-bold">${stats.monthlyRevenue?.toLocaleString() || 0}</p>
                                </div>
                                <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                                    <Receipt className="text-purple-600 h-4 w-4" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{t('dashboard.totalRevenue')}</p>
                                    <p className="text-2xl font-bold">${stats.totalRevenue?.toLocaleString() || 0}</p>
                                </div>
                                <div className="h-8 w-8 bg-emerald-100 rounded-full flex items-center justify-center">
                                    <span className="text-emerald-600 font-bold">$</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Products Table */}
            <Card>
                <CardHeader>
                    <CardTitle>{t('products.allProducts')}</CardTitle>
                </CardHeader>
                <CardContent>
                    {products.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-slate-500 mb-4">{t('products.noProducts')}</p>
                            <Button onClick={openCreateForm}>
                                <Plus className="h-4 w-4 mr-2" />
                                {t('products.createFirstProduct')}
                            </Button>
                        </div>
                    ) : (
                        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                            <TabsList className="mb-4">
                                <TabsTrigger value="overview">{t('products.overview')}</TabsTrigger>
                                <TabsTrigger value="subscriptions">{t('products.subscriptions')}</TabsTrigger>
                                <TabsTrigger value="payment-plans">תוכניות תשלום</TabsTrigger>
                                <TabsTrigger value="webhooks">{t('products.webhooks')}</TabsTrigger>
                            </TabsList>
                            
                            <TabsContent value="overview">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>{t('products.product')}</TableHead>
                                            <TableHead>{t('products.status')}</TableHead>
                                            <TableHead>{t('products.domain')}</TableHead>
                                            <TableHead>קישור תשלום</TableHead>
                                            <TableHead>{t('products.category')}</TableHead>
                                            <TableHead>{t('products.revenue')}</TableHead>
                                            <TableHead>{t('products.subscriptions')}</TableHead>
                                            <TableHead>{t('products.actions')}</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {products.map((product) => (
                                            <TableRow key={product.id}>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium">{product.name}</p>
                                                        <p className="text-sm text-slate-500 truncate max-w-xs">{product.description}</p>
                                                        {product.version && (
                                                            <Badge variant="outline" className="text-xs mt-1">v{product.version}</Badge>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={getStatusColor(product.status)}>
                                                        {product.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {product.domain ? (
                                                        <a
                                                            href={`https://${product.domain}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-blue-600 hover:underline flex items-center"
                                                        >
                                                            <Globe className="h-4 w-4 ml-1" />
                                                            {product.domain}
                                                        </a>
                                                    ) : (
                                                        <span className="text-slate-400">{t('products.notDeployed')}</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {product.nameEn ? (
                                                        <a
                                                            href={`https://pay.tachles.dev/${product.nameEn}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-emerald-600 hover:underline flex items-center text-sm"
                                                        >
                                                            <DollarSign className="h-4 w-4 mr-1" />
                                                            pay.tachles.dev/{product.nameEn}
                                                        </a>
                                                    ) : (
                                                        <span className="text-slate-400 text-sm">הגדר שם באנגלית</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {product.category ? (
                                                        <Badge variant="secondary">{product.category}</Badge>
                                                    ) : (
                                                        <span className="text-slate-400">-</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium">${Number(product.monthlyRevenue).toLocaleString()}/mo</p>
                                                        <p className="text-sm text-slate-500">${Number(product.totalRevenue).toLocaleString()} total</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="outline">
                                                            {product.subscriptions?.length || 0} {t('products.clients')}
                                                        </Badge>
                                                        {product.webhooks?.length > 0 && (
                                                            <Badge variant={product.webhooks.some(w => w.isActive) ? "default" : "secondary"}>
                                                                <Webhook className="h-3 w-3 mr-1" />
                                                                {product.webhooks.filter(w => w.isActive).length}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => openEditForm(product)}
                                                            title={t('products.editProduct')}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => generateInvoice(product.id)}
                                                            title={t('products.generateInvoice')}
                                                            className="text-emerald-600"
                                                        >
                                                            <Receipt className="h-4 w-4" />
                                                        </Button>
                                                        {product.apiBaseUrl && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => testApiEndpoint(product.id, '/health')}
                                                                title={t('products.testApi')}
                                                            >
                                                                <Key className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => window.open(`/api/public/payment-plans/${product.id}`, '_blank')}
                                                            title="תצוגה מקדימה של API תוכניות תשלום"
                                                            className="text-blue-600"
                                                        >
                                                            <DollarSign className="h-4 w-4" />
                                                        </Button>
                                                        {product.dbConnectionString && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => executeDbOperation(product.id, 'status')}
                                                                title={t('products.dbStatus')}
                                                            >
                                                                <Database className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDeleteProduct(product.id)}
                                                            className="text-red-600"
                                                            title={t('products.deleteProduct')}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TabsContent>
                            
                            <TabsContent value="subscriptions">
                                <div className="space-y-4">
                                    {products.map((product) => (
                                        product.subscriptions && product.subscriptions.length > 0 && (
                                            <Card key={product.id}>
                                                <CardHeader>
                                                    <CardTitle className="flex items-center gap-2">
                                                        {product.name}
                                                        <Badge className={getStatusColor(product.status)}>
                                                            {product.status}
                                                        </Badge>
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead>{t('clients.client')}</TableHead>
                                                                <TableHead>{t('products.plan')}</TableHead>
                                                                <TableHead>{t('products.status')}</TableHead>
                                                                <TableHead>{t('products.amount')}</TableHead>
                                                                <TableHead>{t('products.nextBilling')}</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {product.subscriptions.map((subscription) => (
                                                                <TableRow key={subscription.id}>
                                                                    <TableCell>
                                                                        <div>
                                                                            <p className="font-medium">{subscription.client.name}</p>
                                                                            <p className="text-sm text-slate-500">
                                                                                {subscription.client.company || subscription.client.email}
                                                                            </p>
                                                                        </div>
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <Badge variant="outline">{subscription.plan}</Badge>
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <Badge variant={subscription.status === 'ACTIVE' ? 'default' : 'secondary'}>
                                                                            {subscription.status}
                                                                        </Badge>
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        ${subscription.amount.toLocaleString()} {subscription.currency}
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        {subscription.nextBilling 
                                                                            ? new Date(subscription.nextBilling).toLocaleDateString()
                                                                            : 'One-time'
                                                                        }
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </CardContent>
                                            </Card>
                                        )
                                    ))}
                                </div>
                            </TabsContent>
                            
                            <TabsContent value="payment-plans">
                                <div className="space-y-4">
                                    {products.map((product) => (
                                        <Card key={product.id}>
                                            <CardHeader>
                                                <CardTitle className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        {product.name}
                                                        <Badge className={getStatusColor(product.status)}>
                                                            {product.status}
                                                        </Badge>
                                                    </div>
                                                    <Button
                                                        onClick={() => createPaymentPlan()}
                                                        size="sm"
                                                        className="bg-gradient-to-r from-green-600 to-emerald-600"
                                                    >
                                                        <Plus className="h-4 w-4 mr-2" />
                                                        Add Plan
                                                    </Button>
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <PaymentPlansManager productId={product.id} />
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </TabsContent>
                            
                            <TabsContent value="webhooks">
                                <div className="space-y-4">
                                    {products.map((product) => (
                                        product.webhooks && product.webhooks.length > 0 && (
                                            <Card key={product.id}>
                                                <CardHeader>
                                                    <CardTitle className="flex items-center gap-2">
                                                        {product.name}
                                                        <Badge className={getStatusColor(product.status)}>
                                                            {product.status}
                                                        </Badge>
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead>URL</TableHead>
                                                                <TableHead>אירועים</TableHead>
                                                                <TableHead>סטטוס</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {product.webhooks.map((webhook) => (
                                                                <TableRow key={webhook.id}>
                                                                    <TableCell>
                                                                        <code className="text-sm bg-slate-100 px-2 py-1 rounded">
                                                                            {webhook.url}
                                                                        </code>
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <div className="flex flex-wrap gap-1">
                                                                            {webhook.events.slice(0, 3).map((event) => (
                                                                                <Badge key={event} variant="secondary" className="text-xs">
                                                                                    {event}
                                                                                </Badge>
                                                                            ))}
                                                                            {webhook.events.length > 3 && (
                                                                                <Badge variant="secondary" className="text-xs">
                                                                                    +{webhook.events.length - 3}
                                                                                </Badge>
                                                                            )}
                                                                        </div>
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <Badge variant={webhook.isActive ? 'default' : 'secondary'}>
                                                                            {webhook.isActive ? 'Active' : 'Inactive'}
                                                                        </Badge>
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </CardContent>
                                            </Card>
                                        )
                                    ))}
                                </div>
                            </TabsContent>
                        </Tabs>
                    )}
                </CardContent>
            </Card>

            {/* Product Form Modal */}
            <ProductForm
                product={selectedProduct ? {
                    ...selectedProduct,
                    ownerId: selectedProduct.owner?.id,
                    features: selectedProduct.features || [],
                } : undefined}
                users={users}
                isOpen={isFormOpen}
                onClose={closeForm}
                onSubmit={selectedProduct ? handleEditProduct : handleCreateProduct}
            />
        </div>
    );
}
