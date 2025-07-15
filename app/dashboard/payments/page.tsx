"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import {
    Calendar,
    CheckCircle,
    Clock,
    DollarSign,
    Download,
    MoreHorizontal,
    Plus,
    Search,
    Trash2,
    XCircle
} from "lucide-react";
import { useEffect, useState } from "react";

interface Payment {
    id: string;
    amount: number;
    currency: string;
    status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
    method: string;
    invoiceId?: string;
    invoiceNumber?: string;
    clientId: string;
    clientName: string;
    productId?: string;
    productName?: string;
    description?: string;
    transactionId?: string;
    paymentDate: string;
    dueDate?: string;
    createdAt: string;
    updatedAt: string;
}

interface PaymentFormData {
    amount: string;
    currency: string;
    method: string;
    clientId: string;
    productId: string;
    description: string;
    dueDate: string;
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [clients, setClients] = useState<Array<{id: string, name: string}>>([]);
  const [products, setProducts] = useState<Array<{id: string, name: string}>>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
    const [formData, setFormData] = useState<PaymentFormData>({
        amount: "",
        currency: "ILS",
        method: "bank_transfer",
        clientId: "",
        productId: "",
        description: "",
        dueDate: "",
    });

  const loadPayments = async () => {
    try {
      const response = await fetch('/api/payments');
      if (response.ok) {
        const data = await response.json();
        setPayments(data);
      }
    } catch (error) {
      console.error('Failed to load payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadClients = async () => {
    try {
      const response = await fetch('/api/clients');
      if (response.ok) {
        const data = await response.json();
        setClients(data.map((client: {id: string, name: string}) => ({ id: client.id, name: client.name })));
      }
    } catch (error) {
      console.error('Failed to load clients:', error);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data.map((product: {id: string, name: string}) => ({ id: product.id, name: product.name })));
      }
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  };

  useEffect(() => {
    loadPayments();
    loadClients();
    loadProducts();
  }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const url = editingPayment ? `/api/payments/${editingPayment.id}` : '/api/payments';
            const method = editingPayment ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    amount: parseFloat(formData.amount),
                }),
            });

            if (response.ok) {
                await loadPayments();
                setIsFormOpen(false);
                setEditingPayment(null);
                setFormData({
                    amount: "",
                    currency: "ILS",
                    method: "bank_transfer",
                    clientId: "",
                    productId: "",
                    description: "",
                    dueDate: "",
                });
                console.log(editingPayment ? 'Payment updated successfully!' : 'Payment recorded successfully!');
            } else {
                throw new Error('Failed to save payment');
            }
        } catch (error) {
            console.error('Error saving payment:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (paymentId: string, newStatus: Payment['status']) => {
        try {
            const response = await fetch(`/api/payments/${paymentId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            if (response.ok) {
                await loadPayments();
                console.log('Payment status updated successfully!');
            } else {
                throw new Error('Failed to update payment status');
            }
        } catch (error) {
            console.error('Error updating payment status:', error);
        }
    };

    const handleDelete = async (paymentId: string) => {
        if (!confirm('Are you sure you want to delete this payment record?')) return;

        try {
            const response = await fetch(`/api/payments/${paymentId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                await loadPayments();
                console.log('Payment deleted successfully!');
            } else {
                throw new Error('Failed to delete payment');
            }
        } catch (error) {
            console.error('Error deleting payment:', error);
        }
    };

    const filteredPayments = payments.filter(payment => {
        const matchesSearch =
            payment.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            payment.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            payment.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            payment.transactionId?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === "all" || payment.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const stats = {
        total: Number(payments.reduce((sum, p) => sum + Number(p.amount), 0).toFixed(2)),
        completed: Number(payments.filter(p => p.status === 'COMPLETED').reduce((sum, p) => sum + Number(p.amount), 0).toFixed(2)),
        pending: Number(payments.filter(p => p.status === 'PENDING').reduce((sum, p) => sum + Number(p.amount), 0).toFixed(2)),
        failed: payments.filter(p => p.status === 'FAILED').length,
    };

    const getStatusIcon = (status: Payment['status']) => {
        switch (status) {
            case 'COMPLETED':
                return <CheckCircle className="h-4 w-4 text-green-600" />;
            case 'FAILED':
                return <XCircle className="h-4 w-4 text-red-600" />;
            case 'PENDING':
                return <Clock className="h-4 w-4 text-yellow-600" />;
            case 'REFUNDED':
                return <XCircle className="h-4 w-4 text-gray-600" />;
            default:
                return <Clock className="h-4 w-4 text-gray-600" />;
        }
    };

    const getStatusColor = (status: Payment['status']) => {
        switch (status) {
            case 'COMPLETED':
                return 'bg-green-100 text-green-700 border-green-200';
            case 'FAILED':
                return 'bg-red-100 text-red-700 border-red-200';
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'REFUNDED':
                return 'bg-gray-100 text-gray-700 border-gray-200';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    return (
        <div className="p-6 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                        Payments
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">
                        Track and manage all payment transactions.
                    </p>
                </div>
                <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => {
                            setEditingPayment(null);
                            setFormData({
                                amount: "",
                                currency: "ILS",
                                method: "bank_transfer",
                                clientId: "",
                                productId: "",
                                description: "",
                                dueDate: "",
                            });
                        }}>
                            <Plus className="h-4 w-4 mr-2" />
                            Record Payment
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>
                                {editingPayment ? 'Edit Payment' : 'Record New Payment'}
                            </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="clientId">Client *</Label>
                                <Select
                                    value={formData.clientId}
                                    onValueChange={(value) => setFormData({ ...formData, clientId: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a client" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {clients.map(client => (
                                            <SelectItem key={client.id} value={client.id}>
                                                {client.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="productId">Product (Optional)</Label>
                                <Select
                                    value={formData.productId}
                                    onValueChange={(value) => setFormData({ ...formData, productId: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a product" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">None</SelectItem>
                                        {products.map(product => (
                                            <SelectItem key={product.id} value={product.id}>
                                                {product.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="amount">Amount *</Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    step="0.01"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="currency">Currency</Label>
                                <Select
                                    value={formData.currency}
                                    onValueChange={(value) => setFormData({ ...formData, currency: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ILS">ILS</SelectItem>
                                        <SelectItem value="EUR">EUR</SelectItem>
                                        <SelectItem value="GBP">GBP</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="method">Payment Method</Label>
                                <Select
                                    value={formData.method}
                                    onValueChange={(value) => setFormData({ ...formData, method: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                        <SelectItem value="credit_card">Credit Card</SelectItem>
                                        <SelectItem value="paypal">PayPal</SelectItem>
                                        <SelectItem value="crypto">Cryptocurrency</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label htmlFor="dueDate">Due Date</Label>
                                <Input
                                    id="dueDate"
                                    type="date"
                                    value={formData.dueDate}
                                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end space-x-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsFormOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={loading}>
                                    {loading ? 'Saving...' : (editingPayment ? 'Update' : 'Record')}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                        Total Revenue
                                    </p>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                        ₪{stats.total}
                                    </p>
                                </div>
                                <DollarSign className="h-8 w-8 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                        Completed
                                    </p>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                        ₪{stats.completed.toLocaleString()}
                                    </p>
                                </div>
                                <CheckCircle className="h-8 w-8 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                        Pending
                                    </p>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                        ₪{stats.pending.toLocaleString()}
                                    </p>
                                </div>
                                <Clock className="h-8 w-8 text-yellow-600" />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                        Failed
                                    </p>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                        {stats.failed}
                                    </p>
                                </div>
                                <XCircle className="h-8 w-8 text-red-600" />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Search and Filters */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>All Payments</CardTitle>
                        <div className="flex items-center space-x-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Search payments..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 w-64"
                                />
                            </div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-40">
                                    <SelectValue />
                                </SelectTrigger>                  <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="COMPLETED">Completed</SelectItem>
                                    <SelectItem value="PENDING">Pending</SelectItem>
                                    <SelectItem value="FAILED">Failed</SelectItem>
                                    <SelectItem value="REFUNDED">Refunded</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button variant="outline" size="sm">
                                <Download className="h-4 w-4 mr-2" />
                                Export
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Transaction</TableHead>
                                    <TableHead>Client</TableHead>
                                    <TableHead>Product</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Method</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="w-[70px]">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-8">
                                            Loading payments...
                                        </TableCell>
                                    </TableRow>
                                ) : filteredPayments.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-8">
                                            No payments found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredPayments.map((payment) => (
                                        <TableRow key={payment.id}>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium text-slate-900 dark:text-white">
                                                        {payment.transactionId || `PAY-${payment.id.slice(0, 8)}`}
                                                    </p>
                                                    {payment.invoiceNumber && (
                                                        <p className="text-sm text-slate-500">
                                                            Invoice: {payment.invoiceNumber}
                                                        </p>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-medium">
                                                    {payment.clientName}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                {payment.productName ? (
                                                    <span className="text-sm text-slate-600 dark:text-slate-400">
                                                        {payment.productName}
                                                    </span>
                                                ) : (
                                                    <span className="text-sm text-slate-400">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-medium">
                                                    {payment.currency} {payment.amount.toLocaleString()}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {payment.method && payment.method.replace('_', ' ')}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-1">
                                                    {getStatusIcon(payment.status)}
                                                    <Badge
                                                        variant="outline"
                                                        className={getStatusColor(payment.status)}
                                                    >
                                                        {payment.status}
                                                    </Badge>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-1">
                                                    <Calendar className="h-3 w-3 text-slate-400" />
                                                    <span className="text-sm text-slate-600 dark:text-slate-400">
                                                        {new Date(payment.paymentDate).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        {payment.status === 'PENDING' && (
                                                            <DropdownMenuItem
                                                                onClick={() => handleStatusUpdate(payment.id, 'COMPLETED')}
                                                            >
                                                                <CheckCircle className="h-4 w-4 mr-2" />
                                                                Mark as Completed
                                                            </DropdownMenuItem>
                                                        )}
                                                        {payment.status === 'PENDING' && (
                                                            <DropdownMenuItem
                                                                onClick={() => handleStatusUpdate(payment.id, 'FAILED')}
                                                            >
                                                                <XCircle className="h-4 w-4 mr-2" />
                                                                Mark as Failed
                                                            </DropdownMenuItem>
                                                        )}
                                                        <DropdownMenuItem
                                                            onClick={() => handleDelete(payment.id)}
                                                            className="text-red-600"
                                                        >
                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
