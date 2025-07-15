# מערכת חשבוניות ותשלומים - הוראות שימוש

## סקירה כללית

המערכת עודכנה כך שאחרי תשלום מוצלח, המשתמש מועבר לדף חשבונית במקום ישירות לאפליקציה. זה מאפשר למשתמשים:

1. לראות פירוט מלא של התשלום
2. להדפיס או להוריד את החשבונית
3. לדעת שמייל עם החשבונית נשלח אליהם
4. לקבל עדכון שמייל נוסף יגיע כשהחשבון יהיה מוכן

## תהליך התשלום החדש

### 1. לפני התשלום
המשתמש ממלא את פרטיו ובוחר תוכנית תשלום כרגיל.

### 2. התשלום
- PayPlus מעבד את התשלום
- במקום הפנייה ישירות לאפליקציה, המשתמש מועבר ל:
  ```
  https://pay.tachles.dev/PRODUCT_NAME/payment-success?subdomain=SUBDOMAIN
  ```

### 3. דף ההצלחה
- האתר מחפש את החשבונית המתאימה במסד הנתונים
- מעביר אוטומטית לדף החשבונית:
  ```
  https://pay.tachles.dev/invoice/PAYMENT_REQUEST_UID
  ```

### 4. דף החשבונית
המשתמש רואה:
- ✅ הודעת הצלחה
- 📄 פרטי החשבונית המלאים
- 🖨️ כפתורי הדפסה והורדה
- 📧 אישור ששתי מיילים נשלחו:
  1. מייל עם החשבונית (מיידי)
  2. מייל עם פרטי הכניסה (כשהחשבון מוכן)

## מיילים שנשלחים

### מייל חשבונית (מיידי)
- נשלח ישירות אחרי התשלום המוצלח
- כולל פירוט מלא של התשלום
- מודיע שהחשבון בהכנה
- עיצוב עברי מקצועי

### מייל ברוכים הבאים (אחרי הגדרת החשבון)
- נשלח על ידי webhook של Tachles
- כולל פרטי כניסה לחשבון
- סיסמה זמנית
- הוראות אבטחה

## API Endpoints החדשים

### `POST /api/find-invoice`
מוצא חשבונית לפי מוצר ותת-דומיין:
```json
{
  "product": "product-name",
  "subdomain": "customer-subdomain"
}
```

**תגובה:**
```json
{
  "success": true,
  "invoiceId": "payment-request-uid",
  "subscriptionId": "subscription-id"
}
```

### `GET /pay/invoice/[invoiceId]`
מציג דף חשבונית עם כל הפרטים:
- פרטי לקוח
- פרטי מוצר ותוכנית
- סכום ופרטי תשלום
- מידע על מיילים שנשלחו

## קבצים שנוצרו/עודכנו

### דפים חדשים:
- `app/pay/payment-success/page.tsx` - דף הפניה לחשבונית
- `app/pay/invoice/[invoiceId]/page.tsx` - דף חשבונית (server)
- `app/pay/invoice/[invoiceId]/InvoicePage.tsx` - רכיב חשבונית (client)
- `app/pay/invoice/[invoiceId]/not-found.tsx` - דף שגיאה

### API חדש:
- `app/api/find-invoice/route.ts` - מציאת חשבונית

### שירותים עודכנו:
- `lib/email-service.ts` - הוספת שליחת מייל חשבונית
- `app/api/webhooks/payplus/route.ts` - הוספת שליחת מייל
- `app/pay/[productName]/actions.ts` - שינוי URL הצלחה
- `middleware.ts` - הוספת נתיבים ציבוריים

## הגדרות נדרשות

### משתני סביבה:
```env
RESEND_API_KEY=your_resend_api_key
FROM_EMAIL=your_verified_email@domain.com
```

### אמתו ב-Resend:
1. הירשמו ל-Resend
2. אמתו את הדומיין או הכתובת
3. קבלו API key
4. הוסיפו למשתני הסביבה

## בדיקות איכות

### בדיקת תהליך מלא:
1. ✅ תשלום מוצלח מעביר לדף payment-success
2. ✅ דף payment-success מוצא חשבונית ומעביר אליה
3. ✅ דף החשבונית מציג את כל הפרטים
4. ✅ מייל חשבונית נשלח ללקוח
5. ✅ מייל ברוכים הבאים נשלח כשהחשבון מוכן

### בדיקת שגיאות:
1. ✅ חשבונית לא נמצאה → דף not-found
2. ✅ שגיאה בשליחת מייל → התהליך ממשיך עם לוג
3. ✅ פרמטרים חסרים → הודעת שגיאה מתאימה

## ניטור ותחזוקה

### לוגים לבדיקה:
```bash
# PayPlus webhook logs
[PAYPLUS] Payment processed successfully
[EMAIL] Invoice email sent to customer@example.com

# Tachles webhook logs  
[TACHLES_PROCESS] Domain activation completed successfully
[EMAIL] Welcome email sent to customer@example.com
```

### מדדים לניטור:
- זמן תגובה לדף חשבונית
- אחוז הצלחה בשליחת מיילים
- מספר גישות לדף חשבונית
- שגיאות במציאת חשבוניות

## פתרון בעיות נפוצות

### לקוח לא מקבל מייל חשבונית:
1. בדקו לוגים בקונסול
2. ודאו ש-Resend מוגדר נכון
3. בדקו spam/junk folder
4. ודאו שהאימייל תקין

### דף חשבונית לא נטען:
1. בדקו שה-payment_request_uid תקין
2. ודאו שהמנוי קיים במסד הנתונים
3. בדקו שהתשלום הושלם בהצלחה

### הפניה לא עובדת:
1. בדקו שהפרמטרים נשלחים נכון
2. ודאו שמידע המוצר ותת-הדומיין נכונים
3. בדקו לוגים של find-invoice API
