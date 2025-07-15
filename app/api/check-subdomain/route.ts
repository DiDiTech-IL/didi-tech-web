import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { subdomain, productId, productName } = await request.json();

    if (!subdomain || (!productId && !productName)) {
      return NextResponse.json(
        { available: false, error: 'Subdomain and product identifier are required' },
        { status: 400 }
      );
    }

    // Get product details
    let product;
    if (productId) {
      product = await prisma.product.findUnique({
        where: { id: productId },
        select: { id: true, name: true, domain: true }
      });
    } else {
      product = await prisma.product.findFirst({
        where: { 
          name: { 
            contains: productName, 
            mode: 'insensitive' 
          } 
        },
        select: { id: true, name: true, domain: true }
      });
    }

    if (!product) {
      return NextResponse.json(
        { available: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check if subdomain is already taken in our database
    const existingSubscription = await prisma.productSubscription.findFirst({
      where: {
        productId: product.id,
        // Check if subdomain exists in the plan field or other relevant field
        plan: {
          contains: subdomain
        },
        status: {
          in: ['ACTIVE', 'TRIAL']
        }
      }
    });

    if (existingSubscription) {
      return NextResponse.json({
        available: false,
        error: 'This subdomain is already taken'
      });
    }

    // Additional validation
    if (!subdomain.match(/^[a-z0-9-]+$/)) {
      return NextResponse.json({
        available: false,
        error: 'Subdomain can only contain lowercase letters, numbers, and hyphens'
      });
    }

    if (subdomain.length < 3 || subdomain.length > 63) {
      return NextResponse.json({
        available: false,
        error: 'Subdomain must be between 3 and 63 characters'
      });
    }

    // Reserved subdomains
    const reserved = ['www', 'api', 'app', 'admin', 'mail', 'support', 'help', 'blog', 'docs'];
    if (reserved.includes(subdomain)) {
      return NextResponse.json({
        available: false,
        error: 'This subdomain is reserved'
      });
    }

    // Perform health check if product has a domain configured
    if (product.domain) {
      const fullDomain = `${subdomain}.${product.domain}`;
      let isLive = false;
      let healthCheckError = null;

      try {
        // Try both HTTPS and HTTP
        const protocols = ['https', 'http'];
        
        for (const protocol of protocols) {
          try {
            const healthCheckUrl = `${protocol}://${fullDomain}`;
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

            const response = await fetch(healthCheckUrl, {
              method: 'HEAD',
              signal: controller.signal,
              headers: {
                'User-Agent': 'Tachles-Subdomain-Checker/1.0'
              }
            });

            clearTimeout(timeoutId);

            // If we get any successful response, something is running on this subdomain
            if (response.status >= 200 && response.status < 500) {
              isLive = true;
              break;
            }
          } catch {
            // Continue to next protocol if this one fails
            continue;
          }
        }
      } catch (error) {
        healthCheckError = error instanceof Error ? error.message : 'Unknown error';
        console.log('Health check error (non-fatal):', healthCheckError);
      }

      // If something is live on this subdomain, it's not available
      if (isLive) {
        return NextResponse.json({
          available: false,
          error: 'An application is already running on this subdomain',
          fullDomain
        });
      }
    }

    // Subdomain is available
    return NextResponse.json({
      available: true,
      subdomain,
      fullDomain: product.domain ? `${subdomain}.${product.domain}` : null,
      message: 'Subdomain is available'
    });

  } catch (error) {
    console.error('Error checking subdomain:', error);
    return NextResponse.json(
      { available: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
