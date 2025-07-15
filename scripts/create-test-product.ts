// Script to create a test product for testing the payment system
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createTestProduct() {
  try {
    // Check if mitnadvim product already exists
    const existingProduct = await prisma.product.findFirst({
      where: {
        OR: [
          { name: 'mitnadvim' },
          { nameEn: 'mitnadvim' }
        ]
      }
    });

    if (existingProduct) {
      console.log('Product "mitnadvim" already exists:', existingProduct.id);
      return existingProduct;
    }

    // Create the test product
    const product = await prisma.product.create({
      data: {
        name: 'מתנדבים',
        nameEn: 'mitnadvim',
        description: 'מערכת ניהול מתנדבים מתקדמת',
        status: 'LIVE',
        category: 'ניהול',
        features: [
          'ניהול מתנדבים',
          'מעקב פעילויות',
          'דוחות מתקדמים',
          'התראות אוטומטיות'
        ],
        domain: 'mitnadvim.com',
        pricing: 99,
        ownerId: 'test-owner'
      }
    });

    // Create payment plans for the product
    await prisma.paymentPlan.createMany({
      data: [
        {
          productId: product.id,
          name: 'תוכנית בסיסית',
          description: 'עד 100 מתנדבים',
          planType: 'RECURRING',
          price: 99,
          currency: 'ILS',
          billingInterval: 'MONTHLY',
          features: [
            'עד 100 מתנדבים',
            'דוחות בסיסיים',
            'תמיכה באימייל'
          ],
          userLimit: 100,
          isActive: true,
          displayOrder: 1
        },
        {
          productId: product.id,
          name: 'תוכנית מתקדמת',
          description: 'עד 500 מתנדבים',
          planType: 'RECURRING',
          price: 199,
          currency: 'ILS',
          billingInterval: 'MONTHLY',
          features: [
            'עד 500 מתנדבים',
            'דוחות מתקדמים',
            'אינטגרציות',
            'תמיכה טלפונית'
          ],
          userLimit: 500,
          isPopular: true,
          isActive: true,
          displayOrder: 2
        },
        {
          productId: product.id,
          name: 'תוכנית ארגונית',
          description: 'ללא הגבלת מתנדבים',
          planType: 'RECURRING',
          price: 399,
          currency: 'ILS',
          billingInterval: 'MONTHLY',
          features: [
            'ללא הגבלת מתנדבים',
            'דוחות מותאמים אישית',
            'API מלא',
            'מנהל חשבון ייעודי'
          ],
          isActive: true,
          displayOrder: 3
        }
      ]
    });

    console.log('Test product "mitnadvim" created successfully:', product.id);
    return product;

  } catch (error) {
    console.error('Error creating test product:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  createTestProduct()
    .then(() => {
      console.log('Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

export default createTestProduct;
