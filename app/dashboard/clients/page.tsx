"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Users,
    Plus,
    Search,
    Filter,
    Mail,
    Phone,
    Building,
    Edit,
    Trash2,
    MoreHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "@/hooks/use-translation";


interface Client {
    id: string;
    name: string;
    email: string;
    phone?: string;
    company?: string;
    address?: string;
    totalProducts: number;
    totalRevenue: number;
    status: 'active' | 'inactive';
    createdAt: string;
    updatedAt: string;
}

interface ClientFormData {
    name: string;
    email: string;
    phone: string;
    company: string;
    address: string;
}

export default function ClientsPage() {
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | null>(null);
    const [formData, setFormData] = useState<ClientFormData>({
        name: "",
        email: "",
        phone: "",
        company: "",
        address: "",
    });
    const { t } = useTranslation();

    const loadClients = async () => {
        try {
            const response = await fetch('/api/clients');
            if (response.ok) {
                const data = await response.json();
                setClients(data);
            }
        } catch (error) {
            console.error('Failed to load clients:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadClients();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const url = editingClient ? `/api/clients/${editingClient.id}` : '/api/clients';
            const method = editingClient ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                await loadClients();
                setIsFormOpen(false);
                setEditingClient(null);
                setFormData({ name: "", email: "", phone: "", company: "", address: "" });
                console.log(editingClient ? 'Client updated successfully!' : 'Client created successfully!');
            } else {
                throw new Error('Failed to save client');
            }
        } catch (error) {
            console.error('Error saving client:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (client: Client) => {
        setEditingClient(client);
        setFormData({
            name: client.name,
            email: client.email,
            phone: client.phone || "",
            company: client.company || "",
            address: client.address || "",
        });
        setIsFormOpen(true);
    };

    const handleDelete = async (clientId: string) => {
        if (!confirm('Are you sure you want to delete this client?')) return;

        try {
            const response = await fetch(`/api/clients/${clientId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                await loadClients();
                console.log('Client deleted successfully!');
            } else {
                throw new Error('Failed to delete client');
            }
        } catch (error) {
            console.error('Error deleting client:', error);
        }
    };

    const filteredClients = clients.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.company?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = {
        total: clients.length,
        active: clients.filter(c => c.status === 'active').length,
        totalRevenue: clients.reduce((sum, c) => sum + c.totalRevenue, 0),
    };

    return (
        <div className="p-6 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                        Clients
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">
                        Manage your client relationships and information.
                    </p>
                </div>
                <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => {
                            setEditingClient(null);
                            setFormData({ name: "", email: "", phone: "", company: "", address: "" });
                        }}>
                            <Plus className="h-4 w-4 mr-2" />
                            {t('clients.addClient')}
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>
                                {editingClient ? t('clients.editClient') : t('clients.addClient')}
                            </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="name">{t('forms.name')} *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="email">{t('forms.email')} *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="phone">{t('forms.phone')}</Label>
                                <Input
                                    id="phone"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label htmlFor="company">{t('forms.company')}</Label>
                                <Input
                                    id="company"
                                    value={formData.company}
                                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label htmlFor="address">{t('forms.address')}</Label>
                                <Textarea
                                    id="address"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
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
                                    {loading ? 'Saving...' : (editingClient ? 'Update' : 'Create')}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                        {t('clients.totalClients')}
                                    </p>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                        {stats.total}
                                    </p>
                                </div>
                                <Users className="h-8 w-8 text-blue-600" />
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
                                        Active Clients
                                    </p>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                        {stats.active}
                                    </p>
                                </div>
                                <Badge className="h-8 px-3 bg-green-100 text-green-700">
                                    Active
                                </Badge>
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
                                        Total Revenue
                                    </p>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                        ${stats.totalRevenue.toLocaleString()}
                                    </p>
                                </div>
                                <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                                    <span className="text-sm font-bold text-purple-600">$</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Search and Filters */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>All Clients</CardTitle>
                        <div className="flex items-center space-x-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Search clients..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 w-64"
                                />
                            </div>
                            <Button variant="outline" size="sm">
                                <Filter className="h-4 w-4 mr-2" />
                                Filter
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Client</TableHead>
                                    <TableHead>Contact</TableHead>
                                    <TableHead>Company</TableHead>
                                    <TableHead>Products</TableHead>
                                    <TableHead>Revenue</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="w-[70px]">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8">
                                            Loading clients...
                                        </TableCell>
                                    </TableRow>
                                ) : filteredClients.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8">
                                            No clients found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredClients.map((client) => (
                                        <TableRow key={client.id}>
                                            <TableCell>
                                                <div className="flex items-center space-x-3">
                                                    <div className="h-8 w-8 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-full flex items-center justify-center">
                                                        <span className="text-white font-medium text-sm">
                                                            {client.name.charAt(0)}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-900 dark:text-white">
                                                            {client.name}
                                                        </p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <div className="flex items-center space-x-1">
                                                        <Mail className="h-3 w-3 text-slate-400" />
                                                        <span className="text-sm text-slate-600 dark:text-slate-400">
                                                            {client.email}
                                                        </span>
                                                    </div>
                                                    {client.phone && (
                                                        <div className="flex items-center space-x-1">
                                                            <Phone className="h-3 w-3 text-slate-400" />
                                                            <span className="text-sm text-slate-600 dark:text-slate-400">
                                                                {client.phone}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {client.company && (
                                                    <div className="flex items-center space-x-1">
                                                        <Building className="h-3 w-3 text-slate-400" />
                                                        <span className="text-sm text-slate-600 dark:text-slate-400">
                                                            {client.company}
                                                        </span>
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {client.totalProducts} products
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-medium">
                                                    ${client.totalRevenue && client.totalRevenue.toLocaleString()}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={client.status === 'active' ? 'default' : 'secondary'}
                                                    className={client.status === 'active' ? 'bg-green-100 text-green-700' : ''}
                                                >
                                                    {client.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => handleEdit(client)}>
                                                            <Edit className="h-4 w-4 mr-2" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => handleDelete(client.id)}
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
