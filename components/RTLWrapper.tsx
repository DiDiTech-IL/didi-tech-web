import React from 'react';
import { useTranslation } from '@/hooks/use-translation';

interface RTLWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function RTLWrapper({ children, className = "" }: RTLWrapperProps) {
  const { direction, isRTL } = useTranslation();
  
  return (
    <div 
      dir={direction}
      className={`${isRTL ? 'text-right' : 'text-left'} ${className}`}
      style={{ direction }}
    >
      {children}
    </div>
  );
}

export default RTLWrapper;
