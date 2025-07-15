import jsPDF from 'jspdf';

export interface InvoiceData {
  id: string;
  invoiceNumber: string;
  title: string;
  description?: string;
  createdAt: Date | string;
  issueDate?: Date | string;
  dueDate: Date | string;
  status: string;
  subtotal: number;
  taxRate?: number;
  taxAmount?: number;
  total: number;
  currency?: string;
  client: {
    id: string;
    name: string;
    email: string;
    company?: string;
    address?: string;
    city?: string;
    country?: string;
    postalCode?: string;
  };
  product?: {
    id: string;
    name: string;
    description?: string;
  };
  items: Array<{
    id?: string;
    description: string;
    quantity: number;
    rate: number;
    amount: number;
  }>;
}

export function generateInvoicePDF(invoice: InvoiceData): Blob {
  try {
    const doc = new jsPDF();
    
    // Set up page dimensions and margins
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 12;
    let currentY = margin;
    
    // Helper function to add text with automatic wrapping
    const addText = (text: string, x: number, y: number, options: {
      fontSize?: number;
      bold?: boolean;
      center?: boolean;
    } = {}) => {
      const fontSize = options.fontSize || 12;
      const isBold = options.bold || false;
      const isCenter = options.center || false;
      
      doc.setFontSize(fontSize);
      if (isBold) {
        doc.setFont('helvetica', 'bold');
      } else {
        doc.setFont('helvetica', 'normal');
      }
      
      if (isCenter) {
        const textWidth = doc.getTextWidth(text);
        x = (pageWidth - textWidth) / 2;
      }
      
      doc.text(text, x, y);
      return y + fontSize * 0.35; // Return next Y position
    };

    // Header
    addText('תכלס.Dev', margin, currentY, { fontSize: 24, bold: true });
    currentY = addText('בית תוכנה - פיתוח והדרכה', margin, currentY + 25, { fontSize: 12 });
    
    // Invoice title and number (right aligned)
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    const invoiceTitle = 'חשבונית';
    const titleWidth = doc.getTextWidth(invoiceTitle);
    doc.text(invoiceTitle, pageWidth - margin - titleWidth, margin);
    
    doc.setFontSize(16);
    const numberWidth = doc.getTextWidth(invoice.invoiceNumber);
    doc.text(invoice.invoiceNumber, pageWidth - margin - numberWidth, margin + 20);
    
    currentY += 20;
    
    // Invoice details
    const issueDate = invoice.issueDate || invoice.createdAt;
    const dueDateStr = new Date(invoice.dueDate).toLocaleDateString();
    const issueDateStr = new Date(issueDate).toLocaleDateString();
    
    addText(`תאריך: ${issueDateStr}`, pageWidth - 80, currentY);
    currentY = addText(`שולם: ${dueDateStr}`, pageWidth - 80, currentY + 15);
    
    currentY += 12;
    
    // Bill To section
    addText('עבור:', margin, currentY, { fontSize: 14, bold: true });
    currentY += 12;
    currentY = addText(invoice.client.name, margin, currentY, { bold: true });
    if (invoice.client.company) {
      currentY = addText(invoice.client.company, margin, currentY + 15);
    }
    currentY = addText(invoice.client.email, margin, currentY + 15);
    if (invoice.client.address) {
      currentY = addText(invoice.client.address, margin, currentY + 15);
    }
    
    // From section (right side)
    const fromX = pageWidth / 2 + 12;
    let fromY = currentY - (invoice.client.company ? 60 : 45);
    addText('מאת:', fromX, fromY, { fontSize: 14, bold: true });
    fromY += 20;
    fromY = addText('תכלס.dev', fromX, fromY, { bold: true });
    fromY = addText('בית תוכנה - פיתוח והדרכה', fromX, fromY + 15);
    fromY = addText('support@tachles.dev', fromX, fromY + 15);
    
    currentY += 40;
    
    // Invoice title and description
    if (invoice.title) {
      currentY = addText(invoice.title, margin, currentY, { fontSize: 16, bold: true });
      currentY += 10;
    }
    if (invoice.description) {
      currentY = addText(invoice.description, margin, currentY) + 20;
    }
    
    // Items table header
    const colWidths = [80, 30, 30, 30]; // Description, Qty, Rate, Amount
    const colPositions = [
      margin, 
      margin + colWidths[0], 
      margin + colWidths[0] + colWidths[1], 
      margin + colWidths[0] + colWidths[1] + colWidths[2]
    ];
    
    // Table header background
    doc.setFillColor(99, 102, 241); // Purple background
    doc.rect(margin, currentY - 5, pageWidth - 2 * margin, 15, 'F');
    
    // Table header text
    doc.setTextColor(255, 255, 255); // White text
    addText('תיאור', colPositions[0], currentY + 5, { bold: true });
    addText('כמות', colPositions[1], currentY + 5, { bold: true });
    addText('תדירות', colPositions[2], currentY + 5, { bold: true });
    addText('סכום', colPositions[3], currentY + 5, { bold: true });
    
    currentY += 20;
    doc.setTextColor(0, 0, 0); // Reset to black text
    
    // Table rows
    if (invoice.items && invoice.items.length > 0) {
      invoice.items.forEach((item, index) => {
        if (index % 2 === 0) {
          doc.setFillColor(249, 250, 251); // Light gray background for even rows
          doc.rect(margin, currentY - 5, pageWidth - 2 * margin, 15, 'F');
        }
        
        // Wrap description text if too long
        const maxDescWidth = colWidths[0] - 5;
        const descLines = doc.splitTextToSize(item.description || '', maxDescWidth);
        const lineHeight = 15;
        
        descLines.forEach((line: string, lineIndex: number) => {
          addText(line, colPositions[0], currentY + (lineIndex * lineHeight));
        });
        
        if (descLines.length === 1) {
          addText((item.quantity || 0).toString(), colPositions[1], currentY);
          addText(`$${(item.rate || 0).toLocaleString()}`, colPositions[2], currentY);
          addText(`$${(item.amount || 0).toLocaleString()}`, colPositions[3], currentY);
        } else {
          // Center quantity, rate, amount vertically
          const middleY = currentY + ((descLines.length - 1) * lineHeight) / 2;
          addText((item.quantity || 0).toString(), colPositions[1], middleY);
          addText(`$${(item.rate || 0).toLocaleString()}`, colPositions[2], middleY);
          addText(`$${(item.amount || 0).toLocaleString()}`, colPositions[3], middleY);
        }
        
        currentY += Math.max(15, descLines.length * lineHeight);
      });
    }
    
    currentY += 8;
    
    // Totals section (right aligned)
    const totalsX = pageWidth - 100;
    currentY = addText(`סכום ביניים: ₪${(invoice.subtotal || 0).toLocaleString()}`, totalsX, currentY);
    
    if (invoice.taxAmount && Number(invoice.taxAmount) > 0) {
      currentY = addText(`מע"מ (${invoice.taxRate || 0}%): ₪${Number(invoice.taxAmount).toLocaleString()}`, totalsX, currentY + 15);
    }
    
    // Total with underline
    doc.setLineWidth(1);
    doc.line(totalsX, currentY + 8, pageWidth - margin, currentY + 8);
    currentY = addText(`סה"כ: ₪${(invoice.total || 0).toLocaleString()}`, totalsX, currentY + 30, { fontSize: 16, bold: true });
    
    // Product info if available
    if (invoice.product) {
      currentY += 30;
      doc.setFillColor(249, 250, 251);
      doc.rect(margin, currentY - 5, pageWidth - 2 * margin, 25, 'F');
      currentY = addText(`מוצר: ${invoice.product.name}`, margin + 5, currentY + 10, { bold: true });
      if (invoice.product.description) {
        currentY = addText(invoice.product.description, margin + 5, currentY + 15, { fontSize: 10 });
      }
    }
    
    // Footer
    currentY = doc.internal.pageSize.getHeight() - 40;
    doc.setLineWidth(0.5);
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 15;
    addText('Payment Terms: Payment is due within 30 days of invoice date.', margin, currentY, { fontSize: 10 });
    currentY = addText('Thank you for your business!', margin, currentY + 12, { fontSize: 10, bold: true });
    
    addText(`Generated on ${new Date().toLocaleDateString()} | For questions: support@tachles.dev`, 
      margin, currentY + 15, { fontSize: 8, center: true });
    
    // Return as blob
    return doc.output('blob');
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF. Please check the console for details.');
  }
}

export function downloadInvoicePDF(invoice: InvoiceData, filename?: string) {
  try {
    const blob = generateInvoicePDF(invoice);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `invoice-${invoice.invoiceNumber}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error('Error downloading PDF:', error);
    throw error;
  }
}

// Alternative PDF generation using canvas (fallback)
export async function generateInvoicePDFCanvas(invoice: InvoiceData): Promise<Blob> {
  return new Promise((resolve, reject) => {
    try {
      // Create a temporary HTML element for rendering
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '0';
      tempDiv.style.width = '800px';
      tempDiv.style.padding = '40px';
      tempDiv.style.fontFamily = 'Arial, sans-serif';
      tempDiv.style.fontSize = '14px';
      tempDiv.style.lineHeight = '1.5';
      tempDiv.style.backgroundColor = 'white';
      
      const issueDate = invoice.issueDate || invoice.createdAt;
      const issueDateStr = new Date(issueDate).toLocaleDateString();
      const dueDateStr = new Date(invoice.dueDate).toLocaleDateString();
      
      tempDiv.innerHTML = `
        <div style="max-width: 800px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 40px; border-bottom: 2px solid #6366f1; padding-bottom: 20px;">
            <div>
              <div style="font-size: 28px; font-weight: bold; color: #6366f1;">TACHLES.DEV</div>
              <div>Professional SaaS Solutions</div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 24px; font-weight: bold; color: #6366f1;">INVOICE</div>
              <div style="font-size: 16px; font-weight: bold;">${invoice.invoiceNumber}</div>
              <div>Date: ${issueDateStr}</div>
              <div>Due: ${dueDateStr}</div>
              <div>Status: ${invoice.status}</div>
            </div>
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px;">
            <div>
              <h3 style="color: #6366f1; margin-bottom: 10px;">Bill To</h3>
              <div style="font-weight: bold;">${invoice.client.name}</div>
              ${invoice.client.company ? `<div>${invoice.client.company}</div>` : ''}
              <div>${invoice.client.email}</div>
              ${invoice.client.address ? `<div>${invoice.client.address}</div>` : ''}
            </div>
            <div>
              <h3 style="color: #6366f1; margin-bottom: 10px;">From</h3>
              <div style="font-weight: bold;">Tachles.dev</div>
              <div>SaaS Development & Solutions</div>
              <div>contact@tachles.dev</div>
            </div>
          </div>
          
          <div style="margin-bottom: 30px;">
            <h3 style="color: #6366f1;">${invoice.title}</h3>
            ${invoice.description ? `<p>${invoice.description}</p>` : ''}
          </div>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
            <thead>
              <tr style="background-color: #6366f1; color: white;">
                <th style="padding: 12px; text-align: left;">Description</th>
                <th style="padding: 12px; text-align: center;">Qty</th>
                <th style="padding: 12px; text-align: right;">Rate</th>
                <th style="padding: 12px; text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.items.map((item, index) => `
                <tr style="${index % 2 === 0 ? 'background-color: #f9fafb;' : ''}">
                  <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.description}</td>
                  <td style="padding: 12px; text-align: center; border-bottom: 1px solid #e5e7eb;">${item.quantity}</td>
                  <td style="padding: 12px; text-align: right; border-bottom: 1px solid #e5e7eb;">$${item.rate.toLocaleString()}</td>
                  <td style="padding: 12px; text-align: right; border-bottom: 1px solid #e5e7eb;">$${item.amount.toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div style="margin-left: auto; width: 300px;">
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
              <span>Subtotal:</span>
              <span>$${invoice.subtotal.toLocaleString()}</span>
            </div>
            ${invoice.taxAmount && Number(invoice.taxAmount) > 0 ? `
              <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                <span>Tax (${invoice.taxRate || 0}%):</span>
                <span>$${Number(invoice.taxAmount).toLocaleString()}</span>
              </div>
            ` : ''}
            <div style="display: flex; justify-content: space-between; padding: 8px 0; font-weight: bold; font-size: 18px; color: #6366f1; border-bottom: 2px solid #6366f1; margin-top: 10px;">
              <span>Total:</span>
              <span>$${invoice.total.toLocaleString()}</span>
            </div>
          </div>
          
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px;">
            <p><strong>Payment Terms:</strong> Payment is due within 30 days of invoice date.</p>
            <p><strong>Thank you for your business!</strong></p>
            <p>Generated on ${new Date().toLocaleDateString()} | For questions: support@tachles.dev</p>
          </div>
        </div>
      `;
      
      document.body.appendChild(tempDiv);
      
      // Use html2canvas to convert to canvas, then to PDF
      import('html2canvas').then(html2canvas => {
        html2canvas.default(tempDiv, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: 'white'
        }).then(canvas => {
          document.body.removeChild(tempDiv);
          
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF();
          const imgWidth = 210;
          const pageHeight = 295;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          let heightLeft = imgHeight;
          
          let position = 0;
          
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
          
          while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
          }
          
          resolve(pdf.output('blob'));
        }).catch(reject);
      }).catch(reject);
    } catch (error) {
      reject(error);
    }
  });
}

export function generateInvoicePDFHebrew(invoice: InvoiceData): Blob {
  try {
    const doc = new jsPDF();
    
    // Set up page dimensions and margins
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let currentY = margin;
    
    // Helper function to add Hebrew text
    const addHebrewText = (text: string, x: number, y: number, options: {
      fontSize?: number;
      bold?: boolean;
      center?: boolean;
      align?: 'right' | 'left' | 'center';
    } = {}) => {
      const fontSize = options.fontSize || 12;
      const isBold = options.bold || false;
      const align = options.align || 'right';
      
      doc.setFontSize(fontSize);
      if (isBold) {
        doc.setFont('helvetica', 'bold');
      } else {
        doc.setFont('helvetica', 'normal');
      }
      
      if (options.center) {
        const textWidth = doc.getTextWidth(text);
        x = (pageWidth - textWidth) / 2;
      } else if (align === 'right') {
        const textWidth = doc.getTextWidth(text);
        x = pageWidth - margin - textWidth;
      }
      
      doc.text(text, x, y);
      return y + fontSize * 0.35;
    };

    // Header (Hebrew)
    addHebrewText('תכל\'ס.DEV', margin, currentY, { fontSize: 24, bold: true, align: 'left' });
    currentY = addHebrewText('פתרונות SaaS מקצועיים', margin, currentY + 25, { fontSize: 12, align: 'left' });
    
    // Invoice title and number (Hebrew)
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    const invoiceTitle = 'חשבונית';
    const titleWidth = doc.getTextWidth(invoiceTitle);
    doc.text(invoiceTitle, pageWidth - margin - titleWidth, margin);
    
    doc.setFontSize(16);
    const numberWidth = doc.getTextWidth(invoice.invoiceNumber);
    doc.text(invoice.invoiceNumber, pageWidth - margin - numberWidth, margin + 20);
    
    currentY += 40;
    
    // Invoice details (Hebrew)
    const issueDate = invoice.issueDate || invoice.createdAt;
    const dueDateStr = new Date(invoice.dueDate).toLocaleDateString('he-IL');
    const issueDateStr = new Date(issueDate).toLocaleDateString('he-IL');
    
    addHebrewText(`תאריך: ${issueDateStr}`, pageWidth - 80, currentY);
    currentY = addHebrewText(`תאריך פירעון: ${dueDateStr}`, pageWidth - 80, currentY + 15);
    currentY = addHebrewText(`סטטוס: ${getHebrewStatus(invoice.status)}`, pageWidth - 80, currentY + 15);
    
    currentY += 20;
    
    // Bill To section (Hebrew)
    addHebrewText('חשבונית ל:', pageWidth - margin, currentY, { fontSize: 14, bold: true });
    currentY += 20;
    currentY = addHebrewText(invoice.client.name, pageWidth - margin, currentY, { bold: true });
    if (invoice.client.company) {
      currentY = addHebrewText(invoice.client.company, pageWidth - margin, currentY + 15);
    }
    currentY = addHebrewText(invoice.client.email, pageWidth - margin, currentY + 15);
    if (invoice.client.address) {
      currentY = addHebrewText(invoice.client.address, pageWidth - margin, currentY + 15);
    }
    
    // From section (Hebrew, left side)
    const fromX = margin;
    let fromY = currentY - (invoice.client.company ? 60 : 45);
    addHebrewText('מ:', fromX, fromY, { fontSize: 14, bold: true, align: 'left' });
    fromY += 20;
    fromY = addHebrewText('תכל\'ס.dev', fromX, fromY, { bold: true, align: 'left' });
    fromY = addHebrewText('פיתוח ופתרונות SaaS', fromX, fromY + 15, { align: 'left' });
    fromY = addHebrewText('contact@tachles.dev', fromX, fromY + 15, { align: 'left' });
    
    currentY += 40;
    
    // Invoice title and description (Hebrew)
    if (invoice.title) {
      currentY = addHebrewText(invoice.title, pageWidth - margin, currentY, { fontSize: 16, bold: true });
      currentY += 10;
    }
    if (invoice.description) {
      currentY = addHebrewText(invoice.description, pageWidth - margin, currentY) + 20;
    }
    
    // Items table header (Hebrew)
    const colWidths = [80, 30, 30, 30];
    const colPositions = [
      pageWidth - margin - colWidths[0], // Description (rightmost)
      pageWidth - margin - colWidths[0] - colWidths[1], // Quantity
      pageWidth - margin - colWidths[0] - colWidths[1] - colWidths[2], // Rate
      margin // Amount (leftmost)
    ];
    
    // Table header background
    doc.setFillColor(99, 102, 241);
    doc.rect(margin, currentY - 5, pageWidth - 2 * margin, 15, 'F');
    
    // Table header text (Hebrew)
    doc.setTextColor(255, 255, 255);
    addHebrewText('תיאור', colPositions[0], currentY + 5, { bold: true, align: 'right' });
    addHebrewText('כמות', colPositions[1], currentY + 5, { bold: true, align: 'center' });
    addHebrewText('מחיר', colPositions[2], currentY + 5, { bold: true, align: 'center' });
    addHebrewText('סכום', colPositions[3], currentY + 5, { bold: true, align: 'left' });
    
    currentY += 20;
    doc.setTextColor(0, 0, 0);
    
    // Table rows (Hebrew)
    if (invoice.items && invoice.items.length > 0) {
      invoice.items.forEach((item, index) => {
        if (index % 2 === 0) {
          doc.setFillColor(249, 250, 251);
          doc.rect(margin, currentY - 5, pageWidth - 2 * margin, 15, 'F');
        }
        
        // Description (right-aligned Hebrew)
        const maxDescWidth = colWidths[0] - 5;
        const descLines = doc.splitTextToSize(item.description || '', maxDescWidth);
        const lineHeight = 15;
        
        descLines.forEach((line: string, lineIndex: number) => {
          const lineX = colPositions[0] + maxDescWidth - doc.getTextWidth(line);
          doc.text(line, lineX, currentY + (lineIndex * lineHeight));
        });
        
        if (descLines.length === 1) {
          addHebrewText((item.quantity || 0).toString(), colPositions[1] + 15, currentY, { align: 'center' });
          addHebrewText(`₪${(item.rate || 0).toLocaleString()}`, colPositions[2] + 15, currentY, { align: 'center' });
          addHebrewText(`₪${(item.amount || 0).toLocaleString()}`, colPositions[3], currentY, { align: 'left' });
        } else {
          const middleY = currentY + ((descLines.length - 1) * lineHeight) / 2;
          addHebrewText((item.quantity || 0).toString(), colPositions[1] + 15, middleY, { align: 'center' });
          addHebrewText(`₪${(item.rate || 0).toLocaleString()}`, colPositions[2] + 15, middleY, { align: 'center' });
          addHebrewText(`₪${(item.amount || 0).toLocaleString()}`, colPositions[3], middleY, { align: 'left' });
        }
        
        currentY += Math.max(15, descLines.length * lineHeight);
      });
    }
    
    currentY += 20;
    
    // Totals section (Hebrew, left aligned)
    const totalsX = margin;
    currentY = addHebrewText(`סכום משנה: ₪${(invoice.subtotal || 0).toLocaleString()}`, totalsX, currentY, { align: 'left' });
    
    if (invoice.taxAmount && Number(invoice.taxAmount) > 0) {
      currentY = addHebrewText(`מע״מ (${invoice.taxRate || 17}%): ₪${Number(invoice.taxAmount).toLocaleString()}`, totalsX, currentY + 15, { align: 'left' });
    }
    
    // Total with underline
    doc.setLineWidth(1);
    doc.line(margin, currentY + 20, margin + 100, currentY + 20);
    currentY = addHebrewText(`סה״כ: ₪${(invoice.total || 0).toLocaleString()}`, totalsX, currentY + 30, { fontSize: 16, bold: true, align: 'left' });
    
    // Product info if available (Hebrew)
    if (invoice.product) {
      currentY += 30;
      doc.setFillColor(249, 250, 251);
      doc.rect(margin, currentY - 5, pageWidth - 2 * margin, 25, 'F');
      currentY = addHebrewText(`מוצר: ${invoice.product.name}`, pageWidth - margin - 5, currentY + 10, { bold: true });
      if (invoice.product.description) {
        currentY = addHebrewText(invoice.product.description, pageWidth - margin - 5, currentY + 15, { fontSize: 10 });
      }
    }
    
    // Footer (Hebrew)
    currentY = doc.internal.pageSize.getHeight() - 40;
    doc.setLineWidth(0.5);
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 15;
    addHebrewText('תנאי תשלום: התשלום יעשה תוך 30 יום מתאריך החשבונית.', pageWidth - margin, currentY, { fontSize: 10 });
    currentY = addHebrewText('תודה על העסק שלכם!', pageWidth - margin, currentY + 12, { fontSize: 10, bold: true });
    
    addHebrewText(`נוצר בתאריך ${new Date().toLocaleDateString('he-IL')} | לפניות: support@tachles.dev`, 
      0, currentY + 15, { fontSize: 8, center: true });
    
    return doc.output('blob');
  } catch (error) {
    console.error('Error generating Hebrew PDF:', error);
    throw new Error('Failed to generate Hebrew PDF. Please check the console for details.');
  }
}

function getHebrewStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'DRAFT': 'טיוטה',
    'SENT': 'נשלח',
    'PAID': 'שולם',
    'OVERDUE': 'באיחור',
    'CANCELLED': 'בוטל'
  };
  return statusMap[status] || status;
}

export function downloadInvoicePDFHebrew(invoice: InvoiceData, filename?: string) {
  try {
    const blob = generateInvoicePDFHebrew(invoice);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `חשבונית-${invoice.invoiceNumber}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error('Error downloading Hebrew PDF:', error);
    throw error;
  }
}
