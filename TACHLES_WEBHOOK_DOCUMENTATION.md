# תיעוד Webhook של Tachles - תהליך הפעלת דומיין

## סקירה כללית

ה-webhook של Tachles מטפל בתהליך מלא של הפעלת חשבונות חדשים עבור לקוחות שמשלמים דרך מערכת התשלומים. התהליך כולל:

1. יצירת/עדכון רשומת לקוח במסד הנתונים
2. יצירת אישורים זמניים
3. שליחת מייל ברוכים הבאים ללקוח
4. שליחת webhook חזרה ל-Tachles
5. תיעוד מלא של כל השלבים

## אירועי Webhook נתמכים

### `domain.activated`
מופעל כאשר לקוח משלם בהצלחה ויש להפעיל את החשבון שלו.

**תהליך:**
1. **בדיקת לקוח קיים** - בודק אם הלקוח כבר קיים במערכת
2. **יצירת/עדכון לקוח** - יוצר לקוח חדש או מעדכן קיים לסטטוס פעיל
3. **יצירת אישורים** - מייצר סיסמה זמנית וכתובת דומיין
4. **שליחת מייל ברוכים הבאים** - שולח מייל עם פרטי הכניסה ללקוח
5. **webhook ל-Tachles** - מחזיר אישור שהחשבון הוגדר
6. **תיעוד** - רושם את כל השלבים במסד הנתונים

### `domain.suspended`
מופעל כאשר צריך להשעות חשבון לקוח.

### `domain.cancelled`
מופעל כאשר צריך לבטל חשבון לקוח.

## הגדרות נדרשות

### משתני סביבה
```env
RESEND_API_KEY=re_xxxxxxxxxxxx
FROM_EMAIL=noreply@yourdomain.com
```

### תלויות
- `resend` - לשליחת מיילים
- `@prisma/client` - מסד נתונים
- `zod` - validations

## מבנה המייל

המייל שנשלח ללקוח כולל:
- ברכת ברוכים הבאים בעברית
- פרטי הכניסה:
  - כתובת האתר המלאה
  - תת-דומיין
  - אימייל
  - סיסמה זמנית
- הוראות אבטחה
- עיצוב responsive בעברית (RTL)

## תיעוד ולוגים

### סוגי לוגים:
1. **Console Logs** - לוגים מפורטים בקונסול עם emojis לקלות זיהוי
2. **Database Logs** - כל שלב נרשם ב-`webhookLog` table
3. **Email Logs** - תיעוד נפרד לשליחת מיילים

### מבנה הלוג:
```typescript
{
  timestamp: string,
  step: string,
  status: 'started' | 'completed' | 'failed',
  details: Record<string, unknown>,
  error?: string
}
```

### דוגמאות לשלבים:
- `domain_activation_started`
- `client_lookup`
- `client_creation` / `client_update`
- `credentials_generation`
- `email_sending`
- `tachles_webhook`
- `domain_activation_completed`

## טיפול בשגיאות

- כל שגיאה נרשמת במסד הנתונים
- המערכת ממשיכה בתהליך גם אם שליחת המייל נכשלת
- מזהה ייחודי לכל request לצורך מעקב
- שגיאות validation מוחזרות עם פירוט

## דוגמה לשימוש

```bash
curl -X POST https://yourdomain.com/api/webhooks/tachles \
  -H "Content-Type: application/json" \
  -H "x-tachles-signature: your-signature" \
  -d '{
    "event": "domain.activated",
    "leadId": "lead_123",
    "tachlesCustomerId": "customer_456",
    "domainInfo": {
      "subdomain": "example",
      "contactEmail": "user@example.com",
      "contactName": "John Doe",
      "organizationName": "Example Corp",
      "contactPhone": "+972501234567"
    }
  }'
```

## תגובה מהשרת

### הצלחה:
```json
{
  "received": true,
  "requestId": "req-1234567890-abcdef123",
  "event": "domain.activated",
  "timestamp": "2025-07-15T12:00:00.000Z"
}
```

### שגיאה:
```json
{
  "error": "Invalid webhook payload",
  "details": [...],
  "requestId": "req-1234567890-abcdef123"
}
```

## ניטור ותחזוקה

1. **בדיקת לוגים:** עקוב אחר הלוגים ב-`webhookLog` table
2. **מעקב מיילים:** בדוק שמיילים נשלחים בהצלחה
3. **Performance:** התהליך צריך להתבצע תוך מספר שניות
4. **Alerts:** הגדר התראות לשגיאות חוזרות

## פתרון בעיות נפוצות

### מייל לא נשלח
- בדוק את `RESEND_API_KEY`
- ודא ש-`FROM_EMAIL` מאומת ב-Resend
- בדוק לוגים בקונסול ובמסד הנתונים

### תשובה איטית
- בדוק חיבור למסד הנתונים
- ודא שאין bottlenecks בשליחת המיילים

### שגיאות validation
- בדוק את מבנה ה-JSON שנשלח
- ודא שכל השדות הנדרשים קיימים
