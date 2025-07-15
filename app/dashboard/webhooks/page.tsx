"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Webhook,
  Plus,
  Search,
  Globe,
  Check,
  X,
  AlertCircle,
  Edit,
  Trash2,
  MoreHorizontal,
  Eye
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
import { toast } from "sonner";

interface WebhookEndpoint {
  id: string;
  url: string;
  events: string[];
  isActive: boolean;
  secret?: string;
  description?: string;
  lastTriggered?: string;
  successCount: number;
  failureCount: number;
  createdAt: string;
  updatedAt: string;
}

interface WebhookFormData {
  url: string;
  events: string[];
  description: string;
}

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<WebhookEndpoint | null>(null);
  const [formData, setFormData] = useState<WebhookFormData>({
    url: "",
    events: [],
    description: "",
  });

  const availableEvents = [
    'product.created',
    'product.updated',
    'product.deleted',
    'product.status_changed',
    'subscription.created',
    'subscription.cancelled',
    'invoice.created',
    'invoice.sent',
    'invoice.paid',
    'payment.received',
    'payment.failed',
    'client.created',
    'client.updated',
  ];

  const loadWebhooks = async () => {
    try {
      // Load webhooks from the database
      const response = await fetch('/api/webhooks');
      if (response.ok) {
        const data = await response.json();
        setWebhooks(data);
      } else {
        console.error('Failed to load webhooks:', response.statusText);
        setWebhooks([]);
      }
    } catch (error) {
      console.error('Failed to load webhooks:', error);
      setWebhooks([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWebhooks();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create or update webhook via API
      const method = editingWebhook ? 'PUT' : 'POST';
      const url = editingWebhook ? `/api/webhooks/${editingWebhook.id}` : '/api/webhooks';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: formData.url,
          events: formData.events,
          description: formData.description,
          isActive: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save webhook');
      }

      const savedWebhook = await response.json();

      if (editingWebhook) {
        setWebhooks(prev => prev.map(wh =>
          wh.id === editingWebhook.id ? savedWebhook : wh
        ));
      } else {
        setWebhooks(prev => [savedWebhook, ...prev]);
      }

      setIsFormOpen(false);
      setEditingWebhook(null);
      setFormData({ url: "", events: [], description: "" });
    } catch (error) {
      console.error('Error saving webhook:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (webhook: WebhookEndpoint) => {
    setEditingWebhook(webhook);
    setFormData({
      url: webhook.url,
      events: webhook.events,
      description: webhook.description || "",
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (webhookId: string) => {
    if (!confirm('Are you sure you want to delete this webhook?')) return;

    try {
      setWebhooks(prev => prev.filter(wh => wh.id !== webhookId));
    } catch (error) {
      console.error('Error deleting webhook:', error);
    }
  };

  const handleToggle = async (webhookId: string) => {
    try {
      setWebhooks(prev => prev.map(wh =>
        wh.id === webhookId
          ? { ...wh, isActive: !wh.isActive }
          : wh
      ));
    } catch (error) {
      console.error('Error updating webhook status:', error);
    }
  };

  const testWebhook = async (webhookId: string) => {
    try {
      const response = await fetch(`/api/webhooks/${webhookId}/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to test webhook');
      }

      const result = await response.json();
      toast.success(`Webhook test successful: ${result.message}`)
    } catch (error) {
      console.error('Error testing webhook:', error);
    }
  };

  const filteredWebhooks = webhooks.filter(webhook =>
    webhook.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
    webhook.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    webhook.events.some(event => event.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const stats = {
    total: webhooks.length,
    active: webhooks.filter(wh => wh.isActive).length,
    totalDeliveries: webhooks.reduce((sum, wh) => sum + wh.successCount + wh.failureCount, 0),
    successRate: webhooks.length > 0
      ? (webhooks.reduce((sum, wh) => sum + wh.successCount, 0) /
        webhooks.reduce((sum, wh) => sum + wh.successCount + wh.failureCount, 1)) * 100
      : 0,
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Webhooks
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Manage webhook endpoints for real-time event notifications.
          </p>
        </div>
        <div className="flex space-x-3">
          <Button asChild variant="outline">
            <a href="/dashboard/webhooks/setup">
              <Plus className="h-4 w-4 mr-2" />
              Setup Integration
            </a>
          </Button>
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingWebhook(null);
                setFormData({ url: "", events: [], description: "" });
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Webhook
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>
                  {editingWebhook ? 'Edit Webhook' : 'Add New Webhook'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="url">Endpoint URL *</Label>
                  <Input
                    id="url"
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="https://your-app.com/webhooks"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="events">Events</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {availableEvents.map(event => (
                      <label key={event} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.events.includes(event)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                events: [...formData.events, event]
                              });
                            } else {
                              setFormData({
                                ...formData,
                                events: formData.events.filter(e => e !== event)
                              });
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-sm">{event}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Optional description..."
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
                    {loading ? 'Saving...' : (editingWebhook ? 'Update' : 'Create')}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
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
                    Total Webhooks
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {stats.total}
                  </p>
                </div>
                <Webhook className="h-8 w-8 text-blue-600" />
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
                    Active
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {stats.active}
                  </p>
                </div>
                <Check className="h-8 w-8 text-green-600" />
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
                    Total Deliveries
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {stats.totalDeliveries}
                  </p>
                </div>
                <Globe className="h-8 w-8 text-purple-600" />
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
                    Success Rate
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {stats.successRate.toFixed(1)}%
                  </p>
                </div>
                <AlertCircle className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Webhooks Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Webhook Endpoints</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search webhooks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Endpoint</TableHead>
                  <TableHead>Events</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Deliveries</TableHead>
                  <TableHead>Success Rate</TableHead>
                  <TableHead>Last Triggered</TableHead>
                  <TableHead className="w-[70px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Loading webhooks...
                    </TableCell>
                  </TableRow>
                ) : filteredWebhooks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No webhooks found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredWebhooks.map((webhook) => {
                    const totalDeliveries = webhook.successCount + webhook.failureCount;
                    const successRate = totalDeliveries > 0
                      ? (webhook.successCount / totalDeliveries) * 100
                      : 0;

                    return (
                      <TableRow key={webhook.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-slate-900 dark:text-white">
                              {webhook.url}
                            </p>
                            {webhook.description && (
                              <p className="text-sm text-slate-500">
                                {webhook.description}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {webhook.events.slice(0, 2).map((event) => (
                              <Badge key={event} variant="outline" className="text-xs">
                                {event}
                              </Badge>
                            ))}
                            {webhook.events.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{webhook.events.length - 2} more
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={webhook.isActive ? "default" : "secondary"}
                            className={webhook.isActive ? "bg-green-100 text-green-700" : ""}
                          >
                            {webhook.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="text-green-600">{webhook.successCount} success</div>
                            <div className="text-red-600">{webhook.failureCount} failed</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`font-medium ${successRate >= 95 ? 'text-green-600' :
                            successRate >= 80 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                            {successRate.toFixed(1)}%
                          </span>
                        </TableCell>
                        <TableCell>
                          {webhook.lastTriggered ? (
                            <span className="text-sm text-slate-600 dark:text-slate-400">
                              {new Date(webhook.lastTriggered).toLocaleDateString()}
                            </span>
                          ) : (
                            <span className="text-sm text-slate-400">Never</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => testWebhook(webhook.id)}>
                                <Eye className="h-4 w-4 mr-2" />
                                Test Webhook
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggle(webhook.id)}>
                                {webhook.isActive ? (
                                  <>
                                    <X className="h-4 w-4 mr-2" />
                                    Disable
                                  </>
                                ) : (
                                  <>
                                    <Check className="h-4 w-4 mr-2" />
                                    Enable
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEdit(webhook)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(webhook.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
