import { t } from '@/lib/translations';

export function useTranslation() {
  return {
    t,
    isRTL: true,
    direction: 'rtl' as const,
    locale: 'he'
  };
}
