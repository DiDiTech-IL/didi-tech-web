"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  CheckCircle, 
  Copy, 
  ExternalLink, 
  Globe,
  Key,
  Code,
  Zap,
  ArrowRight
} from "lucide-react";
import { motion } from "framer-motion";

interface Product {
  id: string;
  name: string;
  domain?: string;
}

interface WebhookData {
  webhookKey: string;
  webhookSecret: string;
  integrationUrl: string;
}

export default function WebhookSetupWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [appUrl, setAppUrl] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [webhookData, setWebhookData] = useState<WebhookData | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const steps = [
    { number: 1, title: "Select Product", icon: Globe },
    { number: 2, title: "App URL", icon: Code },
    { number: 3, title: "Generate Webhook", icon: Key },
    { number: 4, title: "Integration Ready", icon: Zap },
  ];

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  const generateWebhook = async () => {
    if (!selectedProduct) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/products/${selectedProduct.id}/webhook-key`, {
        method: 'POST'
      });
      
      if (response.ok) {
        const data = await response.json();
        setWebhookData(data);
        setCurrentStep(4);
      }
    } catch (error) {
      console.error('Failed to generate webhook:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const generateWebhookEndpoint = (): string => {
    if (!appUrl) return "";
    try {
      const url = new URL(appUrl);
      return `${url.origin}/api/tachles/webhook`;
    } catch {
      return `${appUrl}/api/tachles/webhook`;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Progress Bar */}
      <div className="flex items-center justify-between mb-8">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
              currentStep >= step.number 
                ? 'bg-blue-600 border-blue-600 text-white' 
                : 'border-gray-300 text-gray-400'
            }`}>
              {currentStep > step.number ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <step.icon className="w-5 h-5" />
              )}
            </div>
            <div className="ml-3">
              <p className={`text-sm font-medium ${
                currentStep >= step.number ? 'text-gray-900' : 'text-gray-400'
              }`}>
                Step {step.number}
              </p>
              <p className={`text-xs ${
                currentStep >= step.number ? 'text-gray-600' : 'text-gray-400'
              }`}>
                {step.title}
              </p>
            </div>
            {index < steps.length - 1 && (
              <ArrowRight className="w-4 h-4 mx-4 text-gray-300" />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Step 1: Select Product */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="w-5 h-5 mr-2" />
                Select Your Product
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Choose the product you want to set up webhook integration for.
              </p>
              
              <Button onClick={fetchProducts} variant="outline">
                Load Products
              </Button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedProduct?.id === product.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedProduct(product)}
                  >
                    <h3 className="font-semibold">{product.name}</h3>
                    {product.domain && (
                      <p className="text-sm text-gray-600">{product.domain}</p>
                    )}
                  </div>
                ))}
              </div>

              {selectedProduct && (
                <div className="flex justify-end">
                  <Button onClick={() => setCurrentStep(2)}>
                    Continue with {selectedProduct.name}
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 2: App URL */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Code className="w-5 h-5 mr-2" />
                Enter Your App URL
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Enter the base URL of your application where we&apos;ll send webhook notifications.
              </p>

              <div className="space-y-2">
                <Label htmlFor="appUrl">Application URL</Label>
                <Input
                  id="appUrl"
                  placeholder="https://myapp.com"
                  value={appUrl}
                  onChange={(e) => setAppUrl(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  We&apos;ll automatically append &quot;/api/tachles/webhook&quot; to create your webhook endpoint
                </p>
              </div>

              {appUrl && (
                <Alert>
                  <Globe className="w-4 h-4" />
                  <AlertDescription>
                    <strong>Webhook Endpoint:</strong> {generateWebhookEndpoint()}
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(1)}>
                  Back
                </Button>
                <Button 
                  onClick={() => setCurrentStep(3)}
                  disabled={!appUrl}
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Generate Webhook */}
        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Key className="w-5 h-5 mr-2" />
                Generate Webhook Credentials
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Integration Summary</h3>
                <div className="space-y-1 text-sm">
                  <p><strong>Product:</strong> {selectedProduct?.name}</p>
                  <p><strong>App URL:</strong> {appUrl}</p>
                  <p><strong>Webhook Endpoint:</strong> {generateWebhookEndpoint()}</p>
                </div>
              </div>

              <Alert>
                <Key className="w-4 h-4" />
                <AlertDescription>
                  This will generate secure webhook credentials for your integration. 
                  Make sure to save them safely as the secret won&apos;t be shown again.
                </AlertDescription>
              </Alert>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(2)}>
                  Back
                </Button>
                <Button 
                  onClick={generateWebhook}
                  disabled={loading}
                >
                  {loading ? 'Generating...' : 'Generate Webhook'}
                  <Key className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Integration Ready */}
        {currentStep === 4 && webhookData && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-green-700">
                <CheckCircle className="w-5 h-5 mr-2" />
                Integration Ready!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <AlertDescription className="text-green-700">
                  Your webhook integration has been successfully configured! 
                  Copy the credentials below and implement them in your application.
                </AlertDescription>
              </Alert>

              {/* Integration URL */}
              <div className="space-y-2">
                <Label className="font-semibold">Integration URL (for your &quot;Join Now&quot; button)</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    value={webhookData.integrationUrl.replace('{token}', webhookData.webhookKey)}
                    readOnly
                    className="font-mono text-xs"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(
                      webhookData.integrationUrl.replace('{token}', webhookData.webhookKey),
                      'integration'
                    )}
                  >
                    {copied === 'integration' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              {/* Webhook Endpoint */}
              <div className="space-y-2">
                <Label className="font-semibold">Your Webhook Endpoint</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    value={generateWebhookEndpoint()}
                    readOnly
                    className="font-mono text-xs"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(generateWebhookEndpoint(), 'endpoint')}
                  >
                    {copied === 'endpoint' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              {/* Webhook Secret */}
              <div className="space-y-2">
                <Label className="font-semibold">Webhook Secret (for signature verification)</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    value={webhookData.webhookSecret}
                    readOnly
                    type="password"
                    className="font-mono text-xs"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(webhookData.webhookSecret, 'secret')}
                  >
                    {copied === 'secret' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              {/* Environment Variables */}
              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg">
                <h4 className="font-semibold mb-2 text-gray-100">Environment Variables (.env)</h4>
                <pre className="text-xs overflow-x-auto">
{`TACHLES_WEBHOOK_SECRET=${webhookData.webhookSecret}
TACHLES_WEBHOOK_KEY=${webhookData.webhookKey}`}
                </pre>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-2"
                  onClick={() => copyToClipboard(
                    `TACHLES_WEBHOOK_SECRET=${webhookData.webhookSecret}\nTACHLES_WEBHOOK_KEY=${webhookData.webhookKey}`,
                    'env'
                  )}
                >
                  {copied === 'env' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  Copy Environment Variables
                </Button>
              </div>

              {/* Next Steps */}
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Next Steps:</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                  <li>Add the environment variables to your app</li>
                  <li>Create the webhook endpoint at: <code className="bg-gray-100 px-1 rounded">{generateWebhookEndpoint()}</code></li>
                  <li>Add the &quot;Join Now&quot; button with the integration URL</li>
                  <li>Test the integration flow</li>
                </ol>
              </div>

              <div className="flex justify-between">
                <Button 
                  variant="outline"
                  onClick={() => {
                    setCurrentStep(1);
                    setSelectedProduct(null);
                    setAppUrl("");
                    setWebhookData(null);
                  }}
                >
                  Setup Another Integration
                </Button>
                <Button asChild>
                  <a href="/dashboard/webhooks/guide" target="_blank">
                    <ExternalLink className="w-4 h-4 mr-1" />
                    View Implementation Guide
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  );
}
