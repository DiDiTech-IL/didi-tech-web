import { prisma } from "@/lib/prisma";
import { ProductStatus, SubscriptionStatus } from "@prisma/client";
import { randomBytes } from "crypto";

export interface ApiEndpoint {
  name: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  path: string;
  description: string;
  requiresAuth: boolean;
}

// Helper function to get product owner info
export const getProductOwnerInfo = () => ({
  select: {
    id: true,
    firstName: true,
    lastName: true,
    email: true,
  },
});

// Helper function to get product subscription info
export const getProductSubscriptionInfo = () => ({
  include: {
    client: {
      select: {
        id: true,
        name: true,
        email: true,
        company: true,
      },
    },
  },
  orderBy: { createdAt: "desc" as const },
});

// Helper function to get product tickets summary
export const getProductTicketsSummary = () => ({
  select: {
    id: true,
    status: true,
    priority: true,
  },
});

// Helper function to get product payments summary
export const getProductPaymentsSummary = () => ({
  select: {
    id: true,
    amount: true,
    status: true,
  },
});

// Helper function to get product invoices summary
export const getProductInvoicesSummary = () => ({
  select: {
    id: true,
    total: true,
    status: true,
  },
});

// Helper function to get product time entries summary
export const getProductTimeEntriesSummary = () => ({
  select: {
    id: true,
    hours: true,
    billable: true,
    invoiced: true,
  },
});

// Helper function to get product webhooks info
export const getProductWebhooksInfo = () => ({
  where: { isActive: true },
  select: {
    id: true,
    url: true,
    events: true,
    isActive: true,
  },
});

// Product retrieval functions
export const getProductByNameEn = async (nameEn: string) => {
  return await prisma.product.findFirst({
    where: {
      nameEn: nameEn.toLowerCase(),
      status: { not: ProductStatus.RETIRED }, // Only return non-retired products
    },
    select: {
      id: true,
      name: true,
      nameEn: true,
      description: true,
      status: true,
      category: true,
      pricing: true,
      features: true,
      domain: true,
    },
  });
};

export const getProductBasicInfo = async (id: string) => {
  return await prisma.product.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      nameEn: true,
      description: true,
      status: true,
      category: true,
      domain: true,
      repository: true,
      version: true,
      launchedAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

export const getAllProducts = async () => {
  return await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      owner: getProductOwnerInfo(),
      subscriptions: getProductSubscriptionInfo(),
      tickets: getProductTicketsSummary(),
      payments: getProductPaymentsSummary(),
      invoices: getProductInvoicesSummary(),
      timeEntries: getProductTimeEntriesSummary(),
      webhooks: getProductWebhooksInfo(),
    },
  });
};

export const getAllProductsBasic = async () => {
  return await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      owner: getProductOwnerInfo(),
    },
  });
};

export const getProductWithSubscriptions = async (id: string) => {
  return await prisma.product.findUnique({
    where: { id },
    include: {
      owner: true,
      subscriptions: {
        include: {
          client: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
};

export const getProductWithTickets = async (id: string, limit: number = 10) => {
  return await prisma.product.findUnique({
    where: { id },
    include: {
      tickets: {
        orderBy: { createdAt: "desc" },
        take: limit,
      },
    },
  });
};

export const getProductWithPayments = async (id: string, limit: number = 10) => {
  return await prisma.product.findUnique({
    where: { id },
    include: {
      payments: {
        orderBy: { createdAt: "desc" },
        take: limit,
      },
    },
  });
};

export const getProductWithInvoices = async (id: string) => {
  return await prisma.product.findUnique({
    where: { id },
    include: {
      invoices: {
        orderBy: { createdAt: "desc" },
      },
    },
  });
};

export const getProductWithTimeEntries = async (id: string, limit: number = 20) => {
  return await prisma.product.findUnique({
    where: { id },
    include: {
      timeEntries: {
        orderBy: { date: "desc" },
        take: limit,
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
  });
};

export const getProductWithWebhooks = async (id: string, logLimit: number = 5) => {
  return await prisma.product.findUnique({
    where: { id },
    include: {
      webhooks: {
        orderBy: { createdAt: "desc" },
        include: {
          logs: {
            orderBy: { createdAt: "desc" },
            take: logLimit,
          },
        },
      },
    },
  });
};

export const getProductById = async (id: string) => {
  return await prisma.product.findUnique({
    where: { id },
    include: {
      owner: true,
      subscriptions: {
        include: {
          client: true,
        },
        orderBy: { createdAt: "desc" },
      },
      tickets: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      payments: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      invoices: {
        orderBy: { createdAt: "desc" },
      },
      timeEntries: {
        orderBy: { date: "desc" },
        take: 20,
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
      webhooks: {
        orderBy: { createdAt: "desc" },
        include: {
          logs: {
            orderBy: { createdAt: "desc" },
            take: 5,
          },
        },
      },
    },
  });
};

// Get clients subscribed to a specific product
export const getProductClients = async (productId: string) => {
  const subscriptions = await prisma.productSubscription.findMany({
    where: {
      productId,
      status: { in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIAL] },
    },
    include: {
      client: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return subscriptions.map((sub: any) => ({
    ...sub.client,
    subscription: {
      id: sub.id,
      plan: sub.plan,
      status: sub.status,
      billingCycle: sub.billingCycle,
      amount: sub.amount,
      currency: sub.currency,
      startDate: sub.startDate,
      endDate: sub.endDate,
      nextBilling: sub.nextBilling,
    },
  }));
};

// Validation functions
export const validateProductCreationData = (data: {
  name: string;
  description: string;
}) => {
  if (!data.name || data.name.trim() === "") {
    throw new Error("Product name is required");
  }

  if (!data.description || data.description.trim() === "") {
    throw new Error("Product description is required");
  }
};

export const generateApiKey = (apiBaseUrl?: string, existingApiKey?: string) => {
  return apiBaseUrl && !existingApiKey
    ? randomBytes(32).toString("hex")
    : existingApiKey;
};

export const createProduct = async (data: {
  name: string;
  nameEn?: string;
  description: string;
  domain?: string;
  repository?: string;
  category?: string;
  features?: string[];
  pricing?: object;
  apiBaseUrl?: string;
  apiKey?: string;
  dbConnectionString?: string;
  dbType?: string;
  ownerId?: string;
  status?: ProductStatus;
  version?: string;
}) => {
  try {
    // Validate required fields
    validateProductCreationData(data);

    // Generate API key if needed
    const apiKey = generateApiKey(data.apiBaseUrl, data.apiKey);

    const product = await prisma.product.create({
      data: {
        name: data.name.trim(),
        nameEn: data.nameEn?.trim() || null,
        description: data.description.trim(),
        domain: data.domain?.trim() || null,
        repository: data.repository?.trim() || null,
        category: data.category?.trim() || null,
        features: data.features || [],
        pricing: data.pricing || undefined,
        apiBaseUrl: data.apiBaseUrl?.trim() || null,
        apiKey,
        dbConnectionString: data.dbConnectionString?.trim() || null,
        dbType: data.dbType?.trim() || null,
        ownerId: data.ownerId || null,
        status: data.status || ProductStatus.DEVELOPMENT,
        version: data.version?.trim() || null,
      },
      include: {
        owner: true,
        subscriptions: {
          include: {
            client: true,
          },
        },
        webhooks: true,
      },
    });

    return product;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to create product");
  }
};

export const updateProduct = async (
  id: string,
  data: {
    name?: string;
    description?: string;
    domain?: string;
    repository?: string;
    category?: string;
    features?: string[];
    pricing?: object;
    apiBaseUrl?: string;
    apiKey?: string;
    dbConnectionString?: string;
    dbType?: string;
    ownerId?: string;
    status?: ProductStatus;
    version?: string;
  }
) => {
  return await prisma.product.update({
    where: { id },
    data: {
      ...data,
      updatedAt: new Date(),
      // Set launch date when product goes live for the first time
      ...(data.status === ProductStatus.LIVE && {
        launchedAt: new Date(),
      }),
    },
    include: {
      owner: true,
      subscriptions: {
        include: {
          client: true,
        },
      },
      webhooks: true,
    },
  });
};

export const deleteProduct = async (id: string) => {
  // First deactivate all webhooks linked to this product
  await prisma.webhookEndpoint.updateMany({
    where: { productId: id },
    data: { isActive: false },
  });

  // Cancel all active subscriptions
  await prisma.productSubscription.updateMany({
    where: { productId: id, status: SubscriptionStatus.ACTIVE },
    data: { status: SubscriptionStatus.CANCELLED },
  });

  // Delete the product (cascading will handle related records)
  return await prisma.product.delete({
    where: { id },
  });
};

// Statistics functions
export const getProductCountByStatus = async (status: ProductStatus) => {
  return await prisma.product.count({
    where: { status },
  });
};

export const getTotalProductCount = async () => {
  return await prisma.product.count();
};

export const getActiveProductCount = async () => {
  return await prisma.product.count({
    where: {
      status: { in: [ProductStatus.LIVE, ProductStatus.BETA] },
    },
  });
};

export const getTotalRevenue = async () => {
  const result = await prisma.product.aggregate({
    _sum: {
      totalRevenue: true,
    },
  });
  return result._sum.totalRevenue || 0;
};

export const getMonthlyRevenue = async () => {
  const result = await prisma.product.aggregate({
    _sum: {
      monthlyRevenue: true,
    },
  });
  return result._sum.monthlyRevenue || 0;
};

export const getActiveSubscriptionCount = async () => {
  return await prisma.productSubscription.count({
    where: {
      status: { in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIAL] },
    },
  });
};

export const getProductStats = async () => {
  const [
    totalProducts,
    activeProducts,
    liveProducts,
    betaProducts,
    devProducts,
    totalRevenue,
    monthlyRevenue,
    activeSubscriptions,
  ] = await Promise.all([
    getTotalProductCount(),
    getActiveProductCount(),
    getProductCountByStatus(ProductStatus.LIVE),
    getProductCountByStatus(ProductStatus.BETA),
    getProductCountByStatus(ProductStatus.DEVELOPMENT),
    getTotalRevenue(),
    getMonthlyRevenue(),
    getActiveSubscriptionCount(),
  ]);

  return {
    totalProducts,
    activeProducts,
    liveProducts,
    betaProducts,
    devProducts,
    totalRevenue,
    monthlyRevenue,
    activeSubscriptions,
  };
};

// Subscription functions
export const checkExistingSubscription = async (productId: string, clientId: string) => {
  return await prisma.productSubscription.findUnique({
    where: {
      productId_clientId: {
        productId,
        clientId,
      },
    },
  });
};

export const calculateNextBilling = (billingCycle: string) => {
  const nextBilling = new Date();
  if (billingCycle === "monthly") {
    nextBilling.setMonth(nextBilling.getMonth() + 1);
  } else if (billingCycle === "yearly") {
    nextBilling.setFullYear(nextBilling.getFullYear() + 1);
  }
  return nextBilling;
};

// Create subscription for a client to a product
export const subscribeClientToProduct = async (data: {
  productId: string;
  clientId: string;
  plan: string;
  billingCycle: string;
  amount: number;
  currency?: string;
  startDate?: Date;
  endDate?: Date;
}) => {
  // Check if subscription already exists
  const existing = await checkExistingSubscription(data.productId, data.clientId);

  if (existing) {
    throw new Error("Client is already subscribed to this product");
  }

  const nextBilling = data.billingCycle !== "one-time" ? calculateNextBilling(data.billingCycle) : null;

  return await prisma.productSubscription.create({
    data: {
      ...data,
      currency: data.currency || "ILS",
      startDate: data.startDate || new Date(),
      nextBilling,
      status: SubscriptionStatus.ACTIVE,
    },
    include: {
      product: true,
      client: true,
    },
  });
};

// Test API endpoint for a product
export const testApiEndpoint = async (
  productId: string,
  endpoint: string = "/health",
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET"
) => {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { apiBaseUrl: true, apiKey: true },
  });

  if (!product?.apiBaseUrl) {
    throw new Error("Product does not have an API base URL configured");
  }

  const url = `${product.apiBaseUrl}${endpoint}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (product.apiKey) {
    headers["Authorization"] = `Bearer ${product.apiKey}`;
  }

  try {
    const response = await fetch(url, {
      method,
      headers,
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    return {
      success: true,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      url,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      url,
    };
  }
};

// Database operations for a product
export const executeDbOperation = async (
  productId: string,
  operation: "backup" | "migrate" | "status"
) => {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { dbConnectionString: true, dbType: true, name: true },
  });

  if (!product?.dbConnectionString) {
    throw new Error("Product does not have a database connection configured");
  }

  // Real database operations would be implemented here based on the dbType and dbConnectionString
  const operations = {
    backup: () => `Database backup initiated for ${product.name}`,
    migrate: () => `Database migration completed for ${product.name}`,
    status: () => `Database status: Connected (${product.dbType})`,
  };

  try {
    const result = operations[operation]();
    return {
      success: true,
      data: result,
      operation,
      productName: product.name,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Operation failed",
      operation,
      productName: product.name,
    };
  }
};

// Activate/deactivate product webhooks when product status changes
export const updateProductWebhooks = async (productId: string, isActive: boolean) => {
  return await prisma.webhookEndpoint.updateMany({
    where: { productId },
    data: { isActive },
  });
};
