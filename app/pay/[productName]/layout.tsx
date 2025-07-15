import { getProductByNameEn } from "@/lib/services/product-service";
import Logo from "@/public/תכל’ס.png";
import { ProductStatus } from "@prisma/client";
import { Metadata } from "next";
import { headers } from "next/headers";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
interface PayLayoutProps {
    children: React.ReactNode;
    params: Promise<{ productName: string }>;
}

// Generate metadata for payment pages
export async function generateMetadata({ params }: { params: Promise<{ productName: string }> }): Promise<Metadata> {
    const { productName } = await params;
    try {
        const product = await getProductByName(productName);

        if (!product) {
            return {
                title: "מוצר לא נמצא - תשלום תכל'ס",
                description: "המוצר המבוקש לא נמצא במערכת.",
                robots: "noindex, nofollow"
            };
        }

        const title = `רכישת ${product.name} - תשלום תכל'ס`;
        const description = product.description.length > 160
            ? `${product.description.substring(0, 157)}...`
            : product.description;

        return {
            title,
            description,
            openGraph: {
                title,
                description,
                type: "website",
                siteName: "תכל'ס",
                url: `https://pay.tachles.dev/${productName}`,
            },
            twitter: {
                card: "summary",
                title,
                description,
            },
            other: {
                'payment-product': productName,
                'product-category': product.category || 'תוכנה',
                'product-status': product.status,
            },
            robots: "noindex, nofollow", // Prevent payment pages from being indexed
        };
    } catch (error) {
        console.error('Error generating metadata:', error);
        return {
            title: "תשלום - תכל'ס",
            description: "עיבוד תשלומים מאובטח עבור מוצרי ושירותי תכל'ס.",
            robots: "noindex, nofollow"
        };
    }
}

// Fetch product by English name from database
async function getProductByName(nameEn: string) {
    try {
        const product = await getProductByNameEn(nameEn);
        return product;
    } catch (error) {
        console.error('Error fetching product:', error);
        return null;
    }
}

export default async function PayLayout({
    children,
    params,
}: PayLayoutProps) {
    const headersList = await headers();
    const host = headersList.get("host") || "";
    const { productName } = await params;

    // Check if this is the pay subdomain - if not, redirect to main site
    const isPaySubdomain = host === 'pay.tachles.dev' || host.startsWith('pay.');
    if (!isPaySubdomain) {
        redirect('https://www.tachles.dev');
    }

    // Check if product exists in database
    const product = await getProductByName(productName);
    if (!product) {
        console.log(`Product not found for nameEn: ${productName}`);
        notFound();
    }

    // Ensure product is available for purchase (not retired or in development)
    if (product.status === ProductStatus.DEVELOPMENT || product.status === ProductStatus.RETIRED) {
        console.log(`Product ${productName} is not available for purchase (status: ${product.status})`);
        notFound();
    }

    return (
        <div
            dir="rtl" // Hebrew text direction
            data-product={productName} // Product nameEn for client-side access
            data-product-id={product.id} // Product ID for API calls
            data-product-name={product.name} // Product display name
            data-product-status={product.status} // Product status for conditional rendering
        >

            <main className="container mx-auto p-4 font-heebo rounded-2xl">
                {/* Add a subtle header for context */}
                <div className="text-center">
                    <div className="inline-flex items-center px-4 py-2 rounded-full border border-sky-700 text-blue-800 text-sm font-medium mb-4">
                        תשלום עבור
                        <Image src={Logo} alt="תכל'ס" height={16} className="mr-2" />
                    </div>

                    {product.category && (
                        <div className="text-sm text-slate-500 mt-1 font-rubik">
                            {product.category}
                        </div>
                    )}
                </div>

                {children}
            </main>
        </div>
    );
}
