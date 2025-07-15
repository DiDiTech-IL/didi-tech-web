import Link from 'next/link';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
      <div className="text-center max-w-md mx-auto px-4">
        <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          חשבונית לא נמצאה
        </h1>
        <p className="text-gray-600 mb-6">
          לא הצלחנו למצוא את החשבונית שחיפשת. ייתכן שהקישור שגוי או שהחשבונית לא קיימת יותר.
        </p>
        <div className="space-y-3">
          <Button asChild className="w-full">
            <Link href="/">
              חזרה לעמוד הבית
            </Link>
          </Button>
          <p className="text-sm text-gray-500">
            זקוק לעזרה? צור איתנו קשר
          </p>
        </div>
      </div>
    </div>
  );
}
