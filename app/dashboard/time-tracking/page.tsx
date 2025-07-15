"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Clock, 
  Plus, 
  Search, 
  Calendar,
  TrendingUp,
  Edit,
  Trash2,
  MoreHorizontal,
  FolderOpen
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface TimeEntry {
  id: string;
  description: string;
  hours: number;
  rate?: number;
  date: string;
  billable: boolean;
  productId: string;
  productName: string;
  userId: string;
  userName: string;
  createdAt: string;
  updatedAt: string;
}

interface Product {
  id: string;
  name: string;
}

interface TimeEntryFormData {
  description: string;
  hours: string;
  rate: string;
  date: string;
  billable: boolean;
  productId: string;
}

export default function TimeTrackingPage() {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [productFilter, setProductFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);
  const [formData, setFormData] = useState<TimeEntryFormData>({
    description: "",
    hours: "",
    rate: "",
    date: new Date().toISOString().split('T')[0],
    billable: true,
    productId: "",
  });

  const loadTimeEntries = async () => {
    try {
      const response = await fetch('/api/time-entries');
      if (response.ok) {
        const data = await response.json();
        setTimeEntries(data);
      }
    } catch (error) {
      console.error('Failed to load time entries:', error);
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

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([loadTimeEntries(), loadProducts()]);
      setLoading(false);
    };
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingEntry ? `/api/time-entries/${editingEntry.id}` : '/api/time-entries';
      const method = editingEntry ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          hours: parseFloat(formData.hours),
          rate: formData.rate ? parseFloat(formData.rate) : undefined,
          date: new Date(formData.date),
        }),
      });

      if (response.ok) {
        await loadTimeEntries();
        setIsDialogOpen(false);
        setEditingEntry(null);
        setFormData({
          description: "",
          hours: "",
          rate: "",
          date: new Date().toISOString().split('T')[0],
          billable: true,
          productId: "",
        });
      }
    } catch (error) {
      console.error('Failed to save time entry:', error);
    }
  };

  const handleEdit = (entry: TimeEntry) => {
    setEditingEntry(entry);
    setFormData({
      description: entry.description,
      hours: entry.hours.toString(),
      rate: entry.rate?.toString() || "",
      date: entry.date.split('T')[0],
      billable: entry.billable,
      productId: entry.productId,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (entryId: string) => {
    if (!confirm('Are you sure you want to delete this time entry?')) return;

    try {
      const response = await fetch(`/api/time-entries/${entryId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadTimeEntries();
      }
    } catch (error) {
      console.error('Failed to delete time entry:', error);
    }
  };

  const filteredEntries = timeEntries.filter(entry => {
    const matchesSearch =
      entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.userName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesProduct = productFilter === "all" || entry.productId === productFilter;

    return matchesSearch && matchesProduct;
  });

  const stats = {
    totalHours: timeEntries.reduce((sum, entry) => sum + entry.hours, 0),
    billableHours: timeEntries.filter(entry => entry.billable).reduce((sum, entry) => sum + entry.hours, 0),
    totalValue: timeEntries.reduce((sum, entry) => sum + (entry.hours * (entry.rate || 0)), 0),
    entriesCount: timeEntries.length,
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Time Tracking
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Track time spent on products and tasks.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingEntry(null);
              setFormData({
                description: "",
                hours: "",
                rate: "",
                date: new Date().toISOString().split('T')[0],
                billable: true,
                productId: "",
              });
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Time Entry
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingEntry ? 'Edit Time Entry' : 'Add New Time Entry'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="productId">Product *</Label>
                <Select
                  value={formData.productId}
                  onValueChange={(value) => setFormData({ ...formData, productId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map(product => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="hours">Hours *</Label>
                <Input
                  id="hours"
                  type="number"
                  step="0.25"
                  value={formData.hours}
                  onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="rate">Hourly Rate</Label>
                <Input
                  id="rate"
                  type="number"
                  step="0.01"
                  value={formData.rate}
                  onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="billable"
                  checked={formData.billable}
                  onChange={(e) => setFormData({ ...formData, billable: e.target.checked })}
                />
                <Label htmlFor="billable">Billable</Label>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingEntry ? 'Update' : 'Add'} Time Entry
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
                    Total Hours
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {stats.totalHours.toFixed(1)}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-blue-600" />
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
                    Billable Hours
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {stats.billableHours.toFixed(1)}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
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
                    Total Value
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    ${stats.totalValue.toLocaleString()}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-purple-600" />
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
                    Entries
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {stats.entriesCount}
                  </p>
                </div>
                <FolderOpen className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Time Entries</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search entries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={productFilter} onValueChange={setProductFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Products</SelectItem>
                  {products.map(product => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[70px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      Loading time entries...
                    </TableCell>
                  </TableRow>
                ) : filteredEntries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      No time entries found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3 text-slate-400" />
                          <span className="text-sm">
                            {new Date(entry.date).toLocaleDateString()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {entry.productName}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          {entry.description}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {entry.hours}h
                        </span>
                      </TableCell>
                      <TableCell>
                        {entry.rate ? (
                          <span className="text-sm">
                            ${entry.rate}/hr
                          </span>
                        ) : (
                          <span className="text-sm text-slate-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          ${(entry.hours * (entry.rate || 0)).toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={entry.billable ? "default" : "secondary"}
                        >
                          {entry.billable ? "Billable" : "Non-billable"}
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
                            <DropdownMenuItem onClick={() => handleEdit(entry)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(entry.id)}
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
