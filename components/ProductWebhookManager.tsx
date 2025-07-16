"use client";

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Webhook, UserPlus } from 'lucide-react';

interface WebhookData {
    id: string;
    url: string;
    events: string[];
    isActive: boolean;
    secret?: string;
    lastTriggered?: string;
    createdAt: string;
}

interface ProductWebhookManagerProps {
    productId: string;
    productName: string;
}

export default function ProductWebhookManager({ productId, productName }: ProductWebhookManagerProps) {
    const [webhooks, setWebhooks] = useState<WebhookData[]>([]);
    const [loading, setLoading] = useState(true);
    const [isWebhookFormOpen, setIsWebhookFormOpen] = useState(false);
    const [isClientAdminFormOpen, setIsClientAdminFormOpen] = useState(false);
    const [editingWebhook, setEditingWebhook] = useState<WebhookData | null>(null);
    
    const [webhookFormData, setWebhookFormData] = useState({
        url: '',
        events: [] as string[],
        isActive: true,
    });

    const [clientAdminFormData, setClientAdminFormData] = useState({
        email: '',
        firstName: '',
        lastName: '',
        company: '',
        subdomain: '',
    });

    const { toast } = useToast();

    const availableEvents = [
        'payment.completed',
        'payment.failed', 
        'subscription.created',
        'subscription.updated',
        'subscription.cancelled',
        'invoice.created',
        'invoice.paid',
        'customer.created',
        'customer.updated',
    ];

    const loadWebhooks = useCallback(async () => {
        try {
            const response = await fetch(`/api/products/${productId}/webhooks`);
            if (!response.ok) {
                throw new Error('Failed to fetch webhooks');
            }
            const data = await response.json();
            setWebhooks(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to load webhooks:', error);
            toast({
                title: "Error",
                description: "Failed to load webhooks",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    }, [productId, toast]);

    useEffect(() => {
        loadWebhooks();
    }, [loadWebhooks]);

    const openWebhookForm = (webhook?: WebhookData) => {
        if (webhook) {
            setEditingWebhook(webhook);
            setWebhookFormData({
                url: webhook.url,
                events: webhook.events,
                isActive: webhook.isActive,
            });
        } else {
            setEditingWebhook(null);
            setWebhookFormData({
                url: '',
                events: [],
                isActive: true,
            });
        }
        setIsWebhookFormOpen(true);
    };

    const handleWebhookSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const url = editingWebhook 
                ? `/api/products/${productId}/webhooks/${editingWebhook.id}`
                : `/api/products/${productId}/webhooks`;
            const method = editingWebhook ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(webhookFormData),
            });

            if (response.ok) {
                toast({
                    title: "Success",
                    description: editingWebhook ? "Webhook updated successfully" : "Webhook created successfully",
                });
                loadWebhooks();
                setIsWebhookFormOpen(false);
            } else {
                const errorData = await response.json();
                toast({
                    title: "Error",
                    description: errorData.message || "Failed to save webhook",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error('Error saving webhook:', error);
            toast({
                title: "Error",
                description: "Failed to save webhook",
                variant: "destructive",
            });
        }
    };

    const handleClientAdminSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await fetch(`/api/products/${productId}/create-client-admin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(clientAdminFormData),
            });

            if (response.ok) {
                const result = await response.json();
                toast({
                    title: "Success",
                    description: `Client admin account created successfully. Webhook sent to ${result.webhookUrl || 'configured endpoints'}.`,
                });
                setIsClientAdminFormOpen(false);
                setClientAdminFormData({
                    email: '',
                    firstName: '',
                    lastName: '',
                    company: '',
                    subdomain: '',
                });
            } else {
                const errorData = await response.json();
                toast({
                    title: "Error",
                    description: errorData.message || "Failed to create client admin",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error('Error creating client admin:', error);
            toast({
                title: "Error",
                description: "Failed to create client admin",
                variant: "destructive",
            });
        }
    };

    const deleteWebhook = async (webhookId: string) => {
        if (!confirm('Are you sure you want to delete this webhook?')) return;

        try {
            const response = await fetch(`/api/products/${productId}/webhooks/${webhookId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                toast({
                    title: "Success",
                    description: "Webhook deleted successfully",
                });
                loadWebhooks();
            } else {
                toast({
                    title: "Error",
                    description: "Failed to delete webhook",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error('Error deleting webhook:', error);
            toast({
                title: "Error",
                description: "Failed to delete webhook",
                variant: "destructive",
            });
        }
    };

    const testWebhook = async (webhookId: string) => {
        try {
            const response = await fetch(`/api/products/${productId}/webhooks/${webhookId}/test`, {
                method: 'POST',
            });

            if (response.ok) {
                toast({
                    title: "Success",
                    description: "Test webhook sent successfully",
                });
            } else {
                toast({
                    title: "Error",
                    description: "Failed to send test webhook",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error('Error testing webhook:', error);
            toast({
                title: "Error",
                description: "Failed to send test webhook",
                variant: "destructive",
            });
        }
    };

    const toggleEventSelection = (event: string) => {
        setWebhookFormData(prev => ({
            ...prev,
            events: prev.events.includes(event)
                ? prev.events.filter(e => e !== event)
                : [...prev.events, event]
        }));
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-center h-32">
                    <div className="text-center">
                        <div className="animate-spin h-6 w-6 border-2 border-blue-500 rounded-full border-t-transparent mx-auto mb-2"></div>
                        <p className="text-sm">Loading webhooks...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold">Webhooks & Client Management</h3>
                    <p className="text-sm text-gray-600">Manage webhooks and create client admin accounts for {productName}</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => setIsClientAdminFormOpen(true)} size="sm" variant="outline">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Create Client Admin
                    </Button>
                    <Button onClick={() => openWebhookForm()} size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Webhook
                    </Button>
                </div>
            </div>

            {/* Webhooks List */}
            <div className="space-y-4">
                {webhooks.length === 0 ? (
                    <Card>
                        <CardContent className="p-6 text-center">
                            <Webhook className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500 mb-4">No webhooks configured yet</p>
                            <Button onClick={() => openWebhookForm()}>
                                Create First Webhook
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    webhooks.map((webhook) => (
                        <Card key={webhook.id}>
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Webhook className="h-4 w-4" />
                                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                                            {webhook.url}
                                        </code>
                                        <Badge variant={webhook.isActive ? 'default' : 'secondary'}>
                                            {webhook.isActive ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => testWebhook(webhook.id)}
                                            title="Test webhook"
                                        >
                                            Test
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => openWebhookForm(webhook)}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => deleteWebhook(webhook.id)}
                                            className="text-red-600"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="flex flex-wrap gap-1">
                                    {webhook.events.map((event) => (
                                        <Badge key={event} variant="secondary" className="text-xs">
                                            {event}
                                        </Badge>
                                    ))}
                                </div>
                                {webhook.lastTriggered && (
                                    <p className="text-xs text-gray-500 mt-2">
                                        Last triggered: {new Date(webhook.lastTriggered).toLocaleString()}
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Webhook Form */}
            {isWebhookFormOpen && (
                <Card>
                    <CardHeader>
                        <CardTitle>
                            {editingWebhook ? 'Edit Webhook' : 'Create New Webhook'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleWebhookSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="webhookUrl">Webhook URL *</Label>
                                <Input
                                    id="webhookUrl"
                                    value={webhookFormData.url}
                                    onChange={(e) => setWebhookFormData({ ...webhookFormData, url: e.target.value })}
                                    placeholder="https://your-app.com/webhooks/tachles"
                                    required
                                />
                            </div>

                            <div>
                                <Label>Events to Listen For *</Label>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    {availableEvents.map((event) => (
                                        <div key={event} className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                id={`event-${event}`}
                                                checked={webhookFormData.events.includes(event)}
                                                onChange={() => toggleEventSelection(event)}
                                            />
                                            <Label htmlFor={`event-${event}`} className="text-sm">
                                                {event}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="webhookActive"
                                    checked={webhookFormData.isActive}
                                    onCheckedChange={(checked) => setWebhookFormData({ ...webhookFormData, isActive: checked })}
                                />
                                <Label htmlFor="webhookActive">Active</Label>
                            </div>

                            <div className="flex justify-end space-x-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsWebhookFormOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit">
                                    {editingWebhook ? 'Update' : 'Create'} Webhook
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Client Admin Form */}
            {isClientAdminFormOpen && (
                <Card>
                    <CardHeader>
                        <CardTitle>Create Client Admin Account</CardTitle>
                        <p className="text-sm text-gray-600">
                            This will create an admin account for a client and notify your app via webhook
                        </p>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleClientAdminSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="firstName">First Name *</Label>
                                    <Input
                                        id="firstName"
                                        value={clientAdminFormData.firstName}
                                        onChange={(e) => setClientAdminFormData({ ...clientAdminFormData, firstName: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="lastName">Last Name *</Label>
                                    <Input
                                        id="lastName"
                                        value={clientAdminFormData.lastName}
                                        onChange={(e) => setClientAdminFormData({ ...clientAdminFormData, lastName: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="email">Email *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={clientAdminFormData.email}
                                    onChange={(e) => setClientAdminFormData({ ...clientAdminFormData, email: e.target.value })}
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="company">Company</Label>
                                <Input
                                    id="company"
                                    value={clientAdminFormData.company}
                                    onChange={(e) => setClientAdminFormData({ ...clientAdminFormData, company: e.target.value })}
                                />
                            </div>

                            <div>
                                <Label htmlFor="subdomain">Subdomain</Label>
                                <Input
                                    id="subdomain"
                                    value={clientAdminFormData.subdomain}
                                    onChange={(e) => setClientAdminFormData({ ...clientAdminFormData, subdomain: e.target.value })}
                                    placeholder="client-company"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Optional: If your app supports subdomains for clients
                                </p>
                            </div>

                            <hr className="my-4" />

                            <div className="bg-blue-50 p-4 rounded-lg">
                                <h4 className="font-medium text-blue-900 mb-2">What happens next:</h4>
                                <ul className="text-sm text-blue-800 space-y-1">
                                    <li>• A webhook will be sent to your configured endpoints</li>
                                    <li>• Your app should create the admin account</li>
                                    <li>• The client will receive login credentials</li>
                                    <li>• The admin account will be linked to this product</li>
                                </ul>
                            </div>

                            <div className="flex justify-end space-x-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsClientAdminFormOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit">
                                    Create Client Admin
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
