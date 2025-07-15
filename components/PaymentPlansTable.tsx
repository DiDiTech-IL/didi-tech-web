"use client";

import { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import type { PaymentPlan } from '@/types/payment-plan';
import {
  Calendar,
  Crown,
  DollarSign,
  Edit,
  ExternalLink,
  Plus,
  Trash2
} from "lucide-react";
import PaymentPlanDialog from './PaymentPlanDialog';

interface PaymentPlansTableProps {
  productId: string;
  initialPlans: PaymentPlan[];
}

export default function PaymentPlansTable({ productId, initialPlans }: PaymentPlansTableProps) {
  const [plans, setPlans] = useState<PaymentPlan[]>(initialPlans);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PaymentPlan | null>(null);
  const { toast } = useToast();

  const refreshPlans = async () => {
    try {
      const response = await fetch(`/api/products/${productId}/payment-plans`);
      if (response.ok) {
        const data = await response.json();
        setPlans(data.plans || []);
      }
    } catch (error) {
      console.error('Failed to refresh plans:', error);
    }
  };

  const handleCreatePlan = () => {
    setEditingPlan(null);
    setIsDialogOpen(true);
  };

  const handleEditPlan = (plan: PaymentPlan) => {
    setEditingPlan(plan);
    setIsDialogOpen(true);
  };

  const handleDeletePlan = async (planId: string) => {
    if (!confirm('Are you sure you want to delete this payment plan?')) {
      return;
    }

    try {
      const response = await fetch(`/api/products/${productId}/payment-plans/${planId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Payment plan deleted successfully",
        });
        await refreshPlans();
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Failed to delete payment plan",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error deleting payment plan:', error);
      toast({
        title: "Error",
        description: "Failed to delete payment plan",
        variant: "destructive",
      });
    }
  };

  const handlePlanSaved = () => {
    setIsDialogOpen(false);
    setEditingPlan(null);
    refreshPlans();
  };

  const openPaymentPage = () => {
    window.open(`https://pay.tachles.dev/${productId}`, '_blank');
  };

  if (plans.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Payment Plans</h3>
          <div className="flex gap-2">
            <Button onClick={handleCreatePlan} className="bg-gradient-to-r from-blue-600 to-purple-600">
              <Plus className="h-4 w-4 mr-2" />
              Add Plan
            </Button>
            <Button variant="outline" onClick={openPaymentPage}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Preview Payment Page
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="text-center py-12">
            <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No payment plans configured</h3>
            <p className="text-muted-foreground mb-4">Create your first payment plan to start accepting payments</p>
            <Button onClick={handleCreatePlan}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Plan
            </Button>
          </CardContent>
        </Card>

        <PaymentPlanDialog
          productId={productId}
          plan={editingPlan}
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onSaved={handlePlanSaved}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Payment Plans</h3>
        <div className="flex gap-2">
          <Button onClick={handleCreatePlan} className="bg-gradient-to-r from-blue-600 to-purple-600">
            <Plus className="h-4 w-4 mr-2" />
            Add Plan
          </Button>
          <Button variant="outline" onClick={openPaymentPage}>
            <ExternalLink className="h-4 w-4 mr-2" />
            Preview Payment Page
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plan</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Billing</TableHead>
                <TableHead>Features</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div>
                        <p className="font-medium">{plan.name}</p>
                        {plan.description && (
                          <p className="text-sm text-muted-foreground">{plan.description}</p>
                        )}
                      </div>
                      {plan.isPopular && (
                        <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                          <Crown className="h-3 w-3 mr-1" />
                          Popular
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{plan.planType}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      <span>{plan.price} {plan.currency}</span>
                      {plan.discountPercentage && (
                        <Badge variant="secondary" className="text-xs ml-1">
                          -{plan.discountPercentage}%
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span className="capitalize">{plan.billingInterval.toLowerCase()}</span>
                      {plan.trialDays && (
                        <Badge variant="outline" className="text-xs ml-1">
                          {plan.trialDays}d trial
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {plan.features.slice(0, 2).map((feature, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                      {plan.features.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{plan.features.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={plan.isActive ? 'default' : 'secondary'}>
                      {plan.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditPlan(plan)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeletePlan(plan.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <PaymentPlanDialog
        productId={productId}
        plan={editingPlan}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSaved={handlePlanSaved}
      />
    </div>
  );
}
