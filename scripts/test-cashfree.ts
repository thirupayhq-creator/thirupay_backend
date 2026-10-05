import dotenv from "dotenv";

dotenv.config();

async function main() {
  console.log("==========================================");
  console.log("TIRU PAY - Cashfree Gateway Test Script");
  console.log("==========================================");

  const envMode = (process.env.CASHFREE_ENV || process.env.CASHFREE_ENVIRONMENT || "sandbox").toLowerCase();
  const clientId = process.env.CASHFREE_CLIENT_ID || process.env.CASHFREE_APP_ID;
  const clientSecret = process.env.CASHFREE_CLIENT_SECRET || process.env.CASHFREE_SECRET_KEY;
  const apiVersion = process.env.CASHFREE_API_VERSION || "2023-08-01";

  const baseUrl = envMode === "production" ? "https://api.cashfree.com/pg" : "https://sandbox.cashfree.com/pg";

  console.log(`Environment: [${envMode.toUpperCase()}]`);
  console.log(`Base URL:    ${baseUrl}`);
  console.log(`API Version: ${apiVersion}`);
  console.log(`Client ID:   ${clientId ? `${clientId.substring(0, 6)}...` : "(NOT SET)"}`);
  console.log(`Secret:      ${clientSecret ? "******" : "(NOT SET)"}`);

  if (!clientId || !clientSecret) {
    console.error("\n❌ CASHFREE_CLIENT_ID and CASHFREE_CLIENT_SECRET are required in .env");
    process.exit(1);
  }

  const testOrderId = `test_order_${Date.now()}`;
  console.log(`\nAttempting to create test order: ${testOrderId}...`);

  try {
    const response = await fetch(`${baseUrl}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "x-client-id": clientId,
        "x-client-secret": clientSecret,
        "x-api-version": apiVersion,
      },
      body: JSON.stringify({
        order_id: testOrderId,
        order_amount: 1.00,
        order_currency: "INR",
        customer_details: {
          customer_id: `cust_${Date.now()}`,
          customer_phone: "9999999999",
          customer_name: "Test Merchant",
          customer_email: "test@tirupay.com",
        },
        order_meta: {
          return_url: "http://localhost:3000/payment/success?order_id={order_id}",
        },
      }),
    });

    const data = await response.json() as any;

    if (!response.ok) {
      console.error("\n❌ Cashfree API Error:");
      console.error(JSON.stringify(data, null, 2));
      process.exit(1);
    }

    console.log("\n✅ Cashfree API Connected Successfully!");
    console.log(`Order ID:            ${data.order_id}`);
    console.log(`Cashfree Order ID:   ${data.cf_order_id}`);
    console.log(`Order Status:        ${data.order_status}`);
    console.log(`Payment Session ID:  ${data.payment_session_id?.substring(0, 20)}...`);
    console.log("\nCashfree integration is working properly!");
  } catch (err) {
    console.error("\n❌ Cashfree Network / API call failed:");
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  }
}

main();
