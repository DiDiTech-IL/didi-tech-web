'use client';

import { motion } from "framer-motion";
import { AlertCircle, ArrowLeft, Search } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PaymentNotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        <Card className="shadow-lg border-0">
          <CardHeader className="text-center pb-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto mb-4 w-16 h-16 rounded-full bg-red-100 flex items-center justify-center"
            >
              <AlertCircle className="w-8 h-8 text-red-600" />
            </motion.div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              מוצר לא נמצא
            </CardTitle>
            <p className="text-gray-600 mt-2">
              המוצר שחיפשת אינו זמין או שהקישור שגוי
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Search className="w-5 h-5 text-amber-600 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium mb-1">דברים לבדוק:</p>
                  <ul className="space-y-1 text-amber-700">
                    <li>• בדוק שהכתובת נכונה</li>
                    <li>• וודא שהמוצר פעיל</li>
                    <li>• נסה לחפש את המוצר מחדש</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex flex-col space-y-3">
              <Button
                asChild
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Link href="/">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  חזור לעמוד הבית
                </Link>
              </Button>
              
              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.history.back()}
              >
                חזור לעמוד הקודם
              </Button>
            </div>

            <div className="text-center text-sm text-gray-500">
              <p>
                אם אתה חושב שזה באג, אנא{' '}
                <a 
                  href="mailto:support@tachles.dev" 
                  className="text-blue-600 hover:underline"
                >
                  צור קשר עם התמיכה
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
