# Payment Subdomain Setup Guide

This guide explains how the multi-tenant payment subdomain system works and how to test it.

## Overview

The payment system uses a subdomain-based routing approach similar to your multi-tenant setup. When users visit `pay.tachles.dev/productName`, the middleware validates the product exists and rewrites the URL to serve the appropriate payment page.

## How It Works

### 1. Middleware Processing (URL Rewriting Only)
The middleware (`middleware.ts`) handles the following:

- **Subdomain Detection**: Identifies requests to `pay.tachles.dev` or `pay.localhost:3000`
- **URL Rewriting**: Rewrites `pay.tachles.dev/mitnadvim` to `/pay/mitnadvim` internally
- **Header Injection**: Adds product name to request headers for easy access
- **No Database Queries**: Keeps middleware lightweight and fast

### 2. Page-Level Product Validation
Product validation happens in the page component (`/app/pay/[productName]/page.tsx`):

- **Database Query**: Checks if the product exists in the database and is LIVE
- **Name Matching**: Validates both `name` and `nameEn` fields (case-insensitive)
- **404 Handling**: Shows custom not-found page for invalid products

### 3. Benefits of This Approach
- **Performance**: Middleware doesn't make database calls
- **Separation of Concerns**: URL rewriting vs. business logic
- **Error Handling**: Database errors don't affect middleware routing
- **Flexibility**: Easy to modify validation logic without touching middleware

## File Structure

```
app/
├── pay/
│   ├── layout.tsx              # Payment layout with subdomain handling
│   ├── page.tsx                # Root payment page (pay.tachles.dev/)
│   ├── not-found.tsx           # Custom 404 page for invalid products
│   ├── test-routing/
│   │   └── page.tsx            # Test page to verify routing
│   └── [productName]/
│       ├── page.tsx            # Product payment page with validation
│       └── enhanced-payment-page-v2.tsx  # Payment UI component
middleware.ts                   # Multi-tenant routing logic
```

## Testing Locally

### Option 1: Direct Routes (Easiest)
Test the functionality using direct routes on localhost:

1. **Valid Product**: http://localhost:3000/pay/mitnadvim
2. **Invalid Product**: http://localhost:3000/pay/invalid-product
3. **Routing Test**: http://localhost:3000/pay/test-routing

### Option 2: Subdomain Simulation
To test the actual subdomain behavior locally:

1. **Edit your hosts file**:
   ```
   # Windows: C:\Windows\System32\drivers\etc\hosts
   # Mac/Linux: /etc/hosts
   127.0.0.1 pay.localhost
   ```

2. **Visit**: http://pay.localhost:3000/mitnadvim

### Option 3: Production Testing
Test on the actual subdomain (requires deployment):
- **Valid Product**: https://pay.tachles.dev/mitnadvim
- **Invalid Product**: https://pay.tachles.dev/nonexistent

## Available Test Products

The system includes a test product created by `scripts/create-test-product.ts`:

- **Name**: מתנדבים (Hebrew)
- **English Name**: mitnadvim
- **URL**: `/mitnadvim`
- **Status**: LIVE
- **Payment Plans**: 3 plans (Basic, Advanced, Enterprise)

## Creating New Products

To create additional test products, modify `scripts/create-test-product.ts` or use the dashboard to create products with:

- `name`: Hebrew name
- `nameEn`: English name (used in URLs)
- `status`: Must be 'LIVE' for payment pages
- Associated payment plans

## Troubleshooting

### Product Not Found (404)
1. Verify the product exists in the database
2. Check that `status` is 'LIVE'
3. Ensure `name` or `nameEn` matches the URL parameter
4. Check page component logs for validation errors

### Middleware Issues
1. Check that URL rewriting is working (visit test-routing page)
2. Verify subdomain detection logic
3. Review middleware logs for rewriting errors

### Payment Page Not Loading
1. Verify the enhanced payment page component exists
2. Check API route `/api/pay/[productName]` is working
3. Ensure all required dependencies are installed
4. Check page component for database connection issues

## Key Features

- ✅ Subdomain-based routing (pay.tachles.dev/product)
- ✅ Lightweight middleware (URL rewriting only, no DB queries)
- ✅ Page-level product validation with proper error handling
- ✅ Styled 404 pages for invalid products
- ✅ Header injection for easy product access
- ✅ Support for both Hebrew and English product names
- ✅ Development and production environment support
- ✅ Separation of concerns (routing vs. business logic)
- ✅ Test utilities and documentation

## API Endpoints

- `GET /api/pay/[productName]` - Fetch product and payment plans
- Payment processing endpoints (existing)
- Webhook endpoints (existing)

## Security Considerations

- Product validation prevents access to inactive products
- Middleware-level validation reduces database queries in components
- Error handling prevents information leakage
- Public routes are properly configured for payment flow
