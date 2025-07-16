"use client";

import { useEffect } from 'react';

interface PerformanceMonitorProps {
  componentName: string;
  productId?: string;
}

export default function PerformanceMonitor({ componentName, productId }: PerformanceMonitorProps) {
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      if (duration > 100) { // Log if component takes more than 100ms
        console.log(`🐌 ${componentName}${productId ? ` (${productId})` : ''} took ${duration.toFixed(2)}ms to render`);
      } else {
        console.log(`⚡ ${componentName}${productId ? ` (${productId})` : ''} rendered in ${duration.toFixed(2)}ms`);
      }
    };
  }, [componentName, productId]);

  return null;
}
