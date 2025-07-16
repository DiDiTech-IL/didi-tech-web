"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { PaymentPlan } from '@/types/payment-plan';
import { Plus, Trash2 } from "lucide-react";

interface PaymentPlanDialogProps {
  productId: string;
  plan: PaymentPlan | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

interface PlanFormData {
  name: string;
  description: string;
  planType: PaymentPlan['planType'];
  price: number;
  currency: PaymentPlan['currency'];
  billingInterval: PaymentPlan['billingInterval'];
  trialDays?: number;
  features: string[];
  userLimit?: number;
  storageLimit?: number;
  apiCallsLimit?: number;
  discountPercentage?: number;
  discountValidUntil?: string;
  isPopular: boolean;
  isActive: boolean;
  displayOrder: number;
}

export default function PaymentPlanDialog({ 
  productId, 
  plan, 
  isOpen, 
  onClose, 
  onSaved 
}: PaymentPlanDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<PlanFormData>({
    name: '',
    description: '',
    planType: 'RECURRING',
    price: 0,
    currency: 'ILS',
    billingInterval: 'MONTHLY',
    features: [],
    isPopular: false,
    isActive: true,
    displayOrder: 1,
  });

  useEffect(() => {
    if (plan) {
      setFormData({
        name: plan.name,
        description: plan.description || '',
        planType: plan.planType,
        price: plan.price,
        currency: plan.currency,
        billingInterval: plan.billingInterval,
        trialDays: plan.trialDays,
        features: plan.features,
        userLimit: plan.userLimit,
        storageLimit: plan.storageLimit,
        apiCallsLimit: plan.apiCallsLimit,
        discountPercentage: plan.discountPercentage,
        discountValidUntil: plan.discountValidUntil,
        isPopular: plan.isPopular || false,
        isActive: plan.isActive,
        displayOrder: plan.displayOrder,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        planType: 'RECURRING',
        price: 0,
        currency: 'ILS',
        billingInterval: 'MONTHLY',
        features: [],
        isPopular: false,
        isActive: true,
        displayOrder: 1,
      });
    }
  }, [plan, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const url = plan 
        ? `/api/products/${productId}/payment-plans/${plan.id}`
        : `/api/products/${productId}/payment-plans`;
      
      const method = plan ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: plan ? "Payment plan updated successfully" : "Payment plan created successfully",
        });
        onSaved();
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Failed to save payment plan",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error saving payment plan:', error);
      toast({
        title: "Error",
        description: "Failed to save payment plan",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };

  const updateFeature = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.map((feature, i) => i === index ? value : feature)
    }));
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {plan ? 'Edit Payment Plan' : 'Create Payment Plan'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Plan Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Pro Plan"
                required
              />
            </div>
            <div>
              <Label htmlFor="planType">Plan Type</Label>
              <Select
                value={formData.planType}
                onValueChange={(value) => setFormData(prev => ({ ...prev, planType: value as PaymentPlan['planType'] }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RECURRING">Recurring</SelectItem>
                  <SelectItem value="ONE_TIME">One Time</SelectItem>
                  <SelectItem value="FREEMIUM">Freemium</SelectItem>
                  <SelectItem value="TRIAL">Trial</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Plan description..."
            />
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="price">Price *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value as PaymentPlan['currency'] }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ILS">ILS</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="ILS">ILS</SelectItem>
                  <SelectItem value="CAD">CAD</SelectItem>
                  <SelectItem value="AUD">AUD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="billingInterval">Billing Interval</Label>
              <Select
                value={formData.billingInterval}
                onValueChange={(value) => setFormData(prev => ({ ...prev, billingInterval: value as PaymentPlan['billingInterval'] }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MONTHLY">Monthly</SelectItem>
                  <SelectItem value="YEARLY">Yearly</SelectItem>
                  <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                  <SelectItem value="WEEKLY">Weekly</SelectItem>
                  <SelectItem value="ONE_TIME">One Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Additional Options */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="trialDays">Trial Days</Label>
              <Input
                id="trialDays"
                type="number"
                min="0"
                value={formData.trialDays || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, trialDays: parseInt(e.target.value) || undefined }))}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="discountPercentage">Discount %</Label>
              <Input
                id="discountPercentage"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={formData.discountPercentage || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, discountPercentage: parseFloat(e.target.value) || undefined }))}
                placeholder="0"
              />
            </div>
          </div>

          {/* Features */}
          <div>
            <Label>Features</Label>
            <div className="space-y-2 mt-2">
              {formData.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={feature}
                    onChange={(e) => updateFeature(index, e.target.value)}
                    placeholder="Feature description"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeFeature(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addFeature}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Feature
              </Button>
            </div>
          </div>

          {/* Status Options */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked as boolean }))}
              />
              <Label htmlFor="isActive">Active</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isPopular"
                checked={formData.isPopular}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPopular: checked as boolean }))}
              />
              <Label htmlFor="isPopular">Mark as Popular</Label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : (plan ? 'Update' : 'Create')} Plan
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
