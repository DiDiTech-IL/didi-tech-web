import { Resend } from 'resend';
import { env } from '@/data/env/server';

const resend = new Resend(env.RESEND_API_KEY);

interface WelcomeEmailData {
  customerName: string;
  subdomain: string;
  domainUrl: string;
  temporaryPassword: string;
  organizationName: string;
  contactEmail: string;
}

export async function sendWelcomeEmail(data: WelcomeEmailData): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    console.log(`[EMAIL] Sending welcome email to ${data.contactEmail}`);
    
    const { data: emailResult, error } = await resend.emails.send({
      from: env.FROM_EMAIL,
      to: [data.contactEmail],
      subject: `ברוכים הבאים - החשבון שלכם ב-${data.organizationName} מוכן!`,
      html: generateWelcomeEmailHTML(data),
    });

    if (error) {
      console.error('[EMAIL] Failed to send welcome email:', error);
      return { success: false, error: error.message };
    }

    console.log(`[EMAIL] Welcome email sent successfully. Message ID: ${emailResult?.id}`);
    return { success: true, messageId: emailResult?.id };
  } catch (error) {
    console.error('[EMAIL] Exception while sending welcome email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

function generateWelcomeEmailHTML(data: WelcomeEmailData): string {
  return `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ברוכים הבאים</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
            direction: rtl;
        }
        .container {
            background-color: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            color: #2563eb;
            margin-bottom: 30px;
        }
        .welcome-section {
            background-color: #eff6ff;
            padding: 20px;
            border-radius: 6px;
            margin: 20px 0;
        }
        .credentials {
            background-color: #f8fafc;
            padding: 20px;
            border-radius: 6px;
            border-right: 4px solid #2563eb;
            margin: 20px 0;
        }
        .button {
            display: inline-block;
            background-color: #2563eb;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
            margin: 20px 0;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 14px;
            color: #6b7280;
        }
        .highlight {
            background-color: #fef3c7;
            padding: 2px 6px;
            border-radius: 3px;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 ברוכים הבאים!</h1>
            <h2>החשבון שלכם מוכן לשימוש</h2>
        </div>

        <div class="welcome-section">
            <h3>שלום ${data.customerName},</h3>
            <p>אנחנו שמחים להודיע שהחשבון של <strong>${data.organizationName}</strong> הוגדר בהצלחה במערכת!</p>
        </div>

        <div class="credentials">
            <h4>פרטי הכניסה שלכם:</h4>
            <ul>
                <li><strong>כתובת האתר:</strong> <a href="${data.domainUrl}" target="_blank">${data.domainUrl}</a></li>
                <li><strong>תת-דומיין:</strong> <span class="highlight">${data.subdomain}</span></li>
                <li><strong>אימייל:</strong> ${data.contactEmail}</li>
                <li><strong>סיסמה זמנית:</strong> <span class="highlight">${data.temporaryPassword}</span></li>
            </ul>
        </div>

        <div style="text-align: center;">
            <a href="${data.domainUrl}" class="button">כניסה למערכת</a>
        </div>

        <div style="background-color: #fef2f2; padding: 15px; border-radius: 6px; border-right: 4px solid #ef4444; margin: 20px 0;">
            <strong>חשוב:</strong>
            <ul>
                <li>אנא החליפו את הסיסמה הזמנית בכניסה הראשונה</li>
                <li>שמרו על פרטי הכניסה במקום בטוח</li>
                <li>אל תשתפו את פרטי הכניסה עם אחרים</li>
            </ul>
        </div>

        <p>אם יש לכם שאלות או זקוקים לעזרה, אנא צרו קשר איתנו.</p>

        <div class="footer">
            <p>בברכה,<br>צוות התמיכה</p>
            <p><small>אימייל זה נשלח אוטומטית ממערכת ניהול הלקוחות שלנו</small></p>
        </div>
    </div>
</body>
</html>
  `;
}

export async function logEmailEvent(
  type: 'sent' | 'failed',
  email: string,
  details: Record<string, unknown>,
  error?: string
): Promise<void> {
  try {
    console.log(`[EMAIL_LOG] ${type.toUpperCase()}: ${email}`, {
      timestamp: new Date().toISOString(),
      details,
      error
    });
  } catch (logError) {
    console.error('[EMAIL_LOG] Failed to log email event:', logError);
  }
}

interface InvoiceEmailData {
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  companyName: string;
  invoiceTotal: number;
  currency: string;
  dueDate: Date;
  invoiceTitle: string;
  invoiceDescription?: string;
}

export async function sendInvoiceEmail(
  data: InvoiceEmailData, 
  pdfBuffer: Buffer,
  language: 'he' | 'en' = 'he'
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    console.log(`[EMAIL] Sending invoice email to ${data.clientEmail}`);
    
    const subject = language === 'he' 
      ? `חשבונית ${data.invoiceNumber} מ-${data.companyName}`
      : `Invoice ${data.invoiceNumber} from ${data.companyName}`;
    
    const { data: emailResult, error } = await resend.emails.send({
      from: env.FROM_EMAIL,
      to: [data.clientEmail],
      subject: subject,
      html: generateInvoiceEmailHTML(data, language),
      attachments: [
        {
          filename: `invoice-${data.invoiceNumber}.pdf`,
          content: pdfBuffer,
        },
      ],
    });

    if (error) {
      console.error('[EMAIL] Failed to send invoice email:', error);
      return { success: false, error: error.message };
    }

    console.log(`[EMAIL] Invoice email sent successfully. Message ID: ${emailResult?.id}`);
    return { success: true, messageId: emailResult?.id };
  } catch (error) {
    console.error('[EMAIL] Exception while sending invoice email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

function generateInvoiceEmailHTML(data: InvoiceEmailData, language: 'he' | 'en' = 'he'): string {
  const isHebrew = language === 'he';
  const dir = isHebrew ? 'rtl' : 'ltr';
  const dueDateStr = data.dueDate.toLocaleDateString(isHebrew ? 'he-IL' : 'en-US');
  
  if (isHebrew) {
    return `
<!DOCTYPE html>
<html dir="${dir}" lang="he">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>חשבונית ${data.invoiceNumber}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
            direction: rtl;
        }
        
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #6366f1;
        }
        
        .logo {
            font-size: 28px;
            font-weight: bold;
            color: #6366f1;
            margin-bottom: 10px;
        }
        
        .subtitle {
            color: #666;
            font-size: 16px;
        }
        
        .content {
            margin-bottom: 30px;
        }
        
        .invoice-details {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        
        .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            padding: 5px 0;
        }
        
        .detail-label {
            font-weight: bold;
            color: #6366f1;
        }
        
        .amount {
            font-size: 24px;
            font-weight: bold;
            color: #059669;
            text-align: center;
            margin: 20px 0;
        }
        
        .cta-button {
            display: inline-block;
            background-color: #6366f1;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
            text-align: center;
            margin: 20px 0;
        }
        
        .footer {
            text-align: center;
            color: #666;
            font-size: 14px;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
        }
        
        .contact-info {
            background-color: #eff6ff;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">תכל'ס.dev</div>
            <div class="subtitle">פתרונות SaaS מקצועיים</div>
        </div>
        
        <div class="content">
            <h2>שלום ${data.clientName},</h2>
            
            <p>מצורפת חשבונית חדשה עבור השירותים שלנו.</p>
            
            <div class="invoice-details">
                <div class="detail-row">
                    <span class="detail-label">מספר חשבונית:</span>
                    <span>${data.invoiceNumber}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">תיאור:</span>
                    <span>${data.invoiceTitle}</span>
                </div>
                ${data.invoiceDescription ? `
                <div class="detail-row">
                    <span class="detail-label">פרטים:</span>
                    <span>${data.invoiceDescription}</span>
                </div>
                ` : ''}
                <div class="detail-row">
                    <span class="detail-label">תאריך פירעון:</span>
                    <span>${dueDateStr}</span>
                </div>
            </div>
            
            <div class="amount">
                סכום לתשלום: ₪${data.invoiceTotal.toLocaleString()}
            </div>
            
            <p>החשבונית מצורפת כקובץ PDF. אנא שמרו אותה לרשומותיכם.</p>
            
            ${data.invoiceDescription ? `<p><strong>תיאור השירות:</strong><br>${data.invoiceDescription}</p>` : ''}
            
            <div class="contact-info">
                <strong>יש שאלות?</strong><br>
                אנחנו כאן לעזור! אתם מוזמנים ליצור קשר איתנו:<br>
                📧 support@tachles.dev<br>
                🌐 tachles.dev
            </div>
        </div>
        
        <div class="footer">
            <p><strong>תנאי תשלום:</strong> התשלום יעשה תוך 30 יום מתאריך החשבונית.</p>
            <p>תודה רבה על הבחירה בשירותים שלנו!</p>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="font-size: 12px; color: #999;">
                © 2025 תכל'ס.dev - פתרונות SaaS מקצועיים<br>
                אימייל זה נשלח אוטומטית ממערכת החשבוניות שלנו.
            </p>
        </div>
    </div>
</body>
</html>`;
  } else {
    // English version
    return `
<!DOCTYPE html>
<html dir="${dir}" lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice ${data.invoiceNumber}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #6366f1;
        }
        
        .logo {
            font-size: 28px;
            font-weight: bold;
            color: #6366f1;
            margin-bottom: 10px;
        }
        
        .subtitle {
            color: #666;
            font-size: 16px;
        }
        
        .content {
            margin-bottom: 30px;
        }
        
        .invoice-details {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        
        .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            padding: 5px 0;
        }
        
        .detail-label {
            font-weight: bold;
            color: #6366f1;
        }
        
        .amount {
            font-size: 24px;
            font-weight: bold;
            color: #059669;
            text-align: center;
            margin: 20px 0;
        }
        
        .footer {
            text-align: center;
            color: #666;
            font-size: 14px;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
        }
        
        .contact-info {
            background-color: #eff6ff;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">Tachles.dev</div>
            <div class="subtitle">Professional SaaS Solutions</div>
        </div>
        
        <div class="content">
            <h2>Hello ${data.clientName},</h2>
            
            <p>Please find attached your new invoice for our services.</p>
            
            <div class="invoice-details">
                <div class="detail-row">
                    <span class="detail-label">Invoice Number:</span>
                    <span>${data.invoiceNumber}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Description:</span>
                    <span>${data.invoiceTitle}</span>
                </div>
                ${data.invoiceDescription ? `
                <div class="detail-row">
                    <span class="detail-label">Details:</span>
                    <span>${data.invoiceDescription}</span>
                </div>
                ` : ''}
                <div class="detail-row">
                    <span class="detail-label">Due Date:</span>
                    <span>${dueDateStr}</span>
                </div>
            </div>
            
            <div class="amount">
                Amount Due: $${data.invoiceTotal.toLocaleString()}
            </div>
            
            <p>The invoice is attached as a PDF file. Please keep it for your records.</p>
            
            ${data.invoiceDescription ? `<p><strong>Service Description:</strong><br>${data.invoiceDescription}</p>` : ''}
            
            <div class="contact-info">
                <strong>Questions?</strong><br>
                We're here to help! Feel free to contact us:<br>
                📧 support@tachles.dev<br>
                🌐 tachles.dev
            </div>
        </div>
        
        <div class="footer">
            <p><strong>Payment Terms:</strong> Payment is due within 30 days of invoice date.</p>
            <p>Thank you for choosing our services!</p>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="font-size: 12px; color: #999;">
                © 2025 Tachles.dev - Professional SaaS Solutions<br>
                This email was sent automatically from our invoicing system.
            </p>
        </div>
    </div>
</body>
</html>`;
  }
}
