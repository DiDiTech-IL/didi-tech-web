"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Mail, RefreshCw, XCircle } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

export default function PaymentFailure() {
  const params = useParams();
  const router = useRouter();
  const productName = params.productName as string;

  const handleRetry = () => {
    router.push(`/pay/${productName}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
     
        <Card className="border-red-200 shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl text-red-800">
              התשלום נכשל
            </CardTitle>
            <p className="text-red-600">
              מצטערים, אירעה שגיאה בעיבוד התשלום
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            <Alert className="border-orange-200 bg-orange-50">
              <AlertDescription className="text-orange-800">
                <strong>סיבות אפשריות לכשל התשלום:</strong>
                <ul className="mt-2 space-y-1 text-sm">
                  <li>• פרטי כרטיס האשראי שגויים</li>
                  <li>• אין מספיק כסף בכרטיס</li>
                  <li>• הכרטיס חסום או פג תוקף</li>
                  <li>• בעיה זמנית במערכת התשלומים</li>
                </ul>
              </AlertDescription>
            </Alert>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-800 mb-2">
                מה אפשר לעשות?
              </h3>
              <ul className="space-y-1 text-sm text-blue-700">
                <li>• ודא שפרטי הכרטיס נכונים</li>
                <li>• בדוק שיש מספיק יתרה בכרטיס</li>
                <li>• נסה כרטיס אשראי אחר</li>
                <li>• צור קשר עם הבנק שלך</li>
                <li>• נסה שוב בעוד מספר דקות</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button 
                onClick={handleRetry}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                נסה שוב
              </Button>
              <Button 
                variant="outline" 
                onClick={() => router.back()}
                className="flex-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                חזור אחורה
              </Button>
            </div>

            <div className="text-center">
              <Button 
                variant="ghost" 
                asChild
                className="text-gray-600 hover:text-gray-800"
              >
                <a href="mailto:support@diditech.co.il">
                  <Mail className="w-4 h-4 mr-2" />
                  צור קשר לתמיכה
                </a>
              </Button>
            </div>

            <div className="text-center text-sm text-gray-500 border-t pt-4">
              <p>
                אם הבעיה ממשיכה, אנא צור קשר עם צוות התמיכה שלנו
                <br />
                אנחנו כאן לעזור לך להשלים את הרכישה.
              </p>
            </div>
          </CardContent>
        </Card>
     
    </div>
  );
}
