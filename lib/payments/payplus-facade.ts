import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface PaymentRequest {
  amount: number;
  currency: string;
  description: string;
  customerEmail: string;
  customerName: string;
  orderId: string;
  successUrl: string;
  cancelUrl: string;
  webhookUrl: string;
  metadata?: Record<string, unknown>;
  items?: PaymentItem[];
  recurring?: RecurringSettings;
}

export interface PaymentItem {
  name: string;
  quantity: number;
  price: number;
  productUid?: string;
  description?: string;
}

export interface RecurringSettings {
  recurringType: number; // 0 = fixed, 1 = credit card
  recurringRange: number; // 0 = days, 1 = months, 2 = years
  numberOfCharges: number;
  startDateOnPaymentDate: boolean;
}

export interface PaymentResponse {
  success: boolean;
  paymentPageUid?: string;
  paymentUrl?: string;
  qrCodeImage?: string;
  error?: string;
  metadata?: Record<string, unknown>;
}

export interface PayPlusApiResponse {
  results: {
    status: string;
    code: number;
    description: string;
  };
  data: {
    page_request_uid: string;
    payment_page_link: string;
    qr_code_image: string;
  };
}

export class PayplusFacade {
  private baseUrl: string;
  private apiKey: string;
  private paymentPageUid: string;

  constructor() {
    this.baseUrl = process.env.PAYPLUS_API_URL || 'https://restapi.payplus.co.il';
    this.apiKey = process.env.PAYPLUS_API_KEY || '';
    this.paymentPageUid = process.env.PAYPLUS_PAYMENT_PAGE_UID || '';
  }

  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      // Prepare PayPlus API request
      const payPlusRequest = {
        payment_page_uid: this.paymentPageUid,
        charge_method: 1, // Credit card
        charge_default: 'nullable',
        hide_other_charge_methods: false,
        language_code: 'en', // Can be 'he' for Hebrew
        amount: request.amount,
        currency_code: request.currency.toUpperCase(),
        sendEmailApproval: true,
        sendEmailFailure: true,
        expiry_datetime: '30', // 30 minutes expiry
        refURL_success: request.successUrl,
        refURL_failure: request.cancelUrl,
        refURL_cancel: request.cancelUrl,
        refURL_callback: request.webhookUrl,
        send_failure_callback: true,
        custom_invoice_name: request.customerName,
        create_token: false,
        initial_invoice: true,
        invoice_language: false,
        paying_vat: true,
        hide_payments_field: false,
        payments: 1,
        payments_credit: false,
        payments_selected: 1,
        hide_identification_id: false,
        send_customer_success_sms: false,
        customer_failure_sms: false,
        add_user_information: false,
        more_info: request.orderId, // Store order ID for reference
        more_info_2: JSON.stringify(request.metadata || {}),
        create_hash: 'false',
        show_more_info: 'false',
        support_track2: false,
        customer: {
          customer_name: request.customerName,
          email: request.customerEmail,
          customer_external_number: request.orderId
        },
        items: request.items?.map(item => ({
          name: item.name,
          product_invoice_extra_details: item.description || '',
          product_uid: item.productUid || '',
          quantity: item.quantity,
          price: item.price,
          value: item.price * item.quantity,
          discount_type: 'amount',
          discount_value: 0,
          shipping: false,
          vat_type: 1 // Include VAT
        })) || [{
          name: request.description,
          quantity: 1,
          price: request.amount,
          value: request.amount,
          discount_type: 'amount',
          discount_value: 0,
          shipping: false,
          vat_type: 1
        }],
        recurring_settings: request.recurring ? {
          instant_first_payment: true,
          recurring_type: request.recurring.recurringType,
          recurring_range: request.recurring.recurringRange,
          number_of_charges: request.recurring.numberOfCharges,
          start_date_on_payment_date: request.recurring.startDateOnPaymentDate,
          successful_invoice: true,
          customer_failure_email: true,
          send_customer_success_email: true
        } : undefined,
        secure3d: {
          activate: true,
          force_challenge_3ds: false
        }
      };

      // Call PayPlus API
      const payPlusResponse = await this.callPayplusAPI(payPlusRequest);

      if (payPlusResponse.results.status === 'success') {
        return {
          success: true,
          paymentPageUid: payPlusResponse.data.page_request_uid,
          paymentUrl: payPlusResponse.data.payment_page_link,
          qrCodeImage: payPlusResponse.data.qr_code_image,
          metadata: {
            orderId: request.orderId,
            pageRequestUid: payPlusResponse.data.page_request_uid
          }
        };
      } else {
        return {
          success: false,
          error: payPlusResponse.results.description || 'Payment creation failed'
        };
      }
    } catch (error) {
      console.error('Payment creation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment failed'
      };
    }
  }

  async updatePaymentStatus(
    pageRequestUid: string,
    status: 'COMPLETED' | 'FAILED' | 'REFUNDED',
    transactionId?: string
  ): Promise<boolean> {
    try {
      // Find payment by page request UID (stored in more_info or metadata)
      const payment = await prisma.payment.findFirst({
        where: {
          OR: [
            { transactionId: pageRequestUid },
            { description: { contains: pageRequestUid } }
          ]
        }
      });

      if (!payment) {
        console.error('Payment not found for page request UID:', pageRequestUid);
        return false;
      }

      await prisma.payment.update({
        where: { id: payment.id },
        data: { 
          status,
          transactionId: transactionId || pageRequestUid,
          updatedAt: new Date(),
        },
      });
      return true;
    } catch (error) {
      console.error('Failed to update payment status:', error);
      return false;
    }
  }

  async getPaymentByPageRequestUid(pageRequestUid: string) {
    return await prisma.payment.findFirst({
      where: {
        OR: [
          { transactionId: pageRequestUid },
          { description: { contains: pageRequestUid } }
        ]
      },
      include: { client: true },
    });
  }

  async getPaymentByTransactionId(transactionId: string) {
    return await prisma.payment.findUnique({
      where: { transactionId },
      include: { client: true },
    });
  }

  private async callPayplusAPI(data: Record<string, unknown>): Promise<PayPlusApiResponse> {
    const response = await fetch(`${this.baseUrl}/api/v1.0/PaymentPages/generateLink`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`PayPlus API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json() as PayPlusApiResponse;
    
    if (result.results.status !== 'success') {
      throw new Error(`PayPlus API error: ${result.results.description}`);
    }

    return result;
  }
}

export const payplusService = new PayplusFacade();
