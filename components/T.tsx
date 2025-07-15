import React from 'react';
import { useTranslation } from '@/hooks/use-translation';

interface TProps {
  k: string; // Translation key
  values?: Record<string, string | number>; // For interpolation
  children?: React.ReactNode;
}

/**
 * Translation component that renders translated text
 * Usage: <T k="nav.overview" />
 * Usage with interpolation: <T k="products.revenue" values={{amount: 1500}} />
 */
export function T({ k, values, children }: TProps) {
  const { t } = useTranslation();
  
  let translatedText = t(k);
  
  // Simple interpolation
  if (values) {
    Object.entries(values).forEach(([key, value]) => {
      translatedText = translatedText.replace(`{${key}}`, String(value));
    });
  }
  
  // If children are provided, they take precedence (for fallback)
  if (children && translatedText === k) {
    return <>{children}</>;
  }
  
  return <>{translatedText}</>;
}

export default T;
