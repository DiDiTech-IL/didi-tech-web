# 🔗 Tachles.dev Webhook Integration Guide

## Overview

This guide explains how to integrate your application with the Tachles.dev payment and setup flow. The integration allows customers to seamlessly sign up for your app through a unified payment and onboarding process.

## 🚀 Integration Flow

### 1. Customer Journey
```
[Your App] → [Join Now Button] → [pay.tachles.dev] → [Payment] → [Your App Setup Webhook] → [Customer's App Instance]
```

### 2. Technical Flow
1. **Customer clicks "Join Now"** in your app
2. **Redirected to payment page** with webhook token
3. **Customer fills form** (company details, subdomain choice)
4. **Payment processing** (integrated with payment provider)
5. **Webhook triggered** to your app's setup endpoint
6. **Your app creates** admin account, configures domain, sets up database
7. **Customer redirected** to their new app instance

---

## 📋 Step-by-Step Implementation

### Step 1: Add Join Now Button

Add this button to your application's landing page or pricing section:

```html
<a href="https://pay.tachles.dev/{PRODUCT_NAME}?data={WEBHOOK_TOKEN}" 
   class="btn btn-primary">
   Join Now - Start Your Free Trial
</a>
```

**Required Configuration:**
- `{PRODUCT_NAME}`: Your product identifier in the dashboard
- `{WEBHOOK_TOKEN}`: Unique token generated in the Tachles.dev dashboard

### Step 2: Configure Product in Dashboard

1. Go to **Products** section in Tachles.dev dashboard
2. Edit your product settings
3. Set **Webhook URL**: `https://yourapp.com/api/setup`
4. Generate **Webhook Key** (used in Join Now button)
5. Configure **Pricing Plans** and features

### Step 3: Create Setup Webhook Endpoint

Create an endpoint in your application at `/api/setup`:

```typescript
// /api/setup - Your webhook endpoint
export async function POST(request: Request) {
  try {
    // 1. Verify webhook signature (security)
    const signature = request.headers.get('x-webhook-signature');
    const body = await request.text();
    
    if (!verifyWebhookSignature(body, signature, WEBHOOK_SECRET)) {
      return Response.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const payload = JSON.parse(body);
    
    // 2. Extract customer data
    const {
      clientData: { email, companyName, fullName, subdomain },
      planSelection,
      paymentData: { transactionId, amount, status }
    } = payload;

    // 3. Verify payment was successful
    if (status !== 'completed') {
      return Response.json({ 
        success: false, 
        error: 'Payment not completed' 
      });
    }

    // 4. Create admin account
    const adminUser = await createAdminAccount({
      email,
      companyName,
      fullName,
      planType: planSelection
    });

    // 5. Set up custom subdomain
    await configureSubdomain(subdomain, adminUser.id);

    // 6. Initialize database/app instance
    await initializeAppInstance(adminUser.id, {
      companyName,
      subdomain,
      planType: planSelection
    });

    // 7. Send welcome email with login credentials
    await sendWelcomeEmail(email, {
      subdomainUrl: `https://${subdomain}.yourapp.com`,
      tempPassword: adminUser.tempPassword
    });

    // 8. Return success response
    return Response.json({
      success: true,
      data: {
        accountId: adminUser.id,
        subdomainUrl: `https://${subdomain}.yourapp.com`,
        adminCredentials: {
          email: email,
          temporaryPassword: adminUser.tempPassword
        }
      }
    });

  } catch (error) {
    console.error('Setup webhook error:', error);
    return Response.json({
      success: false,
      error: {
        code: 'SETUP_FAILED',
        details: error.message
      }
    }, { status: 500 });
  }
}
```

### Step 4: Implement Required Functions

#### A. Webhook Signature Verification
```typescript
function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  const crypto = require('crypto');
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature), 
    Buffer.from(expectedSignature)
  );
}
```

#### B. Admin Account Creation
```typescript
async function createAdminAccount(userData: {
  email: string;
  companyName: string;
  fullName: string;
  planType: string;
}) {
  const tempPassword = generateSecurePassword();
  
  const user = await db.user.create({
    data: {
      email: userData.email,
      name: userData.fullName,
      company: userData.companyName,
      role: 'ADMIN',
      password: await hashPassword(tempPassword),
      plan: userData.planType,
      status: 'ACTIVE'
    }
  });

  return { ...user, tempPassword };
}
```

#### C. Subdomain Configuration
```typescript
async function configureSubdomain(subdomain: string, userId: string) {
  // 1. Create DNS record (if managing DNS)
  await createDNSRecord(`${subdomain}.yourapp.com`, 'CNAME', 'app.yourapp.com');
  
  // 2. Generate SSL certificate
  await generateSSLCertificate(`${subdomain}.yourapp.com`);
  
  // 3. Update user record with subdomain
  await db.user.update({
    where: { id: userId },
    data: { subdomain: subdomain }
  });
}
```

#### D. App Instance Initialization
```typescript
async function initializeAppInstance(userId: string, config: {
  companyName: string;
  subdomain: string;
  planType: string;
}) {
  // 1. Create database schema for this tenant
  await createTenantDatabase(userId);
  
  // 2. Set up initial data
  await seedInitialData(userId, config);
  
  // 3. Configure app settings
  await configureAppSettings(userId, {
    companyName: config.companyName,
    subdomain: config.subdomain,
    features: getPlanFeatures(config.planType)
  });
}
```

---

## 📝 Webhook Payload Reference

### Incoming Payload (from Tachles.dev)

```json
{
  "planSelection": "premium",
  "originUrl": "https://pay.tachles.dev/yourapp",
  "destinationUrl": "https://yourapp.com",
  "clientData": {
    "email": "admin@company.com",
    "companyName": "Acme Corp",
    "fullName": "John Doe",
    "phone": "+1-555-0123",
    "subdomain": "acme"
  },
  "paymentData": {
    "transactionId": "txn_1234567890",
    "amount": 99.00,
    "currency": "ILS",
    "status": "completed"
  },
  "productName": "yourapp",
  "webhookKey": "webhook_key_from_dashboard"
}
```

### Success Response (from your app)

```json
{
  "success": true,
  "message": "Account setup completed successfully",
  "data": {
    "accountId": "user_abc123",
    "subdomainUrl": "https://acme.yourapp.com",
    "adminCredentials": {
      "email": "admin@company.com",
      "temporaryPassword": "temp_pass_xyz789"
    }
  }
}
```

### Error Response (from your app)

```json
{
  "success": false,
  "message": "Setup failed",
  "error": {
    "code": "SUBDOMAIN_EXISTS",
    "details": "The requested subdomain is already in use"
  }
}
```

---

## 🔧 Error Handling

### Common Error Codes

| Code | Description | Action |
|------|-------------|---------|
| `INVALID_SIGNATURE` | Webhook signature verification failed | Check webhook secret |
| `PAYMENT_FAILED` | Payment was not completed | Retry payment flow |
| `SUBDOMAIN_EXISTS` | Subdomain already taken | Choose different subdomain |
| `SETUP_FAILED` | General setup error | Contact support |
| `COMMUNICATION_ERROR` | Failed to reach your webhook | Check endpoint availability |

### Retry Logic

Tachles.dev will retry failed webhooks with exponential backoff:
- Immediate retry
- After 1 minute
- After 5 minutes
- After 15 minutes
- After 1 hour

---

## 🔐 Security Considerations

### 1. Webhook Signature Verification
Always verify the webhook signature to ensure requests are from Tachles.dev:

```typescript
const signature = request.headers.get('x-webhook-signature');
if (!verifyWebhookSignature(body, signature, WEBHOOK_SECRET)) {
  return Response.json({ error: 'Unauthorized' }, { status: 401 });
}
```

### 2. Input Validation
Validate all incoming data:

```typescript
// Validate email
if (!isValidEmail(clientData.email)) {
  throw new Error('Invalid email address');
}

// Validate subdomain
if (!isValidSubdomain(clientData.subdomain)) {
  throw new Error('Invalid subdomain format');
}

// Validate payment status
if (paymentData.status !== 'completed') {
  throw new Error('Payment not completed');
}
```

### 3. Rate Limiting
Implement rate limiting on your webhook endpoint to prevent abuse.

---

## 🧪 Testing

### 1. Use the Test Flow
Navigate to: `https://pay.tachles.dev/yourapp?data=test_token`

This will simulate the entire flow without actual payment processing.

### 2. Webhook Testing Tool
Use tools like ngrok to expose your local webhook endpoint:

```bash
npx ngrok http 3000
# Update webhook URL in dashboard to: https://xyz.ngrok.io/api/setup
```

### 3. Test Scenarios

| Scenario | Expected Behavior |
|----------|-------------------|
| Valid signup | Account created, subdomain configured |
| Duplicate subdomain | Error returned, no account created |
| Invalid webhook signature | 401 Unauthorized response |
| Payment failure | No setup triggered |

---

## 📊 Monitoring & Analytics

### Webhook Logs
Monitor webhook requests in the Tachles.dev dashboard:
- Request/response payloads
- Success/failure rates
- Response times
- Error details

### Your App Metrics
Track these metrics in your application:
- Setup success rate
- Time to complete setup
- Common failure reasons
- Customer onboarding completion

---

## 🚨 Troubleshooting

### Common Issues

1. **Webhook not triggered**
   - Check payment status
   - Verify webhook URL is accessible
   - Check firewall settings

2. **Setup fails after payment**
   - Check webhook endpoint logs
   - Verify database connectivity
   - Check for required permissions

3. **Subdomain not working**
   - Verify DNS configuration
   - Check SSL certificate status
   - Confirm web server routing

### Support

For integration support:
- 📧 Email: support@tachles.dev
- 📱 Phone: Available in Hebrew & English
- 🐛 GitHub Issues: Link to your support repo

---

## 📈 Best Practices

1. **Idempotency**: Handle duplicate webhook calls gracefully
2. **Timeouts**: Respond within 30 seconds
3. **Logging**: Log all webhook requests for debugging
4. **Monitoring**: Set up alerts for webhook failures
5. **Testing**: Test the full flow regularly
6. **Documentation**: Keep your setup process documented

---

*This integration enables seamless customer onboarding for your SaaS applications. The entire process is designed to be secure, reliable, and provide excellent user experience.*
