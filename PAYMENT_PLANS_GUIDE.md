# Payment Plans Integration Guide

## Overview

The Tachles.dev platform provides a comprehensive payment plans system that allows you to:

1. **Manage Payment Plans**: Create and configure detailed payment plans for your products
2. **Public API Access**: Serve payment plan data to external payment gateways (like pay.tachles.dev)
3. **Flexible Configuration**: Support multiple currencies, billing intervals, trials, and discounts

## API Endpoints

### Public Payment Plans API
```
GET /api/public/payment-plans/{productId}
```

This endpoint is designed for payment gateways and supports:
- Product lookup by ID, name, or domain
- CORS-enabled for cross-origin requests
- Cached responses (5 minutes)
- Comprehensive metadata about pricing

### Management APIs (Authenticated)
```
GET /api/products/{id}/payment-plans
POST /api/products/{id}/payment-plans
PUT /api/products/{id}/payment-plans/{planId}
DELETE /api/products/{id}/payment-plans/{planId}
```

## Payment Plan Structure

Each payment plan includes:

```typescript
interface PaymentPlan {
  id: string;                    // Unique identifier
  name: string;                  // Plan name (e.g., "Pro Plan")
  description?: string;          // Plan description
  planType: PlanType;           // ONE_TIME, RECURRING, FREEMIUM, TRIAL
  price: number;                // Price amount
  currency: Currency;           // ILS, EUR, GBP, ILS, CAD, AUD
  billingInterval: Interval;    // MONTHLY, YEARLY, QUARTERLY, WEEKLY, ONE_TIME
  trialDays?: number;           // Free trial period
  features: string[];           // List of included features
  userLimit?: number;           // Maximum users (null = unlimited)
  storageLimit?: number;        // Storage in GB (null = unlimited)
  apiCallsLimit?: number;       // API calls per month (null = unlimited)
  discountPercentage?: number;  // Promotional discount
  discountValidUntil?: string;  // Discount expiration
  isPopular?: boolean;          // Highlight as popular choice
  isActive: boolean;            // Plan availability
  displayOrder: number;         // Sort order
}
```

## Usage Examples

### 1. Dashboard Management

Navigate to **Products → Payment Plans** tab to:
- Create new payment plans
- Edit existing plans
- Set trial periods and discounts
- Configure feature lists and limits
- Reorder plans by popularity

### 2. Payment Gateway Integration

For pay.tachles.dev or similar services:

```javascript
// Fetch payment plans for a product
const response = await fetch(`https://tachles.dev/api/public/payment-plans/my-product`);
const data = await response.json();

// Response includes:
// - product: Product details
// - plans: Array of active payment plans
// - metadata: Pricing summaries and capabilities
```

### 3. Demo and Testing

Visit `/payment-gateway-demo` to:
- Test the public API
- Preview how payment plans appear
- Copy API URLs for integration
- View raw JSON responses

## Integration with pay.tachles.dev

When users visit `pay.tachles.dev/{product-name}`, the payment gateway will:

1. Call `/api/public/payment-plans/{product-name}`
2. Display available plans with pricing
3. Show trial periods and discounts
4. Process payments based on selected plan
5. Handle recurring billing according to plan settings

## Best Practices

### Plan Design
- Create 2-4 plans maximum for clear choice architecture
- Use the "isPopular" flag on your recommended plan
- Include specific feature lists for each tier
- Set appropriate usage limits (users, storage, API calls)

### Pricing Strategy
- Use psychological pricing (e.g., $29.99 vs $30.00)
- Offer annual discounts (typically 20-30%)
- Consider trial periods for higher-tier plans
- Use temporary discounts for promotions

### Technical Implementation
- Test plans using the demo page before going live
- Cache API responses on the payment gateway side
- Handle currency conversion if supporting multiple regions
- Implement proper error handling for plan fetching

## Security and Access

- **Public API**: No authentication required, optimized for payment gateways
- **Management APIs**: Require user authentication via Clerk
- **CORS**: Enabled for public endpoints, restricted for management
- **Rate Limiting**: Recommended for production deployments

## Support and Integration

For technical support or custom integration requirements:
- Use the webhook system for payment notifications
- Implement proper error handling and fallbacks
- Monitor API response times and availability
- Test thoroughly before production deployment

This system provides the foundation for sophisticated payment processing while maintaining simplicity for end users.
