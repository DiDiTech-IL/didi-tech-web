"use client";

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
import { createPaymentPlan, updatePaymentPlan } from '@/app/dashboard/products/actions';
import { useRef, useEffect, useState } from 'react';

interface PaymentPlanDialogProps {
  productId: string;
  plan: PaymentPlan | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export default function PaymentPlanDialog({ 
  productId, 
  plan, 
  isOpen, 
  onClose, 
  onSaved 
}: PaymentPlanDialogProps) {
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [features, setFeatures] = useState<string[]>(['']);
  const [isPending, setIsPending] = useState(false);

  // Handle form submission with server actions
  const handleSubmit = async (formData: FormData) => {
    setIsPending(true);
    
    try {
      const featuresArray = features.filter(f => f.trim() !== '');
      
      const data = {
        name: formData.get('name') as string,
        description: formData.get('description') as string || undefined,
        planType: formData.get('planType') as PaymentPlan['planType'],
        price: parseFloat(formData.get('price') as string),
        currency: formData.get('currency') as PaymentPlan['currency'],
        billingInterval: formData.get('billingInterval') as PaymentPlan['billingInterval'],
        trialDays: formData.get('trialDays') ? parseInt(formData.get('trialDays') as string) : undefined,
        features: featuresArray,
        userLimit: formData.get('userLimit') ? parseInt(formData.get('userLimit') as string) : undefined,
        storageLimit: formData.get('storageLimit') ? parseInt(formData.get('storageLimit') as string) : undefined,
        apiCallsLimit: formData.get('apiCallsLimit') ? parseInt(formData.get('apiCallsLimit') as string) : undefined,
        discountPercentage: formData.get('discountPercentage') ? parseFloat(formData.get('discountPercentage') as string) : undefined,
        discountValidUntil: formData.get('discountValidUntil') as string || undefined,
        isPopular: formData.get('isPopular') === 'on',
        isActive: formData.get('isActive') === 'on',
        displayOrder: parseInt(formData.get('displayOrder') as string) || (plan?.displayOrder || 1),
      };

      const result = plan 
        ? await updatePaymentPlan(productId, plan.id, data)
        : await createPaymentPlan(productId, data);

      if (result.success) {
        toast({
          title: "Success",
          description: plan ? "Payment plan updated successfully" : "Payment plan created successfully",
        });
        onSaved();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to save payment plan",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error saving plan:', error);
      toast({
        title: "Error",
        description: "Failed to save payment plan",
        variant: "destructive",
      });
    } finally {
      setIsPending(false);
    }
  };

  // Initialize features when dialog opens
  useEffect(() => {
    if (isOpen) {
      if (plan) {
        setFeatures(plan.features.length > 0 ? plan.features : ['']);
      } else {
        setFeatures(['']);
      }
    }
  }, [plan, isOpen]);

  const addFeature = () => {
    setFeatures(prev => [...prev, '']);
  };

  const updateFeature = (index: number, value: string) => {
    setFeatures(prev => prev.map((feature, i) => i === index ? value : feature));
  };

  const removeFeature = (index: number) => {
    setFeatures(prev => prev.filter((_, i) => i !== index));
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {plan ? 'Edit Payment Plan' : 'Create Payment Plan'}
          </DialogTitle>
        </DialogHeader>
        
        <form ref={formRef} action={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Plan Name *</Label>
              <Input
                id="name"
                name="name"
                defaultValue={plan?.name || ''}
                placeholder="e.g., Pro Plan"
                required
              />
            </div>
            <div>
              <Label htmlFor="planType">Plan Type</Label>
              <Select name="planType" defaultValue={plan?.planType || 'RECURRING'}>
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
              name="description"
              defaultValue={plan?.description || ''}
              placeholder="Plan description..."
            />
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="price">Price *</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                defaultValue={plan?.price || 0}
                required
              />
            </div>
            <div>
              <Label htmlFor="currency">Currency</Label>
              <Select name="currency" defaultValue={plan?.currency || 'ILS'}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ILS">ILS</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="CAD">CAD</SelectItem>
                  <SelectItem value="AUD">AUD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="billingInterval">Billing Interval</Label>
              <Select name="billingInterval" defaultValue={plan?.billingInterval || 'MONTHLY'}>
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
                name="trialDays"
                type="number"
                min="0"
                defaultValue={plan?.trialDays || ''}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="discountPercentage">Discount %</Label>
              <Input
                id="discountPercentage"
                name="discountPercentage"
                type="number"
                min="0"
                max="100"
                step="0.01"
                defaultValue={plan?.discountPercentage || ''}
                placeholder="0"
              />
            </div>
          </div>

          {/* Limits */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="userLimit">User Limit</Label>
              <Input
                id="userLimit"
                name="userLimit"
                type="number"
                min="0"
                defaultValue={plan?.userLimit || ''}
                placeholder="Unlimited"
              />
            </div>
            <div>
              <Label htmlFor="storageLimit">Storage Limit (GB)</Label>
              <Input
                id="storageLimit"
                name="storageLimit"
                type="number"
                min="0"
                defaultValue={plan?.storageLimit || ''}
                placeholder="Unlimited"
              />
            </div>
            <div>
              <Label htmlFor="apiCallsLimit">API Calls Limit</Label>
              <Input
                id="apiCallsLimit"
                name="apiCallsLimit"
                type="number"
                min="0"
                defaultValue={plan?.apiCallsLimit || ''}
                placeholder="Unlimited"
              />
            </div>
          </div>

          {/* Features */}
          <div>
            <Label>Features</Label>
            <div className="space-y-2 mt-2">
              {features.map((feature, index) => (
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
                    disabled={features.length === 1}
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
                name="isActive"
                defaultChecked={plan?.isActive !== false}
              />
              <Label htmlFor="isActive">Active</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isPopular"
                name="isPopular"
                defaultChecked={plan?.isPopular || false}
              />
              <Label htmlFor="isPopular">Mark as Popular</Label>
            </div>
          </div>

          <input 
            type="hidden" 
            name="displayOrder" 
            value={plan?.displayOrder || 1} 
          />

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving...' : (plan ? 'Update' : 'Create')} Plan
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
