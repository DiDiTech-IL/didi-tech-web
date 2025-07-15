import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';

interface SubdomainCheckResult {
  available: boolean;
  error?: string;
  fullDomain?: string;
  message?: string;
}

interface UseSubdomainCheckOptions {
  productId?: string;
  productName?: string;
  debounceMs?: number;
  minLength?: number;
}

export function useSubdomainCheck(options: UseSubdomainCheckOptions = {}) {
  const { 
    productId, 
    productName, 
    debounceMs = 500, 
    minLength = 3 
  } = options;
  
  const { toast } = useToast();
  
  const [subdomain, setSubdomain] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<SubdomainCheckResult | null>(null);
  const [lastChecked, setLastChecked] = useState('');

  const checkSubdomain = useCallback(async (subdomainToCheck: string) => {
    if (!subdomainToCheck || subdomainToCheck.length < minLength) {
      setResult(null);
      return;
    }

    if (!productId && !productName) {
      console.error('Either productId or productName must be provided');
      return;
    }

    setIsChecking(true);
    setLastChecked(subdomainToCheck);

    try {
      const response = await fetch('/api/check-subdomain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subdomain: subdomainToCheck,
          productId,
          productName
        })
      });

      const data: SubdomainCheckResult = await response.json();
      
      // Only update result if this is still the current subdomain being checked
      if (subdomainToCheck === lastChecked) {
        setResult(data);
        
        // Show toast for errors but not for successful checks to avoid spam
        if (!data.available && data.error) {
          toast({
            title: "Subdomain Not Available",
            description: data.error,
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('Error checking subdomain:', error);
      if (subdomainToCheck === lastChecked) {
        setResult({
          available: false,
          error: 'Failed to check subdomain availability'
        });
        
        toast({
          title: "Check Failed",
          description: "Unable to verify subdomain availability",
          variant: "destructive",
        });
      }
    } finally {
      setIsChecking(false);
    }
  }, [productId, productName, minLength, lastChecked, toast]);

  // Debounced effect
  useEffect(() => {
    if (!subdomain || subdomain.length < minLength) {
      setResult(null);
      return;
    }

    const timeoutId = setTimeout(() => {
      checkSubdomain(subdomain);
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [subdomain, debounceMs, minLength, checkSubdomain]);

  const updateSubdomain = useCallback((newSubdomain: string) => {
    // Clean the subdomain input
    const cleanedSubdomain = newSubdomain
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '')
      .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
      .replace(/-{2,}/g, '-'); // Replace multiple consecutive hyphens with single hyphen
    
    setSubdomain(cleanedSubdomain);
    
    // Clear previous result if subdomain changed
    if (cleanedSubdomain !== lastChecked) {
      setResult(null);
    }
  }, [lastChecked]);

  const manualCheck = useCallback(() => {
    if (subdomain) {
      checkSubdomain(subdomain);
    }
  }, [subdomain, checkSubdomain]);

  return {
    subdomain,
    updateSubdomain,
    isChecking,
    result,
    manualCheck,
    isAvailable: result?.available === true,
    hasError: result?.available === false,
    errorMessage: result?.error,
    fullDomain: result?.fullDomain
  };
}
