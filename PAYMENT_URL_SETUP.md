# Payment System Setup Guide

## Product English Name Field

### Purpose
The `nameEn` field allows you to create SEO-friendly payment URLs like:
- `pay.tachles.dev/my-saas-app`
- `pay.tachles.dev/analytics-tool`
- `pay.tachles.dev/e-commerce-platform`

### Setup Instructions

1. **Dashboard Product Management**
   - Go to `/dashboard/products`
   - Create a new product or edit an existing one
   - Fill in the "English Name" field with a URL-friendly name
   - Use only lowercase letters, numbers, and hyphens
   - Example: `my-saas-app`, `analytics-tool`, `e-commerce-platform`

2. **Payment URL Generation**
   - Once the English name is set, the payment URL will be: `pay.tachles.dev/{nameEn}`
   - This URL will be displayed in the dashboard products table
   - Customers can access this URL to see pricing plans and make payments

3. **Public Access**
   - Payment pages are publicly accessible (no authentication required)
   - The middleware has been updated to allow access to:
     - `/pay/*` routes
     - `pay.tachles.dev` subdomain
     - All payment-related API endpoints

### Technical Implementation

#### Database Schema
```sql
-- Added to Product model
nameEn String? // English name for payment URLs
```

#### API Updates
- `/api/products` - Now accepts `nameEn` field for creation/updates
- `/api/public/payment-plans/[productId]` - Searches by nameEn, name, or ID
- `/api/products/[id]/payment-plans` - Uses database models instead of JSON

#### Middleware Changes
```typescript
const isPublicRoute = createRouteMatcher([
  '/', 
  '/sign-up(.*)',
  '/pay/(.*)', // Payment pages
  '/api/public/(.*)', // Public API routes
  '/api/payments/create', // Payment creation
  '/api/webhooks/(.*)', // Webhook endpoints
])

// Allow access to pay.tachles.dev subdomain
if (url.hostname === 'pay.tachles.dev' || url.hostname.startsWith('pay.')) {
  return;
}
```

### URL Resolution Priority
The payment page resolver checks in this order:
1. Product ID (exact match)
2. English name (`nameEn`)
3. Regular name
4. Domain

### Example Usage

1. **Create Product**
   ```json
   {
     "name": "My SaaS Application",
     "nameEn": "my-saas-app",
     "description": "A powerful SaaS tool"
   }
   ```

2. **Payment URL**
   - Customer visits: `pay.tachles.dev/my-saas-app`
   - System finds product by `nameEn`
   - Displays pricing plans and payment form

3. **Dashboard Display**
   - Shows clickable payment URL in products table
   - Link opens in new tab for testing

### Best Practices

1. **English Name Guidelines**
   - Keep it short and memorable
   - Use hyphens instead of spaces
   - Make it relevant to your product
   - Avoid special characters or numbers unless necessary

2. **SEO Considerations**
   - Use descriptive names that reflect your product
   - Consider including keywords your customers might search for
   - Keep URLs under 60 characters when possible

3. **Testing**
   - Always test the payment URL after setting the English name
   - Verify that payment plans display correctly
   - Test the complete payment flow

This setup provides a professional, SEO-friendly payment experience for your customers while maintaining the flexibility to use either product names or IDs for API access.
