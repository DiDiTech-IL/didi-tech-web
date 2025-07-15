// Test script for Tachles webhook integration
// Run with: npm run test-webhook

import crypto from 'crypto';

const WEBHOOK_URL = 'http://localhost:3000/api/webhooks/tachles';
const WEBHOOK_SECRET = 'dev_webhook_secret_123'; // Use your actual secret

function createSignature(payload: string, secret: string): string {
  return crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
}

async function testDomainActivation() {
  const payload = {
    event: "domain.activated",
    leadId: `test_lead_${Date.now()}`,
    tachlesCustomerId: `test_customer_${Date.now()}`,
    domainInfo: {
      subdomain: "test-company",
      organizationName: "Test Company Ltd",
      contactEmail: "admin@testcompany.com",
      contactName: "John Doe",
      contactPhone: "+972501234567",
      subscriptionPlan: "ADVANCED"
    },
    timestamp: new Date().toISOString(),
    signature: "test_signature"
  };

  const payloadString = JSON.stringify(payload);
  const signature = createSignature(payloadString, WEBHOOK_SECRET);

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-tachles-signature': signature
      },
      body: payloadString
    });

    const result = await response.json();
    
    console.log('Status:', response.status);
    console.log('Response:', result);
    
    if (response.ok) {
      console.log('✅ Domain activation test passed');
    } else {
      console.log('❌ Domain activation test failed');
    }
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

async function testDomainSuspension() {
  const payload = {
    event: "domain.suspended",
    leadId: "test_lead_123",
    tachlesCustomerId: "test_customer_456",
    domainInfo: {
      subdomain: "test-company",
      organizationName: "Test Company Ltd",
      contactEmail: "admin@testcompany.com",
      contactName: "John Doe",
      contactPhone: "+972501234567",
      subscriptionPlan: "ADVANCED"
    },
    timestamp: new Date().toISOString(),
    signature: "test_signature"
  };

  const payloadString = JSON.stringify(payload);
  const signature = createSignature(payloadString, WEBHOOK_SECRET);

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-tachles-signature': signature
      },
      body: payloadString
    });

    const result = await response.json();
    
    console.log('Status:', response.status);
    console.log('Response:', result);
    
    if (response.ok) {
      console.log('✅ Domain suspension test passed');
    } else {
      console.log('❌ Domain suspension test failed');
    }
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

async function runTests() {
  console.log('🔬 Starting Tachles webhook tests...\n');
  
  console.log('1. Testing domain activation...');
  await testDomainActivation();
  
  console.log('\n2. Testing domain suspension...');
  await testDomainSuspension();
  
  console.log('\n✨ Tests completed');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

export { testDomainActivation, testDomainSuspension, runTests };
