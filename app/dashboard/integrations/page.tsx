"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Copy, 
  ExternalLink, 
  Settings, 
  Eye, 
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Webhook,
  Zap
} from "lucide-react";
import { motion } from "framer-motion";

interface Product {
  id: string;
  name: string;
  webhookKey?: string;
  webhookSecret?: string;
  webhookUrl?: string;
  status: string;
}

interface WebhookPayload {
  clientData: {
    email: string;
    subdomain: string;
  };
  planSelection: string;
  paymentData?: {
    amount: number;
    status: string;
  };
}

interface WebhookResponse {
  success: boolean;
  accountId?: string;
  message?: string;
}

interface WebhookLog {
  id: string;
  timestamp: string;
  status: 'success' | 'failed' | 'pending';
  payload: WebhookPayload;
  response?: WebhookResponse;
  error?: string;
}

export default function IntegrationsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [webhookLogs, setWebhookLogs] = useState<WebhookLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      } else {
        setError('Failed to fetch products');
      }
    } catch {
      setError('Error loading products');
    } finally {
      setLoading(false);
    }
  };

  const generateWebhookKey = async (productId: string) => {
    try {
      const response = await fetch(`/api/products/${productId}/webhook-key`, {
        method: 'POST'
      });
      
      if (response.ok) {
        const data = await response.json();
        setProducts(products.map(p => 
          p.id === productId 
            ? { ...p, webhookKey: data.webhookKey, webhookSecret: data.webhookSecret }
            : p
        ));
      }
    } catch (err) {
      console.error('Failed to generate webhook key:', err);
    }
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const viewWebhookLogs = async (productId: string) => {
    // Mock webhook logs for demo
    const mockLogs: WebhookLog[] = [
      {
        id: '1',
        timestamp: new Date().toISOString(),
        status: 'success',
        payload: {
          clientData: { email: 'test@example.com', subdomain: 'test-company' },
          planSelection: 'premium',
          paymentData: { amount: 99, status: 'completed' }
        },
        response: { success: true, accountId: 'acc_123' }
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        status: 'failed',
        payload: {
          clientData: { email: 'fail@example.com', subdomain: 'fail-test' },
          planSelection: 'basic'
        },
        error: 'Subdomain already exists'
      }
    ];
    
    setWebhookLogs(mockLogs);
    setSelectedProduct(products.find(p => p.id === productId) || null);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          אינטגרציות
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Connect your applications to the Tachles.dev payment flow. Set up seamless customer onboarding with automated account creation.
        </p>
      </div>

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <XCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
      )}

      {/* Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {products.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Webhook className="h-5 w-5 mr-2" />
                    {product.name}
                  </CardTitle>
                  <Badge variant={product.status === 'LIVE' ? 'default' : 'secondary'}>
                    {product.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Integration URL */}
                <div>
                  <Label className="text-sm font-medium">Integration URL</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Input
                      value={`https://pay.tachles.dev/${product.name.toLowerCase()}?data={token}`}
                      readOnly
                      className="font-mono text-xs"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(
                        `https://pay.tachles.dev/${product.name.toLowerCase()}?data=${product.webhookKey || '{token}'}`,
                        `url-${product.id}`
                      )}
                    >
                      {copied === `url-${product.id}` ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {/* Webhook Token */}
                <div>
                  <Label className="text-sm font-medium">Webhook Token</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    {product.webhookKey ? (
                      <>
                        <Input
                          value={product.webhookKey}
                          readOnly
                          type="password"
                          className="font-mono text-xs"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(product.webhookKey!, `key-${product.id}`)}
                        >
                          {copied === `key-${product.id}` ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </>
                    ) : (
                      <Button
                        onClick={() => generateWebhookKey(product.id)}
                        variant="outline"
                        size="sm"
                      >
                        Generate Token
                      </Button>
                    )}
                  </div>
                </div>

                {/* Webhook Secret */}
                {product.webhookSecret && (
                  <div>
                    <Label className="text-sm font-medium">Webhook Secret</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Input
                        value={product.webhookSecret}
                        readOnly
                        type="password"
                        className="font-mono text-xs"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(product.webhookSecret!, `secret-${product.id}`)}
                      >
                        {copied === `secret-${product.id}` ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`/pay/${product.name.toLowerCase()}?data=test`, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Test Flow
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => viewWebhookLogs(product.id)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View Logs
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                  >
                    <Settings className="h-4 w-4 mr-1" />
                    Configure
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    asChild
                  >
                    <a href="/dashboard/webhooks/setup">
                      <Zap className="h-4 w-4 mr-1" />
                      Quick Setup
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Webhook Logs Section */}
      {selectedProduct && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Integration Logs - {selectedProduct.name}</span>
              <Button size="sm" variant="outline">
                <RefreshCw className="h-4 w-4 mr-1" />
                Refresh
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {webhookLogs.map((log) => (
                <div
                  key={log.id}
                  className={`p-4 rounded-lg border ${
                    log.status === 'success' ? 'bg-green-50 border-green-200' :
                    log.status === 'failed' ? 'bg-red-50 border-red-200' :
                    'bg-yellow-50 border-yellow-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {log.status === 'success' && <CheckCircle className="h-4 w-4 text-green-600" />}
                      {log.status === 'failed' && <XCircle className="h-4 w-4 text-red-600" />}
                      {log.status === 'pending' && <Clock className="h-4 w-4 text-yellow-600" />}
                      <span className="font-medium">
                        {log.payload?.clientData?.email || 'Unknown'}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="text-sm space-y-1">
                    <p><strong>Plan:</strong> {log.payload?.planSelection || 'N/A'}</p>
                    <p><strong>Subdomain:</strong> {log.payload?.clientData?.subdomain || 'N/A'}</p>
                    {log.response && (
                      <p><strong>Account ID:</strong> {log.response.accountId}</p>
                    )}
                    {log.error && (
                      <p className="text-red-600"><strong>Error:</strong> {log.error}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Integration Guide */}
      <Card className="bg-blue-50 dark:bg-blue-950">
        <CardHeader>
          <CardTitle className="text-blue-900 dark:text-blue-100 flex items-center justify-between">
            📚 מדריך אינטגרציה מלא בעברית
            <Button 
              asChild 
              variant="outline" 
              className="border-blue-300 text-blue-700 hover:bg-blue-100"
            >
              <a href="/dashboard/webhooks/guide" target="_blank" className="flex items-center">
                <ExternalLink className="h-4 w-4 mr-1" />
                פתח מדריך מפורט
              </a>
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                👨‍💼 למנהל החברה
              </h4>
              <ul className="text-blue-800 dark:text-blue-200 space-y-1">
                <li>• הגדרת מוצרים במערכת</li>
                <li>• יצירת מפתחות webhook</li>
                <li>• הגדרת כתובות endpoint</li>
                <li>• ניהול אבטחה ואימותים</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                👨‍💻 למפתח האפליקציה
              </h4>
              <ul className="text-blue-800 dark:text-blue-200 space-y-1">
                <li>• הוספת כפתור &quot;הצטרף&quot;</li>
                <li>• יצירת webhook endpoint</li>
                <li>• עיבוד נתוני לקוחות</li>
                <li>• דוגמאות קוד מלאות</li>
              </ul>
            </div>
          </div>

          <div className="pt-4 border-t border-blue-200 dark:border-blue-800">
            <p className="text-blue-800 dark:text-blue-200">
              <strong>המדריך כולל:</strong> הסברים צעד אחר צעד, דוגמאות קוד, בדיקות ואבטחה - הכל בעברית!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
