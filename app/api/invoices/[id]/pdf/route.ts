"use server";
import { NextRequest, NextResponse } from 'next/server';
import { InvoiceService } from '@/lib/services/invoice-service';
import { auth } from '@clerk/nextjs/server';
import puppeteer from 'puppeteer';
import { Prisma } from '@prisma/client';

interface RouteParams {
  params: Promise<{ id: string }>;
}

type InvoiceWithRelations = Prisma.InvoiceGetPayload<{
  include: {
    client: true;
    product: true;
    items: true;
    payments: true;
    timeEntries: {
      include: {
        user: {
          select: {
            firstName: true;
            lastName: true;
          };
        };
      };
    };
  };
}>;

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const invoice = await InvoiceService.getInvoiceById(id);
    
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Check if PDF generation is requested
    const searchParams = new URL(request.url).searchParams;
    const format = searchParams.get('format');

    if (format === 'pdf') {
      // Generate actual PDF using Puppeteer
      const htmlContent = generateInvoiceHTML(invoice);
      
      let browser;
      try {
        browser = await puppeteer.launch({
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
        
        const pdfBuffer = await page.pdf({
          format: 'A4',
          printBackground: true,
          margin: {
            top: '1in',
            right: '0.75in',
            bottom: '1in',
            left: '0.75in'
          }
        });

        return new NextResponse(pdfBuffer, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="invoice-${invoice.invoiceNumber}.pdf"`,
          },
        });
      } finally {
        if (browser) {
          await browser.close();
        }
      }
    } else {
      // Return HTML for preview/printing
      const htmlContent = generateInvoiceHTML(invoice);
      
      return new NextResponse(htmlContent, {
        headers: {
          'Content-Type': 'text/html',
          'Content-Disposition': `inline; filename="invoice-${invoice.invoiceNumber}.html"`,
        },
      });
    }
  } catch (error) {
    console.error('Error generating invoice PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate invoice PDF' },
      { status: 500 }
    );
  }
}

function generateInvoiceHTML(invoice: InvoiceWithRelations): string {
  const currentDate = new Date().toLocaleDateString();
  const issueDate = invoice.createdAt; // Use createdAt as issue date
  const issueDateStr = new Date(issueDate).toLocaleDateString();
  const dueDateStr = new Date(invoice.dueDate).toLocaleDateString();
  
  return `
<!DOCTYPE html>
<html lang="he">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>חשבונית ${invoice.invoiceNumber}</title>
    <style>
        @media print {
            body { margin: 0; }
            .no-print { display: none; }
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.2;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            direction: rtl;
        }
        
        .header {
            display: flex;
            justify-content: space-between;
            align-items: start;
            margin-bottom: 20px;
            border-bottom: 2px solid #6366f1;
            padding-bottom: 10px;
        }
        
        .logo {
            font-size: 28px;
            font-weight: bold;
            color: #6366f1;
        }
        
        .invoice-info {
            text-align: right;
        }
        
        .invoice-number {
            font-size: 24px;
            font-weight: bold;
            color: #6366f1;
            margin-bottom: 5px;
        }
        
        .billing-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            margin-bottom: 40px;
        }
        
        .billing-section h3 {
            color: #6366f1;
            margin-bottom: 10px;
            font-size: 16px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
        }
        
        .items-table th {
            background-color: #6366f1;
            color: white;
            padding: 12px;
            text-align: right;
            font-weight: 600;
        }
        
        .items-table td {
            padding: 12px;
            border-bottom: 1px solid #e5e7eb;
        }
        
        .items-table tr:nth-child(even) {
            background-color: #f9fafb;
        }
        
        .totals {
            margin-left: auto;
            width: 300px;
        }
        
        .totals-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #e5e7eb;
        }
        
        .totals-row.total {
            font-weight: bold;
            font-size: 18px;
            color: #6366f1;
            border-bottom: 2px solid #6366f1;
            margin-top: 10px;
        }
        
        .footer {
            margin-top: 20px;
            padding-top: 10px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 14px;
        }
        
        .print-button {
            background-color: #6366f1;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 16px;
            margin-bottom: 20px;
        }
        
        .print-button:hover {
            background-color: #4f46e5;
        }
        
        .status-badge {
            display: inline-block;
            padding: 2px 6px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
        }
        
        .status-paid {
            background-color: #10b981;
            color: white;
        }
        
        .status-pending, .status-sent {
            background-color: #f59e0b;
            color: white;
        }
        
        .status-overdue {
            background-color: #ef4444;
            color: white;
        }
        
        .status-draft {
            background-color: #6b7280;
            color: white;
        }
    </style>
</head>
<body>
    <button class="print-button no-print" onclick="window.print()">🖨️ הדפס חשבונית</button>
    
    <div class="header">
        <div>
            <div class="logo">Tachles.dev</div>
            <div>Professional SaaS Solutions</div>
        </div>
        <div class="invoice-info">
            <div class="invoice-number">חשבונית</div>
            <div class="invoice-number">${invoice.invoiceNumber}</div>
            <div>Date: ${issueDateStr}</div>
            <div>Due: ${dueDateStr}</div>
            <div>
                <span class="status-badge status-${invoice.status.toLowerCase()}">
                    ${invoice.status}
                </span>
            </div>
        </div>
    </div>

    <div class="billing-info">
        <div class="billing-section">
            <h3>חשבונית עבור:</h3>
            <div><strong>${invoice.client.name}</strong></div>
            ${invoice.client.company ? `<div>${invoice.client.company}</div>` : ''}
            <div>${invoice.client.email}</div>
            ${invoice.client.address ? `<div>${invoice.client.address}</div>` : ''}
            ${invoice.client.city ? `<div>${invoice.client.city}, ${invoice.client.country || ''}</div>` : ''}
            ${invoice.client.postalCode ? `<div>${invoice.client.postalCode}</div>` : ''}
        </div>
        
        <div class="billing-section">
            <h3>מאת:</h3>
            <div><strong>תכל'ס.dev</strong></div>
            <div>בית תוכנה - פיתוח והדרכה</div>
            <div>support@tachles.dev</div>
            <div>עוסק פטור: 209133255</div>
        </div>
    </div>

    <div>
        <h3 style="color: #6366f1; margin-bottom: 15px;">${invoice.title}</h3>
        ${invoice.description ? `<p style="margin-bottom: 20px; color: #6b7280;">${invoice.description}</p>` : ''}
    </div>

    <table class="items-table">
        <thead>
            <tr>
                <th>תיאור</th>
                <th style="text-align: center;">כמות</th>
                <th style="text-align: right;">תדירות</th>
                <th style="text-align: right;">עלות</th>
            </tr>
        </thead>
        <tbody>
            ${invoice.items.map((item) => `
                <tr>
                    <td style="white-space: pre-line;">${item.description}</td>
                    <td style="text-align: center;">${Number(item.quantity).toLocaleString()}</td>
                    <td style="text-align: right;">₪${Number(item.rate).toLocaleString()}</td>
                    <td style="text-align: right;">₪${Number(item.amount).toLocaleString()}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>

    <div class="totals">
        <div class="totals-row">
            <span>סכום ביניים:</span>
            <span>₪${Number(invoice.subtotal).toLocaleString()}</span>
        </div>
        ${invoice.taxAmount && Number(invoice.taxAmount) > 0 ? `
            <div class="totals-row">
                <span>מע"מ (${Number(invoice.taxRate || 0)}%):</span>
                <span>₪${Number(invoice.taxAmount).toLocaleString()}</span>
            </div>
        ` : ''}
        <div class="totals-row total">
            <span>Total:</span>
            <span>₪${Number(invoice.total).toLocaleString()}</span>
        </div>
    </div>

    ${invoice.product ? `
        <div style="margin-top: 30px; padding: 15px; background-color: #f9fafb; border-radius: 8px;">
            <h4 style="margin: 0 0 10px 0; color: #6366f1;">Product: ${invoice.product.name}</h4>
            <p style="margin: 0; color: #6b7280; font-size: 14px;">${invoice.product.description || ''}</p>
        </div>
    ` : ''}

    <div class="footer">
        <p><strong>תנאי תשלום:</strong> יש לשלם את החשבונית בתוך 30 ימי עסקים מהמועד הרשום על החשבונית</p>
        <p><strong>תודה שבחרתם תכל'ס</strong></p>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p>
            מסמך נוצר ב-${currentDate} | 
            למידע נוסף ניתן ליצור קשר: support@tachles.dev
        </p>
    </div>
</body>
</html>`;
}
