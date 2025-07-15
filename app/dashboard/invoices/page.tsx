"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Edit, Trash2, Eye, Download, Send, DollarSign, FileText, Clock, CheckCircle, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { downloadInvoicePDF } from "@/lib/pdf-generator";
import { LoadingSpinner } from "@/components/LoadingSpinner";

interface Invoice {
  id: string;
  invoiceNumber: string;
  productId: string;
  clientId: string;
  issueDate: Date;
  dueDate: Date;
  status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  total: number;
  currency: string;
  product?: {
    id: string;
    name: string;
  };
  client?: {
    id: string;
    name: string;
    company?: string;
  };
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [pdfLoading, setPdfLoading] = useState<string | null>(null);
  const [emailLoading, setEmailLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const loadInvoices = async () => {
    try {
      const response = await fetch('/api/invoices');
      if (!response.ok) throw new Error('Failed to fetch invoices');
      const data = await response.json();
      setInvoices(data);
    } catch (error) {
      console.error('Failed to load invoices:', error);
      toast({
        title: "שגיאה",
        description: "טעינת החשבוניות נכשלה",
        variant: "destructive",
      });
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('/api/invoices/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        await Promise.all([loadInvoices(), loadStats()]);
      } catch (error) {
        console.error('Failed to load initial data:', error);
      } finally {
        setLoading(false);
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sendInvoice = async (invoiceId: string) => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/send`, {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send invoice');
      }

      toast({
        title: "הצלחה",
        description: "החשבונית נשלחה בהצלחה",
      });

      await loadInvoices();
    } catch (error) {
      console.error('Error sending invoice:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send invoice",
        variant: "destructive",
      });
    }
  };

  const markAsPaid = async (invoiceId: string) => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/mark-paid`, {
        method: 'PUT',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to mark invoice as paid');
      }

      toast({
        title: "הצלחה",
        description: "החשבונית סומנה כשולמה",
      });

      await loadInvoices();
      await loadStats();
    } catch (error) {
      console.error('Error marking invoice as paid:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to mark invoice as paid",
        variant: "destructive",
      });
    }
  };

  const downloadPDF = async (invoiceId: string, invoiceNumber: string) => {
    setPdfLoading(invoiceId);
    
    try {
      toast({
        title: "מכין חשבונית",
        description: "יוצר קובץ PDF...",
      });

      // First try server-side PDF generation
      const response = await fetch(`/api/invoices/${invoiceId}/pdf?format=pdf`);
      
      if (!response.ok) {
        throw new Error('Server PDF generation failed');
      }

      // Create blob from response
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "הצלחה",
        description: "חשבונית הורדה בהצלחה",
      });
    } catch (error) {
      console.error('Server PDF generation failed, trying client-side fallback:', error);
      
      try {
        toast({
          title: "מנסה דרך חלופית",
          description: "יוצר PDF במצב חלופי...",
        });

        // Fallback to client-side PDF generation with transformed data
        const invoiceResponse = await fetch(`/api/invoices/${invoiceId}?transform=pdf`);
        if (!invoiceResponse.ok) {
          throw new Error('Failed to fetch invoice data');
        }
        
        const invoiceData = await invoiceResponse.json();
        
        // Ensure all required fields are present and properly typed
        const transformedData = {
          ...invoiceData,
          createdAt: invoiceData.createdAt || new Date().toISOString(),
          issueDate: invoiceData.issueDate || invoiceData.createdAt || new Date().toISOString(),
          currency: invoiceData.currency || 'USD',
          client: {
            ...invoiceData.client,
            id: invoiceData.client.id || invoiceId,
          },
        };
        
        downloadInvoicePDF(transformedData, `invoice-${invoiceNumber}.pdf`);
        
        toast({
          title: "הצלחה",
          description: "חשבונית הורדה בהצלחה (מצב חלופי)",
        });
      } catch (fallbackError) {
        console.error('Client-side PDF generation also failed:', fallbackError);
        
        // Last resort: Try the alternative canvas-based approach
        try {
          toast({
            title: "מנסה דרך אחרונה",
            description: "יוצר PDF במצב Canvas...",
          });

          const { generateInvoicePDFCanvas } = await import('@/lib/pdf-generator');
          const invoiceResponse = await fetch(`/api/invoices/${invoiceId}?transform=pdf`);
          if (!invoiceResponse.ok) {
            throw new Error('Failed to fetch invoice data');
          }
          
          const invoiceData = await invoiceResponse.json();
          const transformedData = {
            ...invoiceData,
            createdAt: invoiceData.createdAt || new Date().toISOString(),
            issueDate: invoiceData.issueDate || invoiceData.createdAt || new Date().toISOString(),
            currency: invoiceData.currency || 'USD',
            client: {
              ...invoiceData.client,
              id: invoiceData.client.id || invoiceId,
            },
          };
          
          const blob = await generateInvoicePDFCanvas(transformedData);
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `invoice-${invoiceNumber}.pdf`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          
          toast({
            title: "הצלחה",
            description: "חשבונית הורדה בהצלחה (מצב חלופי מתקדם)",
          });
        } catch (canvasError) {
          console.error('Canvas-based PDF generation also failed:', canvasError);
          toast({
            title: "שגיאה",
            description: "הורדת החשבונית נכשלה. אנא נסה שוב מאוחר יותר.",
            variant: "destructive",
          });
        }
      }
    } finally {
      setPdfLoading(null);
    }
  };

  const sendInvoiceEmail = async (invoiceId: string, invoiceNumber: string, language: 'he' | 'en' = 'he') => {
    setEmailLoading(invoiceId);
    
    try {
      toast({
        title: "שולח חשבונית",
        description: "מכין ושולח את החשבונית במייל...",
      });

      const response = await fetch(`/api/invoices/${invoiceId}/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ language }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send invoice email');
      }

      const result = await response.json();
      
      toast({
        title: "הצלחה",
        description: `חשבונית ${invoiceNumber} נשלחה בהצלחה לכתובת ${result.clientEmail}`,
      });

      // Optionally reload invoices to update status
      await loadInvoices();
    } catch (error) {
      console.error('Error sending invoice email:', error);
      toast({
        title: "שגיאה",
        description: error instanceof Error ? error.message : "שליחת החשבונית נכשלה",
        variant: "destructive",
      });
    } finally {
      setEmailLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      DRAFT: 'bg-gray-100 text-gray-800',
      SENT: 'bg-blue-100 text-blue-800',
      PAID: 'bg-green-100 text-green-800',
      OVERDUE: 'bg-red-100 text-red-800',
      CANCELLED: 'bg-slate-100 text-slate-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return <FileText className="h-4 w-4" />;
      case 'SENT':
        return <Send className="h-4 w-4" />;
      case 'PAID':
        return <CheckCircle className="h-4 w-4" />;
      case 'OVERDUE':
        return <Clock className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <span className="ml-2">Loading invoices...</span>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">ניהול חשבוניות</h1>
          <p className="text-slate-600 dark:text-slate-400">Create, manage, and track your client invoices</p>
        </div>
        <Button className="bg-gradient-to-r from-emerald-600 to-blue-600">
          <Plus className="h-4 w-4 mr-2" />
          New Invoice
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">סה״כ הכנסות</p>
                  <p className="text-2xl font-bold">₪{stats.totalRevenue?.toLocaleString() || 0}</p>
                </div>
                <div className="h-8 w-8 bg-emerald-100 rounded-full flex items-center justify-center">
                  <DollarSign className="h-4 w-4 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">ממתינות</p>
                  <p className="text-2xl font-bold">{stats.pending || 0}</p>
                </div>
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Clock className="h-4 w-4 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">שולמו</p>
                  <p className="text-2xl font-bold">{stats.paid || 0}</p>
                </div>
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">באיחור</p>
                  <p className="text-2xl font-bold">{stats.overdue || 0}</p>
                </div>
                <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                  <Clock className="h-4 w-4 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>כל החשבוניות</CardTitle>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-500 mb-4">No invoices found. Generate your first invoice from a product.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>לקוח</TableHead>
                  <TableHead>מוצר</TableHead>
                  <TableHead>תאריך הנפקה</TableHead>
                  <TableHead>תאריך פירעון</TableHead>
                  <TableHead>סטטוס</TableHead>
                  <TableHead>סכום</TableHead>
                  <TableHead>פעולות</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>
                      <div className="font-medium">{invoice.invoiceNumber}</div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{invoice.client?.name}</p>
                        {invoice.client?.company && (
                          <p className="text-sm text-slate-500">{invoice.client.company}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{invoice.product?.name}</div>
                    </TableCell>
                    <TableCell>
                      {new Date(invoice.issueDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {new Date(invoice.dueDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getStatusColor(invoice.status)} flex items-center gap-1 w-fit`}>
                        {getStatusIcon(invoice.status)}
                        {invoice.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {invoice.currency} {invoice.total.toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" title="צפייה בחשבונית">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {invoice.status === 'DRAFT' && (
                          <>
                            <Button variant="ghost" size="sm" title="עריכת חשבונית">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => sendInvoice(invoice.id)}
                              title="Send Invoice"
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {(invoice.status === 'SENT' || invoice.status === 'OVERDUE') && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => markAsPaid(invoice.id)}
                            title="Mark as Paid"
                            className="text-green-600"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          title={pdfLoading === invoice.id ? "יוצר PDF..." : "Download PDF"}
                          onClick={() => downloadPDF(invoice.id, invoice.invoiceNumber)}
                          disabled={pdfLoading === invoice.id}
                          className={pdfLoading === invoice.id ? "opacity-60" : ""}
                        >
                          {pdfLoading === invoice.id ? (
                            <LoadingSpinner className="h-4 w-4" />
                          ) : (
                            <Download className="h-4 w-4" />
                          )}
                        </Button>
                        {invoice.status === 'DRAFT' && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-600"
                            title="Delete Invoice"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                        {invoice.status !== 'DRAFT' && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => sendInvoiceEmail(invoice.id, invoice.invoiceNumber)}
                            title={emailLoading === invoice.id ? "שולח במייל..." : "שלח חשבונית במייל"}
                            disabled={emailLoading === invoice.id}
                            className={emailLoading === invoice.id ? "opacity-60" : ""}
                          >
                            {emailLoading === invoice.id ? (
                              <LoadingSpinner className="h-4 w-4" />
                            ) : (
                              <Mail className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
