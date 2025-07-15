"use client";

// Test the webhook setup API
export default function TestWebhookAPI() {
  const testCreateWebhook = async () => {
    try {
      // First, get available events
      const eventsResponse = await fetch('/api/webhooks/setup');
      const eventsData = await eventsResponse.json();
      console.log('Available events:', eventsData);

      // Then create a test webhook
      const createResponse = await fetch('/api/webhooks/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: 'test-product-id',
          url: 'https://example.com/webhook',
          events: ['payment.completed', 'payment.failed'],
          description: 'Test webhook for API verification',
        }),
      });

      const createData = await createResponse.json();
      console.log('Create webhook response:', createData);
    } catch (error) {
      console.error('Test error:', error);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Webhook API Test</h1>
      <button 
        onClick={testCreateWebhook}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Test Webhook Creation API
      </button>
      <p className="mt-4 text-sm text-gray-600">
        Check the browser console for API responses.
      </p>
    </div>
  );
}
