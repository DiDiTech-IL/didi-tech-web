# PayPlus Integration Environment Variables

## Required PayPlus Configuration

Add these environment variables to your `.env.local` file:

```bash
# PayPlus API Configuration
PAYPLUS_API_URL=https://restapi.payplus.co.il
PAYPLUS_API_KEY=your_payplus_api_key_here
PAYPLUS_PAYMENT_PAGE_UID=your_payment_page_uid_here

# PayPlus Webhook Configuration (optional - for signature verification)
PAYPLUS_WEBHOOK_SECRET=your_webhook_secret_here
```

## PayPlus Setup Steps

1. **Create PayPlus Account**: Sign up at https://www.payplus.co.il/
2. **Get API Credentials**: 
   - Go to PayPlus dashboard
   - Navigate to API settings
   - Copy your API key
3. **Create Payment Page**:
   - Create a new payment page in PayPlus dashboard
   - Copy the Payment Page UID
4. **Configure Webhooks**:
   - Set webhook URL to: `https://your-domain.com/api/webhooks/payplus`
   - Configure success/failure URLs as needed

## Environment Setup

### Development
```bash
PAYPLUS_API_URL=https://restapi.payplus.co.il  # Use sandbox URL for testing
PAYPLUS_API_KEY=test_api_key
PAYPLUS_PAYMENT_PAGE_UID=test_page_uid
```

### Production
```bash
PAYPLUS_API_URL=https://restapi.payplus.co.il
PAYPLUS_API_KEY=live_api_key
PAYPLUS_PAYMENT_PAGE_UID=live_page_uid
```

## Webhook Configuration

The webhook endpoint expects PayPlus to send callbacks to:
`POST /api/webhooks/payplus`

Required callback parameters:
- `status`: "success" | "failure" | "pending"
- `page_request_uid`: Unique payment page request ID
- `transaction_uid`: PayPlus transaction ID (optional)
- `amount`: Payment amount
- `currency_code`: Currency (e.g., "ILS", "ILS")
- `more_info`: Custom order ID
- `more_info_2`: Custom metadata (JSON string)
- `customer_email`: Customer email
- `customer_name`: Customer name

## Testing

To test the PayPlus integration:

1. Set up development environment variables
2. Create a test product and payment plan
3. Navigate to payment page: `https://your-domain.com/pay/your-product-name`
4. Complete test payment
5. Check webhook logs in database
6. Verify payment status updates

## API Flow

1. **Payment Creation**: `/api/payments/create` → PayPlus `generateLink` API
2. **Customer Payment**: Customer completes payment on PayPlus page
3. **Webhook Callback**: PayPlus calls `/api/webhooks/payplus`
4. **Status Update**: System updates payment status and triggers automation
5. **Account Creation**: System sends webhook to target application

## Security

- API keys should be kept secure and not committed to repository
- Use environment variables for all sensitive configuration
- Webhook signature verification can be enabled with `PAYPLUS_WEBHOOK_SECRET`
- All webhook calls are logged for audit purposes
