// Test page to verify payment system routing
import { headers } from 'next/headers';

export default async function TestPaymentRouting() {
  const headersList = await headers();
  const host = headersList.get("host") || "";
  const productName = headersList.get("x-product-name");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">Payment System Routing Test</h1>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded">
              <h3 className="font-semibold text-gray-700">Host</h3>
              <p className="text-sm text-gray-600">{host}</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded">
              <h3 className="font-semibold text-gray-700">Product Name (from middleware)</h3>
              <p className="text-sm text-gray-600">{productName || 'Not detected'}</p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
            <h3 className="font-semibold text-blue-800 mb-2">How It Works Now:</h3>
            <ol className="text-sm text-blue-700 space-y-1">
              <li>1. Middleware detects payment subdomain requests</li>
              <li>2. Middleware rewrites URL and sets product name header</li>
              <li>3. Page component validates product exists in database</li>
              <li>4. Shows payment page or 404 based on validation</li>
            </ol>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-800 mb-2">Testing URLs:</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• <strong>Valid Product</strong>: /pay/mitnadvim</li>
              <li>• <strong>Invalid Product</strong>: /pay/invalid-product</li>
              <li>• <strong>Root Pay Page</strong>: /pay/</li>
            </ul>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-800 mb-2">Middleware Status:</h3>
            <p className="text-sm text-green-700">
              {productName ? 
                '✅ URL rewriting is working! Product name detected by middleware.' : 
                '⚠️ No product name detected. This might be a direct route access.'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
