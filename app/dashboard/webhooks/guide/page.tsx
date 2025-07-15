"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Settings, 
  Code, 
  Globe, 
  Shield, 
  CheckCircle, 
  AlertTriangle,
  Copy,
  ExternalLink,
  Zap,
  Users,
  CreditCard
} from "lucide-react";
import { RTLWrapper } from "@/components/RTLWrapper";
import { useState } from "react";

export default function WebhookGuidePage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyCode = async (code: string, id: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(id);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('שגיאה בהעתקה:', err);
    }
  };

  const htmlCode = `<a href="https://pay.tachles.dev/myapp?data=WEBHOOK_TOKEN" class="btn btn-primary">הצטרף עכשיו</a>`;
  
  const reactCode = `function JoinButton() {
  const handleJoin = () => {
    window.open(
      'https://pay.tachles.dev/myapp?data=WEBHOOK_TOKEN',
      '_blank'
    );
  };

  return (
    <button onClick={handleJoin} className="join-btn">
      הצטרף עכשיו 🚀
    </button>
  );
}`;

  const webhookCode = `const express = require('express');
const crypto = require('crypto');
const app = express();

app.use(express.json());

app.post('/api/tachles/webhook', async (req, res) => {
  try {
    // בדיקת חתימה לאבטחה
    const signature = req.headers['x-webhook-signature'];
    const secret = process.env.WEBHOOK_SECRET;
    
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(req.body))
      .digest('hex');
    
    if (signature !== expectedSignature) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // עיבוד הנתונים
    const { clientData, planSelection, paymentData } = req.body;
    
    // יצירת חשבון ללקוח
    const newAccount = await createUserAccount({
      email: clientData.email,
      name: clientData.fullName,
      company: clientData.companyName,
      subdomain: clientData.subdomain,
      plan: planSelection
    });

    // הגדרת מסד נתונים/תשתית
    await setupUserEnvironment(newAccount.id, planSelection);

    res.json({
      success: true,
      data: {
        accountId: newAccount.id,
        subdomainUrl: \`https://\${clientData.subdomain}.myapp.com\`,
        adminCredentials: {
          email: clientData.email,
          temporaryPassword: generateTempPassword()
        }
      }
    });

  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});`;

  const jsonExample = `{
  "planSelection": "premium",
  "originUrl": "https://myapp.com",
  "destinationUrl": "https://myapp.com",
  "clientData": {
    "email": "customer@example.com",
    "companyName": "חברת הלקוח",
    "fullName": "שם מלא של הלקוח",
    "phone": "+972-50-1234567",
    "subdomain": "customer-company"
  },
  "paymentData": {
    "transactionId": "txn_123456789",
    "amount": 99.99,
    "currency": "ILS",
    "status": "completed"
  },
  "productName": "myapp",
  "webhookKey": "webhook_abc123def456..."
}`;

  return (
    <RTLWrapper>
      <div className="p-6 max-w-6xl mx-auto space-y-8">
        {/* כותרת */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
            🔗 מדריך אינטגרציית Webhooks
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            הדרכה מלאה להגדרת רישום אוטומטי ללקוחות דרך המערכת
          </p>
        </div>

        {/* סקירה כללית */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-900">
              <Zap className="h-6 w-6 ml-2" />
              איך זה עובד?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div className="space-y-2">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold">1. לקוח לוחץ &quot;הצטרף&quot;</h3>
                <p className="text-sm text-slate-600">באפליקציה של הלקוח שלך</p>
              </div>
              <div className="space-y-2">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CreditCard className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold">2. ביצוע תשלום</h3>
                <p className="text-sm text-slate-600">במערכת Tachles.dev</p>
              </div>
              <div className="space-y-2">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                  <Globe className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold">3. Webhook נשלח</h3>
                <p className="text-sm text-slate-600">לאפליקציה אוטומטית</p>
              </div>
              <div className="space-y-2">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="font-semibold">4. חשבון נוצר</h3>
                <p className="text-sm text-slate-600">ללקוח באופן אוטומטי</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="admin" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="admin" className="flex items-center">
              <Settings className="h-4 w-4 ml-2" />
              הגדרות מנהל החברה
            </TabsTrigger>
            <TabsTrigger value="developer" className="flex items-center">
              <Code className="h-4 w-4 ml-2" />
              הגדרות מפתח האפליקציה
            </TabsTrigger>
          </TabsList>

          {/* הגדרות מנהל החברה */}
          <TabsContent value="admin" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 ml-2" />
                  שלב 1: הגדרת המוצר במערכת
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">📝 פרטי המוצר</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• נתן שם למוצר (באנגלית, ללא רווחים)</li>
                      <li>• הגדר תיאור קצר</li>
                      <li>• בחר סטטוס: DEVELOPMENT או LIVE</li>
                      <li>• הזן URL של האפליקציה</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">💰 הגדרות מחירים</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• הגדר תוכניות מחירים (JSON)</li>
                      <li>• קבע מטבע ברירת מחדל</li>
                      <li>• הגדר מחזור חיוב</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 ml-2" />
                  שלב 2: יצירת מפתחות Webhook
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>חשוב:</strong> שמור את המפתחות במקום בטוח! לא תוכל לראות אותם שוב אחרי היצירה.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold mb-2">🔑 Webhook Key</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      מפתח ייחודי לזיהוי האפליקציה שלך
                    </p>
                    <div className="font-mono text-xs bg-white p-2 rounded border">
                      webhook_abc123def456...
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold mb-2">🔐 Webhook Secret</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      מפתח סודי לאימות הודעות
                    </p>
                    <div className="font-mono text-xs bg-white p-2 rounded border">
                      secret_xyz789uvw012...
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">URL לאינטגרציה</h4>
                  <p className="text-sm text-blue-700 mb-2">
                    שתף את ה-URL הזה עם מפתח האפליקציה:
                  </p>
                  <div className="font-mono text-xs bg-white p-2 rounded border">
                    https://pay.tachles.dev/[שם-האפליקציה]?data=&#123;&quot;token&quot;&#125;&amp;redirect=true
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* הגדרות מפתח האפליקציה */}
          <TabsContent value="developer" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Code className="h-5 w-5 ml-2" />
                  שלב 1: הוספת כפתור &quot;הצטרף&quot; לאפליקציה
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>הוסף כפתור או קישור באפליקציה שלך שמוביל ללקוח למערכת התשלום:</p>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">HTML פשוט:</h4>
                    <div className="relative">
                      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
{htmlCode}
                      </pre>
                      <Button
                        size="sm"
                        variant="outline"
                        className="absolute top-2 left-2"
                        onClick={() => copyCode(htmlCode, 'html')}
                      >
                        {copiedCode === 'html' ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">React Component:</h4>
                    <div className="relative">
                      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
{reactCode}
                      </pre>
                      <Button
                        size="sm"
                        variant="outline"
                        className="absolute top-2 left-2"
                        onClick={() => copyCode(reactCode, 'react')}
                      >
                        {copiedCode === 'react' ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>

                <Alert className="bg-amber-50 border-amber-200">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-700">
                    <strong>שים לב:</strong> החלף את &quot;WEBHOOK_TOKEN&quot; במפתח האמיתי שקיבלת ממנהל החברה.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="h-5 w-5 ml-2" />
                  שלב 2: יצירת Webhook Endpoint
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>צור endpoint שיקבל את הודעות ה-webhook ויבצע את הרישום:</p>

                <div>
                  <h4 className="font-semibold mb-2">Node.js + Express:</h4>
                  <div className="relative">
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
{webhookCode}
                    </pre>
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute top-2 left-2"
                      onClick={() => copyCode(webhookCode, 'nodejs')}
                    >
                      {copiedCode === 'nodejs' ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 ml-2" />
                  שלב 3: מבנה הנתונים שתקבל
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>זה מבנה ה-JSON שתקבל ב-webhook:</p>

                <div className="relative">
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
{jsonExample}
                  </pre>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute top-2 left-2"
                    onClick={() => copyCode(jsonExample, 'json')}
                  >
                    {copiedCode === 'json' ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* סעיף בדיקות */}
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-900">
              ✅ בדיקה ובחינה
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">בדיקות למנהל החברה:</h4>
                <ul className="space-y-1 text-sm">
                  <li>✓ בדוק שהמוצר מוגדר נכון במערכת</li>
                  <li>✓ ודא שמפתחות ה-webhook נוצרו</li>
                  <li>✓ בחן את ה-URL לאינטגרציה</li>
                  <li>✓ בדוק שה-webhook URL של האפליקציה עובד</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">בדיקות למפתח האפליקציה:</h4>
                <ul className="space-y-1 text-sm">
                  <li>✓ ודא שכפתור &quot;הצטרף&quot; מוביל לכתובת הנכונה</li>
                  <li>✓ בחן שה-endpoint מקבל נתונים נכון</li>
                  <li>✓ וודא שאימות החתימה עובד</li>
                  <li>✓ בדוק יצירת חשבונות חדשים</li>
                </ul>
              </div>
            </div>

            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>עצה:</strong> השתמש בכלי &quot;Test Flow&quot; בדף האינטגרציות כדי לבדוק את כל התהליך מקצה לקצה.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* כפתורי פעולה */}
        <div className="flex justify-center space-x-4">
          <Button asChild>
            <a href="/dashboard/integrations">
              <Settings className="h-4 w-4 ml-2" />
              חזור לדף האינטגרציות
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a href="/dashboard/webhooks" target="_blank">
              <ExternalLink className="h-4 w-4 ml-2" />
              פתח דף ה-Webhooks
            </a>
          </Button>
        </div>
      </div>
    </RTLWrapper>
  );
}
