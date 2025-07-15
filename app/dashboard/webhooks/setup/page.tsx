"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  Copy, 
  ExternalLink, 
  Globe,
  Key,
  Code,
  Zap,
  ArrowRight,
  ArrowLeft,
  Info,
  Settings
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  domain?: string;
  webhookKey?: string;
}

interface WebhookCredentials {
  webhookKey: string;
  webhookSecret: string;
  integrationUrl: string;
}

export default function WebhookSetupWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [webhookDescription, setWebhookDescription] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [availableEvents, setAvailableEvents] = useState<Record<string, string>>({});
  const [credentials, setCredentials] = useState<WebhookCredentials | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const steps = [
    { number: 1, title: "בחר מוצר", icon: Globe },
    { number: 2, title: "כתובת Webhook", icon: Code },
    { number: 3, title: "בחר אירועים", icon: Settings },
    { number: 4, title: "צור Webhook", icon: Key },
    { number: 5, title: "האינטגרציה מוכנה", icon: Zap },
  ];

  useEffect(() => {
    fetchProducts();
    fetchAvailableEvents();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products");
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const fetchAvailableEvents = async () => {
    try {
      const response = await fetch("/api/webhooks/setup");
      if (response.ok) {
        const data = await response.json();
        setAvailableEvents(data.events);
      }
    } catch (error) {
      console.error("Error fetching webhook events:", error);
    }
  };

  const createWebhook = async () => {
    if (!selectedProduct || !webhookUrl || selectedEvents.length === 0) return;

    setIsCreating(true);
    try {
      const response = await fetch("/api/webhooks/setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: selectedProduct.id,
          url: webhookUrl,
          events: selectedEvents,
          description: webhookDescription || `Webhook for ${selectedProduct.name}`,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCredentials(data.credentials);
        setCurrentStep(5);
      } else {
        const error = await response.json();
        alert(`Error creating webhook: ${error.error}`);
      }
    } catch (error) {
      console.error("Error creating webhook:", error);
      alert("יצירת הוובהוק נכשלה. אנא נסה שוב.");
    } finally {
      setIsCreating(false);
    }
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const handleEventToggle = (eventKey: string) => {
    setSelectedEvents(prev => 
      prev.includes(eventKey) 
        ? prev.filter(e => e !== eventKey)
        : [...prev, eventKey]
    );
  };

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1:
        return selectedProduct !== null;
      case 2:
        return webhookUrl.trim() !== "";
      case 3:
        return selectedEvents.length > 0;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-lg font-semibold mb-2">בחר את המוצר שלך</h3>
              <p className="text-gray-600 mb-4">
                Select the product you want to integrate webhooks with.
              </p>
            </div>

            <div className="grid gap-4">
              {products.map((product) => (
                <Card
                  key={product.id}
                  className={`cursor-pointer transition-all ${
                    selectedProduct?.id === product.id
                      ? "ring-2 ring-blue-500 bg-blue-50"
                      : "hover:shadow-md"
                  }`}
                  onClick={() => setSelectedProduct(product)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{product.name}</h4>
                        {product.domain && (
                          <p className="text-sm text-gray-500">{product.domain}</p>
                        )}
                      </div>
                      {selectedProduct?.id === product.id && (
                        <CheckCircle className="h-5 w-5 text-blue-500" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {products.length === 0 && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  No products found. Please create a product first.
                </AlertDescription>
              </Alert>
            )}
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-lg font-semibold mb-2">כתובת נקודת קצה של Webhook</h3>
              <p className="text-gray-600 mb-4">
                Enter the URL where you want to receive webhook notifications.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="webhook-url">כתובת Webhook *</Label>
                <Input
                  id="webhook-url"
                  type="url"
                  placeholder="https://your-app.com/api/webhooks"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what this webhook is used for..."
                  value={webhookDescription}
                  onChange={(e) => setWebhookDescription(e.target.value)}
                  className="mt-1"
                  rows={3}
                />
              </div>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Make sure your endpoint is publicly accessible and can handle POST requests.
              </AlertDescription>
            </Alert>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-lg font-semibold mb-2">בחר אירועי webhook</h3>
              <p className="text-gray-600 mb-4">
                Choose which events you want to receive notifications for.
              </p>
            </div>

            <div className="grid gap-3">
              {Object.entries(availableEvents).map(([eventKey, description]) => (
                <div key={eventKey} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                  <Checkbox
                    id={eventKey}
                    checked={selectedEvents.includes(eventKey)}
                    onCheckedChange={() => handleEventToggle(eventKey)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <Label 
                      htmlFor={eventKey} 
                      className="font-medium cursor-pointer"
                    >
                      {eventKey}
                    </Label>
                    <p className="text-sm text-gray-600 mt-1">{description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <span className="text-sm text-gray-600">
                Selected: {selectedEvents.length} event{selectedEvents.length !== 1 ? 's' : ''}
              </span>
              <div className="flex flex-wrap gap-1">
                {selectedEvents.slice(0, 3).map((event) => (
                  <Badge key={event} variant="secondary" className="text-xs">
                    {event}
                  </Badge>
                ))}
                {selectedEvents.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{selectedEvents.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-lg font-semibold mb-2">צור webhook</h3>
              <p className="text-gray-600 mb-4">
                Review your configuration and create the webhook.
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">סיכום תצורה</h4>
                <div className="space-y-2 text-sm">
                  <div><strong>Product:</strong> {selectedProduct?.name}</div>
                  <div><strong>URL:</strong> {webhookUrl}</div>
                  <div><strong>Events:</strong> {selectedEvents.length} selected</div>
                  {webhookDescription && (
                    <div><strong>Description:</strong> {webhookDescription}</div>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {selectedEvents.map((event) => (
                  <Badge key={event} variant="outline">
                    {event}
                  </Badge>
                ))}
              </div>
            </div>

            <Button 
              onClick={createWebhook} 
              disabled={isCreating}
              className="w-full"
              size="lg"
            >
              {isCreating ? "Creating webhook..." : "Create Webhook"}
            </Button>
          </motion.div>
        );

      case 5:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Webhook Created Successfully!</h3>
              <p className="text-gray-600">
                Your webhook is now active and ready to receive events.
              </p>
            </div>

            {credentials && (
              <div className="space-y-4">
                <div>
                  <Label>מפתח Webhook</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Input 
                      value={credentials.webhookKey} 
                      readOnly 
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(credentials.webhookKey, "key")}
                    >
                      {copied === "key" ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label>סוד Webhook</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Input 
                      value={credentials.webhookSecret} 
                      readOnly 
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(credentials.webhookSecret, "secret")}
                    >
                      {copied === "secret" ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label>כתובת אינטגרציה</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Input 
                      value={credentials.integrationUrl} 
                      readOnly 
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(credentials.integrationUrl, "url")}
                    >
                      {copied === "url" ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Store these credentials securely. You&apos;ll need them to authenticate webhook requests.
              </AlertDescription>
            </Alert>

            <div className="flex space-x-3">
              <Button asChild className="flex-1">
                <Link href="/dashboard/webhooks">
                  View All Webhooks
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="https://docs.tachles.dev/webhooks" target="_blank">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Documentation
                </Link>
              </Button>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <Link href="/dashboard/webhooks" className="text-blue-600 hover:text-blue-800 flex items-center mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Webhooks
        </Link>
        <h1 className="text-3xl font-bold">אשף הגדרת Webhook</h1>
        <p className="text-gray-600 mt-2">
          Configure webhooks to receive real-time notifications about events in your application.
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep >= step.number
                    ? "bg-blue-500 border-blue-500 text-white"
                    : "border-gray-300 text-gray-500"
                }`}
              >
                {currentStep > step.number ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <step.icon className="h-5 w-5" />
                )}
              </div>
              <div className="ml-3">
                <p className={`text-sm font-medium ${
                  currentStep >= step.number ? "text-blue-600" : "text-gray-500"
                }`}>
                  {step.title}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-16 h-px mx-4 ${
                  currentStep > step.number ? "bg-blue-500" : "bg-gray-300"
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Step {currentStep} of {steps.length}</CardTitle>
        </CardHeader>
        <CardContent>
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation */}
      {currentStep < 5 && (
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(currentStep - 1)}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          <Button
            onClick={() => {
              if (currentStep === 4) {
                createWebhook();
              } else {
                setCurrentStep(currentStep + 1);
              }
            }}
            disabled={!canProceedToNextStep() || (currentStep === 4 && isCreating)}
          >
            {currentStep === 4 ? (
              isCreating ? "Creating..." : "Create Webhook"
            ) : (
              <>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
