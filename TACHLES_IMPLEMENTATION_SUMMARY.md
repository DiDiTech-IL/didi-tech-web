# Tachles Webhook Integration - Implementation Summary

## מה נוצר?

### 1. מסמך README מפורט לאפליקציה השנייה
- **קובץ:** `WEBHOOK_INTEGRATION_README.md`
- **תוכן:** מדריך מלא לחיבור ה-webhook עם כל הפרטים הטכניים

### 2. Webhook Endpoint
- **קובץ:** `app/api/webhooks/tachles/route.ts`
- **URL:** `POST /api/webhooks/tachles`
- **תכונות:**
  - אימות חתימה HMAC
  - טיפול באירועי domain.activated, domain.suspended, domain.cancelled
  - יצירת לקוח חדש במסד הנתונים
  - שליחת webhook חזרה לTachles עם פרטי התחברות

### 3. מודלים חדשים במסד הנתונים
- **קובץ:** `prisma/schema.prisma`
- **מודלים חדשים:**
  - `LeadSubmission` - מעקב אחר בקשות לקוחות
  - `Organization` - ארגונים (multi-tenant)
  - `Region` - אזורים בתוך ארגון
  - `OrganizationStatus` enum

### 4. קבצי עזר
- **קובץ:** `lib/auth-helpers.ts` - דוגמה לטיפול בהתחברות ראשונה
- **קובץ:** `scripts/test-webhook.ts` - סקריפט לבדיקת ה-webhook
- **קובץ:** `.env.tachles.example` - משתני סביבה נדרשים

## איך להשתמש?

### 1. הגדרת משתני סביבה
```bash
cp .env.tachles.example .env.local
# ערוך את הקובץ עם הערכים הנכונים
```

### 2. מיגרציית מסד נתונים
```bash
npx prisma db push
# או
npx prisma migrate dev --name add-tachles-models
```

### 3. בדיקת ה-webhook
```bash
npm run test-webhook
```

### 4. חיבור למערכת הhentication
- שלב את `lib/auth-helpers.ts` במערכת ההתחברות שלך
- וודא ששליחת `user.activated` webhook קורה בהתחברות ראשונה

## מה מצפה האפליקציה השנייה?

### Webhook URL
```
POST https://your-domain.com/api/webhooks/tachles
```

### Headers
```
Content-Type: application/json
x-tachles-signature: <HMAC_SHA256>
```

### Payload לדוגמה (domain.activated)
```json
{
  "event": "domain.activated",
  "leadId": "lead_abc123",
  "tachlesCustomerId": "customer_xyz789",
  "domainInfo": {
    "subdomain": "my-company",
    "organizationName": "My Company Ltd",
    "contactEmail": "admin@mycompany.com",
    "contactName": "John Doe",
    "contactPhone": "+972501234567",
    "subscriptionPlan": "ADVANCED"
  },
  "timestamp": "2025-07-14T10:30:00.000Z",
  "signature": "hmac_signature"
}
```

### תגובה צפויה מהאפליקציה השנייה
```json
{
  "received": true
}
```

## מה קורה אחרי התשלום?

1. **התשלום מתבצע** → לקוח מועבר לדף "תשלום בוצע"
2. **Webhook נשלח לאפליקציה שלכם** → יוצר לקוח חדש
3. **אפליקציה שלכם שולחת webhook חזרה** → פרטי התחברות + קישור לדומיין
4. **Tachles שולח מייל ללקוח** → עם פרטי התחברות וקישור
5. **לקוח נכנס לראשונה** → נשלח אישור activation חזרה לTachles

## מה עדיין צריך לעשות?

1. **להגדיר משתני סביבה** בprodction
2. **לשלב במערכת ההתחברות** הקיימת
3. **לבדוק ולתקן** את ה-webhook endpoints
4. **להגדיר retry mechanism** לwebhooks כושלים
5. **להוסיף monitoring** לבדיקת סטטוס webhooks
