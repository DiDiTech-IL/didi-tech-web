
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, ExternalLink, Mail } from "lucide-react";

interface PaymentSuccessProps {
    params: Promise<{
        productName: string;
        subdomain: string;
        domain: string;
        customerEmail: string;
        planName: string;
    }>
}

export default async function PaymentSuccess({
    params
}: PaymentSuccessProps) {
    const { productName, subdomain, domain, customerEmail, planName } = await params;
    const appUrl = `https://${subdomain}.${domain}`;

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
           
                <Card className="border-green-200 shadow-lg">
                    <CardHeader className="text-center">
                        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                        <CardTitle className="text-2xl text-green-800">
                            התשלום הושלם בהצלחה!
                        </CardTitle>
                        <p className="text-green-600">
                            החשבון שלך במערכת {productName} הוקם בהצלחה
                        </p>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                            <h3 className="font-semibold text-green-800 mb-2">פרטי החשבון שלך:</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">מסלול:</span>
                                    <span className="font-medium">{planName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">כתובת המערכת:</span>
                                    <a
                                        href={appUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="font-medium text-blue-600 hover:text-blue-800 underline"
                                    >
                                        {appUrl}
                                    </a>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">אימייל:</span>
                                    <span className="font-medium">{customerEmail}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <h3 className="font-semibold text-blue-800 mb-2 flex items-center">
                                <Mail className="w-4 h-4 mr-2" />
                                שלבים הבאים:
                            </h3>
                            <ul className="space-y-1 text-sm text-blue-700">
                                <li>• בדוק את תיבת המייל שלך לקבלת פרטי התחברות</li>
                                <li>• פרטי הגישה נשלחו לכתובת: {customerEmail}</li>
                                <li>• אם לא קיבלת מייל, בדוק בתיקיית הספאם</li>
                                <li>• ייתכן שיידרש מספר דקות עד שהמערכת תהיה מוכנה</li>
                            </ul>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <Button
                                asChild
                                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                            >
                                <a href={appUrl} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    כניסה למערכת
                                </a>
                            </Button>
                            <Button
                                variant="outline"
                                asChild
                                className="flex-1"
                            >
                                <a href="mailto:support@diditech.co.il">
                                    <Mail className="w-4 h-4 mr-2" />
                                    יצירת קשר לתמיכה
                                </a>
                            </Button>
                        </div>

                        <div className="text-center text-sm text-gray-500 border-t pt-4">
                            <p>
                                תודה שבחרת ב-{productName}!
                                <br />
                                אנחנו כאן לעזור לך להתחיל.
                            </p>
                        </div>
                    </CardContent>
                </Card>
          
        </div>
    );
}
