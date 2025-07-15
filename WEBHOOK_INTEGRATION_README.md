# Webhook Integration Guide - Tachles Dashboard Integration

## Overview
This document provides complete instructions for integrating with the Tachles dashboard webhook system. The system manages the complete customer lifecycle from payment to user activation through a two-way webhook communication system.

## Complete User Flow

### Phase 1: Payment & Initial Setup (Tachles Side)
1. Customer completes payment on Tachles dashboard
2. Customer is redirected to "Payment Successful" page with receipt download
3. Customer receives instructions to check email for activation details

### Phase 2: User Creation & Domain Setup (Your Application)
1. Tachles webhook sends `domain.activated` event to your application
2. Your application creates the new user/organization
3. Your application sends user activation details back to Tachles via webhook
4. Tachles sends activation email to customer with:
   - Custom domain link
   - Initial login credentials (email + phone/generated password)

### Phase 3: User Activation Confirmation
1. Customer clicks activation link and logs into their domain
2. Your application sends `user.activated` confirmation back to Tachles
3. Customer is prompted to change their temporary password

## Webhook Communication Flow
```
Payment → Tachles → Your App → Tachles → Customer Email → Your App → Tachles
```

## Webhook Endpoints

### 1. Incoming Webhooks (From Tachles to Your App)
- **Method:** `POST`
- **Content-Type:** `application/json`
- **Expected Response:** `200 OK` with `{"received": true}`

### 2. Outgoing Webhooks (From Your App to Tachles)
- **Method:** `POST`
- **Content-Type:** `application/json`
- **Expected Response:** `200 OK` with `{"processed": true}`

### Required Headers
```http
Content-Type: application/json
x-tachles-signature: <HMAC_SHA256_SIGNATURE>
```

## Payload Structures

### 1. Incoming from Tachles (Domain Events)

#### Complete Schema
```typescript
interface TachlesWebhookPayload {
  event: "domain.activated" | "domain.suspended" | "domain.cancelled";
  leadId: string;
  tachlesCustomerId: string;
  domainInfo: {
    subdomain: string;
    organizationName: string;
    contactEmail: string;
    contactName: string;
    contactPhone: string; // Customer's phone number
    subscriptionPlan: "BASIC" | "ADVANCED" | "ENTERPRISE";
  };
  timestamp: string; // ISO 8601 format
  signature: string;
}
```

### 2. Outgoing to Tachles (User Events)

#### User Created Response
```typescript
interface UserCreatedWebhookPayload {
  event: "user.created";
  leadId: string; // Same leadId from incoming webhook
  tachlesCustomerId: string;
  userInfo: {
    subdomain: string;
    domainUrl: string; // Full URL to customer's domain
    email: string;
    temporaryPassword: string; // Phone number or generated password
    activationRequired: boolean;
  };
  timestamp: string;
  signature: string;
}
```

#### User Activation Confirmation
```typescript
interface UserActivatedWebhookPayload {
  event: "user.activated";
  leadId: string;
  tachlesCustomerId: string;
  activationInfo: {
    subdomain: string;
    activatedAt: string;
    firstLoginCompleted: boolean;
  };
  timestamp: string;
  signature: string;
}
}
```

### Field Descriptions

#### Incoming Webhook Fields
- `event`: The type of domain status change
- `leadId`: Unique identifier for the lead submission
- `tachlesCustomerId`: Customer ID from Tachles system
- `domainInfo.subdomain`: The subdomain being managed
- `domainInfo.organizationName`: Display name for the organization
- `domainInfo.contactEmail`: Primary contact email
- `domainInfo.contactName`: Primary contact person name
- `domainInfo.contactPhone`: Customer's phone number (for temporary password)
- `domainInfo.subscriptionPlan`: The subscription tier
- `timestamp`: When the event occurred (ISO 8601 format)
- `signature`: HMAC signature for verification

#### Outgoing Webhook Fields
- `userInfo.domainUrl`: Full URL where customer should log in (e.g., "https://subdomain.yourdomain.com")
- `userInfo.temporaryPassword`: Phone number or auto-generated password for first login
- `userInfo.activationRequired`: Whether user needs to change password on first login
- `activationInfo.firstLoginCompleted`: Whether user has successfully logged in and changed password

## Event Types & Required Actions

### 1. Incoming Events (From Tachles)

#### Domain Activation (`domain.activated`)
**When:** Payment successful, domain ready for use
**Required Actions:**
1. Create new user/organization in your system
2. Generate temporary password (phone number or random)
3. Send `user.created` webhook back to Tachles with login details
4. Set up domain/subdomain infrastructure

#### Domain Suspension (`domain.suspended`)
**When:** Payment failed, subscription suspended
**Required Actions:**
1. Temporarily disable user access
2. Preserve all user data
3. Optionally notify Tachles of suspension status

#### Domain Cancellation (`domain.cancelled`)
**When:** Subscription permanently cancelled
**Required Actions:**
1. Mark user as inactive
2. Consider data retention policies
3. Optionally send final status to Tachles

### 2. Outgoing Events (To Tachles)

#### User Created (`user.created`)
**When:** After successfully creating user in your system
**Purpose:** Provide Tachles with login details to send activation email

#### User Activated (`user.activated`)
**When:** User successfully logs in for the first time
**Purpose:** Confirm to Tachles that customer is actively using the system

## Payload Examples

### Incoming Webhooks (From Tachles)

#### Domain Activation
```json
{
  "event": "domain.activated",
  "leadId": "lead_abc123",
  "tachlesCustomerId": "tachles_customer_xyz789",
  "domainInfo": {
    "subdomain": "my-startup",
    "organizationName": "My Startup Ltd",
    "contactEmail": "admin@mystartup.com",
    "contactName": "Jane Smith",
    "contactPhone": "+972501234567",
    "subscriptionPlan": "ADVANCED"
  },
  "timestamp": "2025-07-14T10:30:00.000Z",
  "signature": "hmac_signature_here"
}
```

#### Domain Suspension
```json
{
  "event": "domain.suspended",
  "leadId": "lead_abc123",
  "tachlesCustomerId": "tachles_customer_xyz789",
  "domainInfo": {
    "subdomain": "my-startup",
    "organizationName": "My Startup Ltd",
    "contactEmail": "admin@mystartup.com",
    "contactName": "Jane Smith",
    "contactPhone": "+972501234567",
    "subscriptionPlan": "ADVANCED"
  },
  "timestamp": "2025-07-14T11:45:00.000Z",
  "signature": "hmac_signature_here"
}
```

### Outgoing Webhooks (To Tachles)

#### User Created Response
```json
{
  "event": "user.created",
  "leadId": "lead_abc123",
  "tachlesCustomerId": "tachles_customer_xyz789",
  "userInfo": {
    "subdomain": "my-startup",
    "domainUrl": "https://my-startup.yourdomain.com",
    "email": "admin@mystartup.com",
    "temporaryPassword": "501234567", // Phone without country code
    "activationRequired": true
  },
  "timestamp": "2025-07-14T10:35:00.000Z",
  "signature": "hmac_signature_here"
}
```

#### User Activation Confirmation
```json
{
  "event": "user.activated",
  "leadId": "lead_abc123",
  "tachlesCustomerId": "tachles_customer_xyz789",
  "activationInfo": {
    "subdomain": "my-startup",
    "activatedAt": "2025-07-14T14:20:00.000Z",
    "firstLoginCompleted": true
  },
  "timestamp": "2025-07-14T14:20:00.000Z",
  "signature": "hmac_signature_here"
}
```

## Implementation Workflow

### Step-by-Step Integration Process

#### 1. Receive Domain Activation
```javascript
// When you receive domain.activated webhook
app.post('/webhook/tachles', async (req, res) => {
  const webhookData = req.body;
  
  if (webhookData.event === 'domain.activated') {
    // Create user/organization in your system
    const user = await createUserFromWebhook(webhookData);
    
    // Generate temporary password (phone or random)
    const tempPassword = extractPhoneNumber(webhookData.domainInfo.contactPhone) 
      || generateRandomPassword();
    
    // Send user.created webhook back to Tachles
    await sendUserCreatedWebhook({
      leadId: webhookData.leadId,
      tachlesCustomerId: webhookData.tachlesCustomerId,
      userInfo: {
        subdomain: webhookData.domainInfo.subdomain,
        domainUrl: `https://${webhookData.domainInfo.subdomain}.yourdomain.com`,
        email: webhookData.domainInfo.contactEmail,
        temporaryPassword: tempPassword,
        activationRequired: true
      }
    });
  }
  
  res.json({ received: true });
});
```

#### 2. Handle User First Login
```javascript
// In your login handler
app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  // Authenticate user
  const user = await authenticateUser(email, password);
  
  if (user && user.isFirstLogin) {
    // Send user.activated webhook to Tachles
    await sendUserActivatedWebhook({
      leadId: user.leadId,
      tachlesCustomerId: user.tachlesCustomerId,
      activationInfo: {
        subdomain: user.subdomain,
        activatedAt: new Date().toISOString(),
        firstLoginCompleted: true
      }
    });
    
    // Mark user as activated
    await markUserAsActivated(user.id);
  }
  
  res.json({ success: true, requirePasswordChange: user.isFirstLogin });
});
```

#### 3. Send Webhooks to Tachles
```javascript
async function sendUserCreatedWebhook(payload) {
  const webhookUrl = process.env.TACHLES_WEBHOOK_URL;
  const secret = process.env.TACHLES_WEBHOOK_SECRET;
  
  const payloadString = JSON.stringify(payload);
  const signature = crypto
    .createHmac('sha256', secret)
    .update(payloadString)
    .digest('hex');
  
  await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-your-app-signature': signature
    },
    body: payloadString
  });
}
```

## Security & Signature Verification

### For Incoming Webhooks (From Tachles)
The webhook includes an HMAC SHA256 signature for security. You must verify this signature to ensure the request is authentic.

#### Implementation Example (Node.js)
```javascript
const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
}

// Usage
const rawPayload = request.body; // Raw string payload
const signature = request.headers['x-tachles-signature'];
const webhookSecret = process.env.TACHLES_WEBHOOK_SECRET;

if (!verifyWebhookSignature(rawPayload, signature, webhookSecret)) {
  return response.status(401).json({ error: 'Invalid signature' });
}
```

### For Outgoing Webhooks (To Tachles)
```javascript
function createOutgoingSignature(payload, secret) {
  return crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
}

// Usage when sending to Tachles
const payloadString = JSON.stringify(webhookPayload);
const signature = createOutgoingSignature(payloadString, process.env.TACHLES_WEBHOOK_SECRET);

fetch(tachlesWebhookUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-your-app-signature': signature
  },
  body: payloadString
});
```
### Python Implementation
```python
import hmac
import hashlib

def verify_webhook_signature(payload, signature, secret):
    expected_signature = hmac.new(
        secret.encode('utf-8'),
        payload.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()
    
    return hmac.compare_digest(signature, expected_signature)

def create_outgoing_signature(payload, secret):
    return hmac.new(
        secret.encode('utf-8'),
        payload.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()

# Usage
raw_payload = request.get_data(as_text=True)
signature = request.headers.get('x-tachles-signature')
webhook_secret = os.environ.get('TACHLES_WEBHOOK_SECRET')

if not verify_webhook_signature(raw_payload, signature, webhook_secret):
    return jsonify({'error': 'Invalid signature'}), 401
```

## Expected Response Formats

### Success Response
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "received": true
}
```

### Error Responses

#### Invalid Signature
```http
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{
  "error": "Invalid webhook signature"
}
```

#### Invalid Payload
```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "error": "Invalid webhook payload",
  "details": [
    "event: Expected 'domain.activated' | 'domain.suspended' | 'domain.cancelled'"
  ]
}
```

#### Server Error
```http
HTTP/1.1 500 Internal Server Error
Content-Type: application/json

{
  "error": "Internal server error"
}
```

## Implementation Checklist

### Required Steps
- [ ] Set up incoming webhook endpoint URL for Tachles events
- [ ] Set up outgoing webhook endpoint URL for sending to Tachles  
- [ ] Configure webhook secrets in environment variables
- [ ] Implement signature verification for incoming webhooks
- [ ] Implement signature creation for outgoing webhooks
- [ ] Parse and validate incoming payload structure
- [ ] Handle domain.activated event (create user + send user.created webhook)
- [ ] Handle domain.suspended/cancelled events
- [ ] Implement user first-login detection
- [ ] Send user.activated webhook on first login
- [ ] Return proper HTTP status codes
- [ ] Add comprehensive logging
- [ ] Test with sample payloads

### Recommended Steps
- [ ] Implement idempotency (handle duplicate webhooks)
- [ ] Add retry mechanism for failed outgoing webhooks
- [ ] Set up monitoring/alerting for webhook failures
- [ ] Implement webhook queue system for reliability
- [ ] Create admin dashboard for webhook status monitoring
- [ ] Test error scenarios and edge cases
- [ ] Document your webhook handling logic
- [ ] Set up webhook URL validation
- [ ] Implement rate limiting for incoming webhooks

## Testing

### Sample Test Payload Generator
```javascript
function generateTestPayload(eventType, subdomain = 'test-company') {
  return {
    event: eventType,
    leadId: `lead_${Date.now()}`,
    tachlesCustomerId: `customer_${Date.now()}`,
    domainInfo: {
      subdomain: subdomain,
      organizationName: `${subdomain.replace('-', ' ')} Ltd`,
      contactEmail: `admin@${subdomain}.com`,
      contactName: 'Test User',
      subscriptionPlan: 'ADVANCED'
    },
    timestamp: new Date().toISOString(),
    signature: 'test_signature'
  };
}

// Generate test payloads
const activationPayload = generateTestPayload('domain.activated');
const suspensionPayload = generateTestPayload('domain.suspended');
const cancellationPayload = generateTestPayload('domain.cancelled');
```

### cURL Test Commands
```bash
# Test domain activation
curl -X POST https://your-app.com/webhook/tachles \
  -H "Content-Type: application/json" \
  -H "x-tachles-signature: test_signature" \
  -d '{
    "event": "domain.activated",
    "leadId": "test_lead_123",
    "tachlesCustomerId": "test_customer_456",
    "domainInfo": {
      "subdomain": "test-company",
      "organizationName": "Test Company Ltd",
      "contactEmail": "admin@testcompany.com",
      "contactName": "Test User",
      "subscriptionPlan": "ADVANCED"
    },
    "timestamp": "2025-07-14T10:30:00.000Z",
    "signature": "test_signature"
  }'
```

## Environment Variables Required

```env
# Webhook Security
TACHLES_WEBHOOK_SECRET=your_shared_webhook_secret_here

# Tachles API Endpoints
TACHLES_WEBHOOK_URL=https://tachles-dashboard.com/api/webhooks/your-app

# Your Domain Configuration
YOUR_DOMAIN_BASE=yourdomain.com  # For generating subdomain URLs
```

## Contact & Support

For questions about this integration:
- Review the webhook logs for debugging information
- Ensure all required fields are present in the payload
- Verify signature calculation matches the expected format
- Check that your endpoint returns proper HTTP status codes

## Implementation Status

### ✅ Completed
- Webhook endpoint: `/api/webhooks/tachles`
- Signature verification for incoming webhooks
- Domain activation handling (creates client record)
- Domain suspension/cancellation handling
- Outgoing webhook structure for user.created and user.activated events
- Environment configuration examples
- Test script for webhook validation

### 🚧 To Complete
- Database migration to add LeadSubmission and Organization models
- Integration with your authentication system for first-login detection
- User.activated webhook sending on first login
- Clerk organization creation (if using Clerk)
- Retry mechanism for failed outgoing webhooks
- Production webhook URL configuration

### 📝 Integration Steps Required

1. **Database Migration:**
   ```bash
   # Add the new models to your database
   npx prisma db push
   # or create a migration
   npx prisma migrate dev --name add-tachles-models
   ```

2. **Environment Variables:**
   - Copy `.env.tachles.example` values to your `.env` file
   - Set up your actual webhook URLs and secrets

3. **Authentication Integration:**
   - Integrate `lib/auth-helpers.ts` into your login system
   - Track first login status for users
   - Call `sendUserActivatedWebhook` on first successful login

4. **Testing:**
   ```bash
   # Run the test script to verify webhook functionality
   npm run tsx scripts/test-webhook.ts
   ```

5. **Production Setup:**
   - Configure proper webhook URLs for production
   - Set up monitoring for webhook success/failure rates
   - Implement retry logic for failed webhook deliveries

## Current Implementation Notes

The current implementation uses the existing `Client` model to track customers from Tachles. When the full `LeadSubmission` and `Organization` models are migrated, the code can be updated to use those instead for better organization and tracking.

## Changelog

- **v1.0** - Initial webhook integration specification
- Added support for domain.activated, domain.suspended, domain.cancelled events
- Included HMAC signature verification
- Complete payload examples and implementation guides
