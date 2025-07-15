"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSubdomainCheck } from "@/hooks/use-subdomain-check";
import { AlertCircle, CheckCircle, Loader2, X } from "lucide-react";

export default function SubdomainTestPage() {
  const subdomainCheck = useSubdomainCheck({
    productName: "test-product", // You can change this to test with actual products
    debounceMs: 500,
    minLength: 3
  });

  return (
    <div className="container mx-auto p-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Subdomain Availability Checker</CardTitle>
          <p className="text-sm text-slate-600">
            Test the debounced subdomain availability checker
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="subdomain-test">Test Subdomain</Label>
            <div className="relative">
              <Input
                id="subdomain-test"
                value={subdomainCheck.subdomain}
                onChange={(e) => subdomainCheck.updateSubdomain(e.target.value)}
                placeholder="mycompany"
                className={`pr-10 ${
                  subdomainCheck.result 
                    ? subdomainCheck.isAvailable 
                      ? 'border-green-500' 
                      : 'border-red-500'
                    : ''
                }`}
              />
              <div className="absolute inset-y-0 right-3 flex items-center">
                {subdomainCheck.isChecking && (
                  <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                )}
                {!subdomainCheck.isChecking && subdomainCheck.result && (
                  <>
                    {subdomainCheck.isAvailable ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <X className="h-4 w-4 text-red-500" />
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {subdomainCheck.fullDomain && (
            <p className="text-sm text-slate-600">
              Full domain: <span className="font-mono">{subdomainCheck.fullDomain}</span>
            </p>
          )}

          {subdomainCheck.result && (
            <div className={`p-3 rounded text-sm ${
              subdomainCheck.isAvailable 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {subdomainCheck.isAvailable ? (
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>✓ Subdomain is available!</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4" />
                  <span>{subdomainCheck.errorMessage}</span>
                </div>
              )}
            </div>
          )}

          <Button 
            onClick={subdomainCheck.manualCheck}
            disabled={!subdomainCheck.subdomain || subdomainCheck.isChecking}
            className="w-full"
          >
            Manual Check
          </Button>

          <div className="text-xs text-slate-500 space-y-1">
            <p><strong>Status:</strong> {subdomainCheck.isChecking ? 'Checking...' : 'Idle'}</p>
            <p><strong>Subdomain:</strong> {subdomainCheck.subdomain || 'None'}</p>
            <p><strong>Available:</strong> {subdomainCheck.isAvailable ? 'Yes' : 'No'}</p>
            <p><strong>Has Error:</strong> {subdomainCheck.hasError ? 'Yes' : 'No'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
