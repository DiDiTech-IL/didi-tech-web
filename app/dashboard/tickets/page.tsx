"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import {
    AlertCircle,
    Calendar,
    Edit2,
    Eye,
    Plus,
    Tag,
    Trash2,
    User
} from "lucide-react";
import { useEffect, useState } from "react";

interface Ticket {
    id: string;
    title: string;
    description: string;
    status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    createdAt: string;
    updatedAt: string;
    client: {
        id: string;
        name: string;
        email: string;
        company?: string;
    };
    assignedTo?: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
}

interface Client {
    id: string;
    name: string;
    email: string;
    company?: string;
}

interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
}

export default function TicketsPage() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
    const [formData, setFormData] = useState<{
        title: string;
        description: string;
        clientId: string;
        priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
        assignedToId: string;
    }>({
        title: '',
        description: '',
        clientId: '',
        priority: 'MEDIUM',
        assignedToId: '',
    });

    const loadTickets = async () => {
        try {
            const response = await fetch('/api/tickets');
            const data = await response.json();
            setTickets(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to load tickets:', error);
            setTickets([]);
        }
    };

    const loadClients = async () => {
        try {
            const response = await fetch('/api/clients');
            const data = await response.json();
            setClients(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to load clients:', error);
            setClients([]);
        }
    };

    const loadUsers = async () => {
        try {
            const response = await fetch('/api/users');
            const data = await response.json();
            setUsers(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to load users:', error);
            setUsers([]);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await Promise.all([loadTickets(), loadClients(), loadUsers()]);
            setLoading(false);
        };
        loadData();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = editingTicket ? `/api/tickets/${editingTicket.id}` : '/api/tickets';
            const method = editingTicket ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                await loadTickets();
                setIsDialogOpen(false);
                setEditingTicket(null);
                setFormData({
                    title: '',
                    description: '',
                    clientId: '',
                    priority: 'MEDIUM',
                    assignedToId: '',
                });
            }
        } catch (error) {
            console.error('Failed to save ticket:', error);
        }
    };

    const handleEdit = (ticket: Ticket) => {
        setEditingTicket(ticket);
        setFormData({
            title: ticket.title,
            description: ticket.description,
            clientId: ticket.client.id,
            priority: ticket.priority,
            assignedToId: ticket.assignedTo?.id || '',
        });
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this ticket?')) {
            try {
                const response = await fetch(`/api/tickets/${id}`, {
                    method: 'DELETE',
                });
                if (response.ok) {
                    await loadTickets();
                }
            } catch (error) {
                console.error('Failed to delete ticket:', error);
            }
        }
    };

    const handleStatusChange = async (id: string, status: string) => {
        try {
            const response = await fetch(`/api/tickets/${id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });
            if (response.ok) {
                await loadTickets();
            }
        } catch (error) {
            console.error('Failed to update status:', error);
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'URGENT': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            case 'HIGH': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
            case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'LOW': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'OPEN': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case 'IN_PROGRESS': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
            case 'RESOLVED': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'CLOSED': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
        }
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-48 bg-gray-200 rounded"></div>
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
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Support Tickets</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage and track customer support requests</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            New Ticket
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <form onSubmit={handleSubmit}>
                            <DialogHeader>
                                <DialogTitle>{editingTicket ? 'Edit Ticket' : 'Create New Ticket'}</DialogTitle>
                                <DialogDescription>
                                    {editingTicket ? 'Update the ticket details below.' : 'Create a new support ticket for a client.'}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="title">Title</Label>
                                    <Input
                                        id="title"
                                        value={formData.title}
                                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="client">Client</Label>
                                    <Select value={formData.clientId} onValueChange={(value) => setFormData(prev => ({ ...prev, clientId: value }))}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a client" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {clients.map((client) => (
                                                <SelectItem key={client.id} value={client.id}>
                                                    {client.name} ({client.company || client.email})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="priority">Priority</Label>
                                    <Select value={formData.priority} onValueChange={(value: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT') => setFormData(prev => ({ ...prev, priority: value }))}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="LOW">Low</SelectItem>
                                            <SelectItem value="MEDIUM">Medium</SelectItem>
                                            <SelectItem value="HIGH">High</SelectItem>
                                            <SelectItem value="URGENT">Urgent</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="assignedTo">Assign To</Label>
                                    <Select value={formData.assignedToId} onValueChange={(value) => setFormData(prev => ({ ...prev, assignedToId: value }))}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a team member" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">Unassigned</SelectItem>
                                            {users.map((user) => (
                                                <SelectItem key={user.id} value={user.id}>
                                                    {user.firstName} {user.lastName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit">
                                    {editingTicket ? 'Update' : 'Create'} Ticket
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Tickets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tickets.map((ticket, index) => (
                    <motion.div
                        key={ticket.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card className="hover:shadow-lg transition-shadow">
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-lg">{ticket.title}</CardTitle>
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="outline" onClick={() => handleEdit(ticket)}>
                                            <Edit2 className="h-4 w-4" />
                                        </Button>
                                        <Button size="sm" variant="outline" onClick={() => handleDelete(ticket.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Badge className={getPriorityColor(ticket.priority)}>
                                        <AlertCircle className="h-3 w-3 mr-1" />
                                        {ticket.priority}
                                    </Badge>
                                    <Select value={ticket.status} onValueChange={(value) => handleStatusChange(ticket.id, value)}>
                                        <SelectTrigger className="w-auto h-6 px-2 text-xs">
                                            <Badge className={getStatusColor(ticket.status)}>
                                                <Tag className="h-3 w-3 mr-1" />
                                                {ticket.status.replace('_', ' ')}
                                            </Badge>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="OPEN">Open</SelectItem>
                                            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                            <SelectItem value="RESOLVED">Resolved</SelectItem>
                                            <SelectItem value="CLOSED">Closed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3">
                                    {ticket.description}
                                </p>
                                
                                <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        <span>{ticket.client.name}</span>
                                        {ticket.client.company && (
                                            <span className="text-xs">({ticket.client.company})</span>
                                        )}
                                    </div>
                                    
                                    {ticket.assignedTo && (
                                        <div className="flex items-center gap-2">
                                            <Eye className="h-4 w-4" />
                                            <span>Assigned to {ticket.assignedTo.firstName} {ticket.assignedTo.lastName}</span>
                                        </div>
                                    )}
                                    
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {tickets.length === 0 && (
                <div className="text-center py-12">
                    <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No tickets found</h3>
                    <p className="text-gray-500 dark:text-gray-400">Get started by creating your first support ticket.</p>
                </div>
            )}
        </div>
    );
}
