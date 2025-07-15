# Hebrew Translation Implementation

This document outlines the complete Hebrew translation implementation for the Tachles.dev website.

## What Has Been Implemented

### 1. Translation Infrastructure
- **Translation System**: Created `/lib/translations.ts` with comprehensive Hebrew translations
- **React Hook**: Created `/hooks/use-translation.ts` for easy access to translations
- **Translation Component**: Created `/components/T.tsx` for declarative translation usage
- **RTL Wrapper**: Created `/components/RTLWrapper.tsx` for RTL layout support

### 2. Layout and Navigation
- **Root Layout**: Updated `app/layout.tsx` with Hebrew language (`lang="he"`) and RTL direction (`dir="rtl"`)
- **Navigation**: Updated `components/NavigationLayout.tsx` with Hebrew menu items
- **Global CSS**: Added RTL support and Hebrew font configurations in `app/globals.css`

### 3. Translated Components
- **Products Page**: `app/dashboard/products/page.tsx` - All UI text translated
- **Clients Page**: `app/dashboard/clients/page.tsx` - Form labels and UI text translated  
- **Product Form**: `components/ProductForm.tsx` - Form fields translated
- **Home Page**: `app/page.tsx` - Hero section and main content translated

### 4. Translation Categories

#### Navigation (`nav.*`)
- סקירה כללית (Overview)
- מוצרים (Products)
- לקוחות (Clients)
- חשבוניות (Invoices)
- תשלומים (Payments)
- מעקב זמן (Time Tracking)
- פניות (Tickets)
- הגדרות (Settings)

#### Dashboard (`dashboard.*`)
- סה״כ הכנסות (Total Revenue)
- הכנסות חודשיות (Monthly Revenue)
- סה״כ מוצרים (Total Products)
- לקוחות פעילים (Active Clients)

#### Products (`products.*`)
- מוצרים (Products)
- כל המוצרים (All Products)
- צור מוצר ראשון (Create First Product)
- ערוך מוצר (Edit Product)
- מחק מוצר (Delete Product)
- סטטוס (Status)
- דומיין (Domain)
- קטגוריה (Category)
- הכנסות (Revenue)
- מנויים (Subscriptions)

#### Forms (`forms.*`)
- שם (Name)
- תיאור (Description)
- אימייל (Email)
- טלפון (Phone)
- חברה (Company)
- כתובת (Address)
- שמור (Save)
- בטל (Cancel)
- ערוך (Edit)
- מחק (Delete)

#### Actions (`actions.*`)
- חיפוש (Search)
- סינון (Filter)
- מיון (Sort)
- ייצוא (Export)
- רענן (Refresh)
- טוען... (Loading)
- צפה בפרטים (View Details)

## Key Features

### RTL Support
- Automatic RTL direction for Hebrew text
- Mirrored layout components
- Hebrew font integration (Heebo, Assistant, Rubik)
- CSS adjustments for proper spacing in RTL

### Translation Hook Usage
```tsx
import { useTranslation } from '@/hooks/use-translation';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('nav.products')}</h1>
      <p>{t('dashboard.totalRevenue')}</p>
    </div>
  );
}
```

### Translation Component Usage
```tsx
import T from '@/components/T';

function MyComponent() {
  return (
    <div>
      <T k="nav.products" />
      <T k="products.revenue" values={{amount: 1500}} />
    </div>
  );
}
```

## What's Included

### Fully Translated
✅ Main navigation menu
✅ Dashboard overview
✅ Products management page
✅ Clients management page
✅ Product creation/editing forms
✅ Client creation/editing forms
✅ Home page hero section
✅ Action buttons and status messages

### Font Support
✅ Hebrew fonts configured (Heebo, Assistant, Rubik)
✅ RTL layout support
✅ Proper text direction

## Usage Instructions

1. **Adding New Translations**: Add new keys to `/lib/translations.ts`
2. **Using in Components**: Import `useTranslation` hook and use `t()` function
3. **For New Pages**: Import the translation hook and replace hardcoded strings
4. **RTL Layout**: Wrap components with `RTLWrapper` if needed

## Example: Adding a New Translation

1. Add to translations file:
```typescript
// lib/translations.ts
export const translations = {
  // ... existing translations
  newSection: {
    title: "כותרת חדשה",
    description: "תיאור חדש"
  }
};
```

2. Use in component:
```tsx
function NewComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('newSection.title')}</h1>
      <p>{t('newSection.description')}</p>
    </div>
  );
}
```

The entire UI is now ready for Hebrew-speaking users with proper RTL support and comprehensive translations.
