// Test script for PDF generation functionality
import { generateInvoicePDF, downloadInvoicePDF, InvoiceData } from '../lib/pdf-generator';

// Sample invoice data for testing
const sampleInvoice: InvoiceData = {
  id: 'test-invoice-1',
  invoiceNumber: 'INV-2025-0001',
  title: 'Web Development Services',
  description: 'Custom SaaS development and maintenance services',
  createdAt: new Date().toISOString(),
  issueDate: new Date().toISOString(),
  dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
  status: 'SENT',
  subtotal: 5000,
  taxRate: 17,
  taxAmount: 850,
  total: 5850,
  currency: 'USD',
  client: {
    id: 'client-1',
    name: 'John Doe',
    email: 'john@example.com',
    company: 'Example Corp',
    address: '123 Main Street',
    city: 'Tel Aviv',
    country: 'Israel',
    postalCode: '12345'
  },
  product: {
    id: 'product-1',
    name: 'Custom SaaS Platform',
    description: 'Full-stack web application with dashboard and API'
  },
  items: [
    {
      id: 'item-1',
      description: 'Frontend Development (React/Next.js)',
      quantity: 40,
      rate: 75,
      amount: 3000
    },
    {
      id: 'item-2',
      description: 'Backend Development (Node.js/API)',
      quantity: 20,
      rate: 80,
      amount: 1600
    },
    {
      id: 'item-3',
      description: 'Database Design & Setup',
      quantity: 5,
      rate: 80,
      amount: 400
    }
  ]
};

// Test function
export function testPDFGeneration() {
  try {
    console.log('Testing PDF generation...');
    
    // Test basic PDF generation
    const blob = generateInvoicePDF(sampleInvoice);
    console.log('✅ PDF generation successful!');
    console.log('Generated blob size:', blob.size, 'bytes');
    
    // Test download functionality (only works in browser environment)
    if (typeof window !== 'undefined') {
      console.log('Testing download functionality...');
      downloadInvoicePDF(sampleInvoice, 'test-invoice.pdf');
      console.log('✅ Download functionality successful!');
    } else {
      console.log('⚠️ Download test skipped (not in browser environment)');
    }
    
    return true;
  } catch (error) {
    console.error('❌ PDF generation failed:', error);
    return false;
  }
}

// Export sample data for use in other tests
export { sampleInvoice };

console.log('PDF Generator Test Module Loaded');
console.log('Run testPDFGeneration() to test the functionality');
