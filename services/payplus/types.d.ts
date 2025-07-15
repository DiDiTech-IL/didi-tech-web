/*

These are the types for using Payplus API with defined types, pulled from the official documentation

 */

// REQUEST INTERFACES
export interface GeneratePaymentLinkRequest {
  payment_page_uid: string;
  charge_method?: number;
  charge_default?: string | null;
  hide_other_charge_methods?: boolean;
  language_code?: string;
  amount: number;
  currency_code?: string;
  sendEmailApproval?: boolean;
  sendEmailFailure?: boolean;
  expiry_datetime?: string;
  refURL_success?: string;
  refURL_failure?: string;
  refURL_cancel?: string;
  refURL_callback?: string;
  send_failure_callback?: boolean;
  custom_invoice_name?: string;
  create_token?: boolean;
  initial_invoice?: boolean;
  invoice_language?: boolean;
  paying_vat?: boolean;
  hide_payments_field?: boolean;
  payments?: number;
  payments_credit?: boolean;
  payments_selected?: number;
  payments_first_amount?: number;
  hide_identification_id?: boolean;
  send_customer_success_sms?: boolean;
  customer_failure_sms?: boolean;
  add_user_information?: boolean;
  allowed_cards?: string[];
  allowed_bins?: number[];
  allowed_charge_methods?: string[];
  more_info?: string;
  more_info_2?: string;
  more_info_3?: string;
  more_info_4?: string;
  more_info_5?: string;
  create_hash?: string;
  show_more_info?: string;
  support_track2?: boolean;
  close_doc?: string;
  customer?: Customer;
  items?: Item[];
  recurring_settings?: RecurringSettings;
  secure3d?: Secure3D;
  allowed_issuers?: string[];
  invoice_integration_uid?: string;
  cashier_uid?: string;
}

export interface Customer {
  uid?: string;
  customer_name?: string;
  email?: string;
  customer_external_number?: string;
  vat_number?: string;
  phone?: string;
  address?: string;
  postal_code?: string;
  city?: string;
  country_iso?: string;
}

export interface Item {
  name: string;
  product_invoice_extra_details?: string;
  product_uid?: string;
  image_url?: string;
  category_uid?: string;
  quantity?: number;
  barcode?: string;
  value?: number;
  price?: number;
  discount_type?: "percentage" | "amount";
  discount_value?: number;
  shipping?: boolean;
  vat_type?: number;
  guide_document_url?: string;
}

export interface RecurringSettings {
  instant_first_payment?: boolean;
  recurring_type?: number;
  recurring_range?: number;
  number_of_charges?: number;
  start_date_on_payment_date?: boolean;
  start_date?: number;
  jump_payments?: number;
  successful_invoice?: boolean;
  customer_failure_email?: boolean;
  send_customer_success_email?: boolean;
  end_date?: string;
}

export interface Secure3D {
  activate: boolean;
  id?: string;
  phone?: string;
}

// RESPONSE INTERFACES
export interface GeneratePaymentLinkResponse {
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
