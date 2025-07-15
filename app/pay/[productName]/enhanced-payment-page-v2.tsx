"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useSubdomainCheck } from "@/hooks/use-subdomain-check";
import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle,
  Clock,
  CreditCard,
  Crown,
  Database,
  DollarSign,
  Gift,
  Loader2,
  Star,
  Users,
  X,
  Zap
} from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { generatePaymentLinkForProduct } from "./actions";

interface PaymentPlan {
  id: string;
  name: string;
  description?: string;
  planType: 'ONE_TIME' | 'RECURRING' | 'FREEMIUM' | 'TRIAL';
  price: number;
  currency: 'ILS';
  billingInterval: 'MONTHLY';
  trialDays?: number;
  features: string[];
  userLimit?: number;
  storageLimit?: number;
  apiCallsLimit?: number;
  discountPercentage?: number;
  discountValidUntil?: string;
  isPopular?: boolean;
  isActive: boolean;
  displayOrder: number;
}

interface Product {
  id: string;
  name: string;
  description: string;
  category?: string;
  features: string[];
  domain?: string;
  paymentPlans: PaymentPlan[];
}

interface CustomerInfo {
  email: string;
  companyName: string;
  fullName: string;
  phone: string;
  subdomain: string;
}

interface CouponValidation {
  isValid: boolean;
  coupon?: {
    id: string;
    code: string;
    name: string;
    discountType: string;
    discountValue: number;
    maxDiscountAmount?: number;
    minimumAmount?: number;
  };
  error?: string;
  discountAmount?: number;
  finalAmount?: number;
}

export default function EnhancedPaymentPage() {
  const params = useParams();
  const productName = params.productName as string;
  const { toast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<PaymentPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<'plans' | 'details' | 'payment' | 'processing'>('plans');
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    email: '',
    companyName: '',
    fullName: '',
    phone: '',
    subdomain: ''
  });

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [, setCouponValidation] = useState<CouponValidation | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidation | null>(null);

  // Payment processing state
  const [isProcessingPayment, startPaymentTransition] = useTransition();

  // Subdomain availability checker
  const subdomainCheck = useSubdomainCheck({
    productId: product?.id,
    productName: productName,
    debounceMs: 800,
    minLength: 3
  });

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/pay/${encodeURIComponent(productName)}`);
        if (response.ok) {
          const productData = await response.json();
          setProduct(productData);

          // Auto-select first plan if only one exists
          if (productData.paymentPlans.length === 1) {
            setSelectedPlan(productData.paymentPlans[0]);
          }
        } else {
          toast({
            title: "Error",
            description: "Product not found or not available",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        toast({
          title: "Error",
          description: "Failed to load product details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (productName) {
      fetchProductDetails();
    }
  }, [productName, toast]);

  const validateCoupon = async () => {
    if (!couponCode.trim() || !selectedPlan) return;

    setValidatingCoupon(true);
    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          couponCode: couponCode.trim(),
          productId: product?.id,
          planId: selectedPlan.id,
          userEmail: customerInfo.email,
          originalAmount: selectedPlan.price
        })
      });

      const validation: CouponValidation = await response.json();
      setCouponValidation(validation);

      if (validation.isValid) {
        setAppliedCoupon(validation);
        toast({
          title: "Coupon Applied!",
          description: `${validation.coupon?.name} - Save $${validation.discountAmount?.toFixed(2)}`,
        });
      } else {
        setAppliedCoupon(null);
        toast({
          title: "Invalid Coupon",
          description: validation.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error validating coupon:', error);
      toast({
        title: "Error",
        description: "Failed to validate coupon",
        variant: "destructive",
      });
    } finally {
      setValidatingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setCouponCode('');
    setCouponValidation(null);
    setAppliedCoupon(null);
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  const getBillingText = (interval: string) => {
    switch (interval) {
      case 'MONTHLY': return '/month';
      case 'YEARLY': return '/year';
      case 'QUARTERLY': return '/quarter';
      case 'WEEKLY': return '/week';
      case 'ONE_TIME': return '';
      default: return '';
    }
  };

  const getPlanIcon = (planType: string) => {
    switch (planType) {
      case 'FREEMIUM': return <Gift className="h-5 w-5" />;
      case 'TRIAL': return <Clock className="h-5 w-5" />;
      case 'RECURRING': return <Zap className="h-5 w-5" />;
      case 'ONE_TIME': return <DollarSign className="h-5 w-5" />;
      default: return <Star className="h-5 w-5" />;
    }
  };

  const getFeatureIcon = (feature: string) => {
    if (feature.toLowerCase().includes('user')) return <Users className="h-4 w-4" />;
    if (feature.toLowerCase().includes('storage') || feature.toLowerCase().includes('gb')) return <Database className="h-4 w-4" />;
    if (feature.toLowerCase().includes('api')) return <Zap className="h-4 w-4" />;
    return <Check className="h-4 w-4" />;
  };

  const calculateFinalPrice = () => {
    if (!selectedPlan) return 0;
    if (appliedCoupon?.finalAmount !== undefined) {
      return appliedCoupon.finalAmount;
    }
    return selectedPlan.price;
  };

  const calculateSavings = () => {
    if (!selectedPlan || !appliedCoupon?.discountAmount) return 0;
    return appliedCoupon.discountAmount;
  };

  const handlePayment = () => {
    if (!selectedPlan || !product) return;

    startPaymentTransition(async () => {
      try {
        const result = await generatePaymentLinkForProduct({
          productName: productName,
          planId: selectedPlan.id,
          customerInfo: {
            ...customerInfo,
            subdomain: subdomainCheck.subdomain // Use the validated subdomain
          },
          couponCode: appliedCoupon?.coupon?.code,
        });

        // Redirect to PayPlus payment page
        window.location.href = result.data.payment_page_link;
      } catch (error) {
        console.error("שגיאת תשלום:", error);
        toast({
          title: "שגיאה ביצירת תהליך התשלום",
          description: error instanceof Error ? error.message : "תקלה ביצירת תהליך חיוב אשראי",
          variant: "destructive",
        });
      }
    });
  };

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 p-4 font-heebo text-xl">טוען פרטי מוצר...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-6 w-6 text-red-500" />
              <CardTitle>המוצר לא נמצא</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600">
              המוצר שביקשת אינו זמין או שהקישור שגוי.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <CardHeader>
            <CardTitle className="text-4xl font-bold text-slate-900 mb-4">{product.name}</CardTitle>
            <CardDescription>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">{product.description}</p>
              {product.category && (
                <Badge variant="outline" className="mt-4">
                  {product.category}
                </Badge>
              )}
            </CardDescription>
          </CardHeader>
        </motion.div>

        {step === 'plans' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-6xl mx-auto"
          >
            {/* Product Features */}
            {product.features.length > 0 && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Star className="h-5 w-5 mr-2 text-yellow-500" />
                    מה תקבלו במסלול זה
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {product.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        {getFeatureIcon(feature)}
                        <span className="text-slate-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Payment Plans */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-center mb-6">בחר את התוכנית שלך</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {product.paymentPlans.map((plan, index) => (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card
                      className={`relative cursor-pointer transition-all duration-200 hover:shadow-lg ${selectedPlan?.id === plan.id
                        ? 'ring-2 ring-blue-500 shadow-lg'
                        : 'hover:ring-1 hover:ring-blue-300'
                        } ${plan.isPopular ? 'border-yellow-400' : ''}`}
                      onClick={() => setSelectedPlan(plan)}
                    >
                      {plan.isPopular && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                            <Crown className="h-3 w-3 mr-1" />
                            פופולרי
                          </Badge>
                        </div>
                      )}

                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {getPlanIcon(plan.planType)}
                            <CardTitle className="text-lg">{plan.name}</CardTitle>
                          </div>
                          {selectedPlan?.id === plan.id && (
                            <CheckCircle className="h-5 w-5 text-blue-500" />
                          )}
                        </div>
                        {plan.description && (
                          <p className="text-sm text-slate-600">{plan.description}</p>
                        )}
                      </CardHeader>

                      <CardContent>
                        <div className="mb-4">
                          <div className="flex items-baseline">
                            <span className="text-3xl font-bold text-slate-900">
                              {formatPrice(plan.price, plan.currency)}
                            </span>
                            <span className="text-slate-600 ml-1">
                              {getBillingText(plan.billingInterval)}
                            </span>
                          </div>
                          {plan.trialDays && (
                            <p className="text-sm text-green-600 mt-1">
                              {plan.trialDays} ימי ניסיון חינם
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          {plan.features.map((feature, idx) => (
                            <div key={idx} className="flex items-center space-x-2">
                              <Check className="h-4 w-4 text-green-500" />
                              <span className="text-sm text-slate-700">{feature}</span>
                            </div>
                          ))}

                          {plan.userLimit && (
                            <div className="flex items-center space-x-2">
                              <Users className="h-4 w-4 text-blue-500" />
                              <span className="text-sm text-slate-700">
                                עד {plan.userLimit} משתמשים
                              </span>
                            </div>
                          )}

                          {plan.storageLimit && (
                            <div className="flex items-center space-x-2">
                              <Database className="h-4 w-4 text-purple-500" />
                              <span className="text-sm text-slate-700">
                                {plan.storageLimit}שטח אחסון
                              </span>
                            </div>
                          )}

                          {plan.apiCallsLimit && (
                            <div className="flex items-center space-x-2">
                              <Zap className="h-4 w-4 text-yellow-500" />
                              <span className="text-sm text-slate-700">
                                {plan.apiCallsLimit.toLocaleString()} פעולות API / חודש
                              </span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>

            {selectedPlan && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <Button
                  onClick={() => setStep('details')}
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  המשך במסלול {selectedPlan.name}
                  <ArrowLeft className="h-4 w-4 ml-2" />
                </Button>
              </motion.div>
            )}
          </motion.div>
        )}

        {step === 'details' && selectedPlan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-2xl mx-auto"
          >
            <Card>
              <CardHeader>
                <CardTitle>השלם את הפרטים שלך</CardTitle>
                <p className="text-slate-600">
                  המידע שתספק לנו ישמש להגדרת החשבון שלך ולבחירת הדומיין.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Selected Plan Summary */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">מסלול נבחר:</span>
                    <Badge>{selectedPlan.name}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>מחיר:</span>
                    <span className="font-bold">
                      {formatPrice(selectedPlan.price, selectedPlan.currency)}
                      {getBillingText(selectedPlan.billingInterval)}
                    </span>
                  </div>
                </div>

                {/* Coupon Section */}
                <div className="space-y-4">
                  <Label>יש לך קוד קופון?</Label>
                  {!appliedCoupon ? (
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        onKeyPress={(e) => e.key === 'Enter' && validateCoupon()}
                      />
                      <Button
                        onClick={validateCoupon}
                        disabled={!couponCode.trim() || validatingCoupon}
                        variant="outline"
                      >
                        {validatingCoupon ? 'Validating...' : 'Apply'}
                      </Button>
                    </div>
                  ) : (
                    <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="flex items-center space-x-2">
                            <Gift className="h-4 w-4 text-green-600" />
                            <span className="font-medium text-green-800">
                              {appliedCoupon.coupon?.name}
                            </span>
                          </div>
                          <p className="text-sm text-green-600">
                            קוד קופון: {appliedCoupon.coupon?.code}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={removeCoupon}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Price Summary */}
                {appliedCoupon && (
                  <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span>מחיר מקורי:</span>
                      <span className="line-through text-slate-500">
                        {formatPrice(selectedPlan.price, selectedPlan.currency)}
                      </span>
                    </div>
                    <div className="flex justify-between text-green-600">
                      <span>Discount:</span>
                      <span>-{formatPrice(calculateSavings(), selectedPlan.currency)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold">
                      <span>מחיר סופי:</span>
                      <span>{formatPrice(calculateFinalPrice(), selectedPlan.currency)}</span>
                    </div>
                  </div>
                )}

                <Separator />

                {/* Customer Information Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">שם מלא של איש קשר</Label>
                    <Input
                      id="fullName"
                      value={customerInfo.fullName}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, fullName: e.target.value })}
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">כתובת מייל</Label>
                    <Input
                      id="email"
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                      placeholder="john@company.com"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="companyName">שם הארגון / עמותה</Label>
                    <Input
                      id="companyName"
                      value={customerInfo.companyName}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, companyName: e.target.value })}
                      placeholder="Your Company Inc."
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">מספר טלפון</Label>
                    <Input
                      id="phone"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="subdomain">דומיין מבוקש באפליקציה</Label>
                  <div className="flex">
                    <div className="bg-slate-100 border border-l-0 flex items-center border-slate-300 px-3 rounded-r-md text-slate-600">
                      <span dir="ltr"> .{product.domain || 'yourapp.com'}</span>
                    </div>
                    <div className="relative flex-1">
                      <Input
                        id="subdomain"
                        value={subdomainCheck.subdomain}
                        onChange={(e) => {
                          subdomainCheck.updateSubdomain(e.target.value);
                          setCustomerInfo({ ...customerInfo, subdomain: subdomainCheck.subdomain });
                        }}
                        placeholder="mycompany"
                        className={`rounded-r-none ${
                          subdomainCheck.result 
                            ? subdomainCheck.isAvailable 
                              ? 'border-green-500 focus:border-green-500' 
                              : 'border-red-500 focus:border-red-500'
                            : ''
                        }`}
                        required
                      />
                      {/* Status indicator */}
                      <div className="absolute inset-y-0 left-3 flex items-center">
                        {subdomainCheck.isChecking && (
                          <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                        )}
                        {!subdomainCheck.isChecking && subdomainCheck.result && (
                          <>
                            {subdomainCheck.isAvailable ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <X className="h-4 w-4 text-red-500" />
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Subdomain feedback */}
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-slate-500">
                      זו תהיה כתובת הארגון באפליקציה: {subdomainCheck.subdomain || 'mycompany'}.{product.domain || 'yourapp.com'}
                    </p>
                    
                    {subdomainCheck.result && (
                      <div className={`text-xs p-2 rounded ${
                        subdomainCheck.isAvailable 
                          ? 'bg-green-50 text-green-700 border border-green-200' 
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        {subdomainCheck.isAvailable ? (
                          <div className="flex items-center space-x-1">
                            <CheckCircle className="h-3 w-3" />
                            <span>✓ הדומיין זמין!</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1">
                            <AlertCircle className="h-3 w-3" />
                            <span>{subdomainCheck.errorMessage}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between pt-6">
                  <Button
                    variant="outline"
                    onClick={() => setStep('plans')}
                  >
                    חזרה לבחירת תוכניות
                  </Button>
                  <Button
                    onClick={() => setStep('payment')}
                    disabled={
                      !customerInfo.fullName || 
                      !customerInfo.email || 
                      !customerInfo.companyName || 
                      !subdomainCheck.subdomain || 
                      !subdomainCheck.isAvailable ||
                      subdomainCheck.isChecking
                    }
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {subdomainCheck.isChecking ? (
                      <>
                        <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                        בודק זמינות דומיין...
                      </>
                    ) : (
                      <>
                        המשך לתשלום
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {step === 'payment' && selectedPlan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-2xl mx-auto"
          >
            <Card>
              <CardHeader>
                <CardTitle>השלם את התשלום</CardTitle>
                <p className="text-slate-600">
                  תשלום מאובטח דרך PayPlus.
                </p>
              </CardHeader>
              <CardContent>
                {/* Order Summary */}
                <div className="bg-slate-50 p-6 rounded-lg mb-6">
                  <h3 className="font-bold mb-4">סיכום הזמנה</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>המוצר:</span>
                      <span>{product.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>תוכנית מנוי:</span>
                      <span>{selectedPlan.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>שם הארגון:</span>
                      <span>{customerInfo.companyName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>תת-דומיין לארגון:</span>
                      <span>{subdomainCheck.subdomain}.{product.domain}</span>
                    </div>
                    <Separator />
                    {appliedCoupon && (
                      <>
                        <div className="flex justify-between">
                          <span>סכום ביניים:</span>
                          <span>{formatPrice(selectedPlan.price, selectedPlan.currency)}</span>
                        </div>
                        <div className="flex justify-between text-green-600">
                          <span>הנחה ({appliedCoupon.coupon?.code}):</span>
                          <span>-{formatPrice(calculateSavings(), selectedPlan.currency)}</span>
                        </div>
                        <Separator />
                      </>
                    )}
                    <div className="flex justify-between font-bold text-lg">
                      <span>סה&quot;כ:</span>
                      <span>{formatPrice(calculateFinalPrice(), selectedPlan.currency)}</span>
                    </div>
                  </div>
                </div>

                <Alert className="mb-6">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    התשלום מתבצע דרך PayPlus, פלטפורמת התשלומים מאובטחת.
                    החשבון שלך ייווצר אוטומטית ותקבל פרטי התחברות באימייל.
                  </AlertDescription>
                </Alert>

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setStep('details')}
                    disabled={isProcessingPayment}
                  >
                    חזרה לפרטים
                  </Button>
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                    onClick={handlePayment}
                    disabled={isProcessingPayment}
                  >
                    {isProcessingPayment ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        מעבד...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4 ml-2" />
                        לתשלום {formatPrice(calculateFinalPrice(), selectedPlan.currency)}
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {step === 'processing' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-2xl mx-auto text-center"
          >
            <Card>
              <CardContent className="pt-12 pb-12">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-6"></div>
                <h2 className="text-2xl font-bold mb-4">מעבד את התשלום שלך</h2>
                <p className="text-slate-600 mb-6">
                  אנא המתינו למעבר לדף התשלום. זה עשוי לקחת מספר שניות.
                </p>
                <div className="space-y-2 text-sm text-slate-500">
                  <p>✓ Processing payment</p>
                  <p>⏳ Creating your account</p>
                  <p>⏳ Setting up your subdomain</p>
                  <p>⏳ Initializing your app</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
