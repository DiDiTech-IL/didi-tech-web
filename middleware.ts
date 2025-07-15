import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-up(.*)",
  "/pay/(.*)", // Payment pages (includes payment-success and invoice)
  "/api/public/(.*)", // Public API routes
  "/api/payments/create", // Payment creation
  "/api/pay/(.*)", // Payment API routes
  "/api/webhooks/(.*)", // Webhook endpoints
  "/api/find-invoice", // Invoice finder API
]);

// Payment subdomain configuration
const PAYMENT_HOSTNAMES = [
  "pay.tachles.dev",
  "pay.localhost:3000", // For development
];

// Helper to check if a hostname is a payment subdomain
const isPaymentHostname = (hostname: string) =>
  PAYMENT_HOSTNAMES.includes(hostname) || hostname.startsWith("pay.");



export default clerkMiddleware(async (auth, req) => {
  try {
    const url = req.nextUrl;
    const hostname = req.headers.get("host") || "";

    // ----------------------------------------------------
    // Part 1: Payment Subdomain Handling
    // ----------------------------------------------------

    if (isPaymentHostname(hostname)) {
      const pathSegments = url.pathname.split("/").filter(Boolean);

      // If accessing root pay domain (pay.tachles.dev/)
      if (pathSegments.length === 0) {
        // Allow access to the payment landing page
        return NextResponse.next();
      }

      // If accessing a product page (pay.tachles.dev/productName)
      if (pathSegments.length === 1) {
        const productName = pathSegments[0];

        // Rewrite to the dynamic route - product validation will happen in the page component
        const newUrl = new URL(`/pay/${productName}`, url.origin);

        // Set custom headers for easy access to product info
        const newHeaders = new Headers(req.headers);
        newHeaders.set("x-product-name", productName);

        return NextResponse.rewrite(newUrl, {
          request: { headers: newHeaders },
        });
      }

      // For other paths on payment subdomain, allow them through
      // (this handles routes like /pay/[productName]/success, etc.)
      return NextResponse.next();
    }

    // ----------------------------------------------------
    // Part 2: Main Domain Authentication
    // ----------------------------------------------------

    if (!isPublicRoute(req)) {
      await auth.protect();
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);
    // Fallback to allowing the request through on error
    return NextResponse.next();
  }
});
export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
