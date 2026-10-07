import dotenv from "dotenv";

dotenv.config();

async function main() {
  console.log("==========================================");
  console.log("TIRU PAY - Cashfree Diagnostic & Test Tool");
  console.log("==========================================");

  const envMode = (process.env.CASHFREE_ENV || process.env.CASHFREE_ENVIRONMENT || "sandbox").toLowerCase();
  const clientId = process.env.CASHFREE_CLIENT_ID || process.env.CASHFREE_APP_ID;
  const clientSecret = process.env.CASHFREE_CLIENT_SECRET || process.env.CASHFREE_SECRET_KEY;
  const partnerApiKey = process.env.CASHFREE_PARTNER_API_KEY;
  const apiVersion = process.env.CASHFREE_API_VERSION || "2023-08-01";

  const isProduction = envMode === "production";
  const pgBaseUrl = isProduction ? "https://api.cashfree.com/pg" : "https://sandbox.cashfree.com/pg";
  const partnerBaseUrl = isProduction ? "https://api.cashfree.com/partners" : "https://api-sandbox.cashfree.com/partners";

  console.log(`Environment:       [${envMode.toUpperCase()}]`);
  console.log(`PG Base URL:       ${pgBaseUrl}`);
  console.log(`Partner Base URL:  ${partnerBaseUrl}`);
  console.log(`API Version:       ${apiVersion}`);
  console.log(`Partner API Key:   ${partnerApiKey ? `${partnerApiKey.substring(0, 12)}... (SET)` : "(NOT SET)"}`);
  console.log(`Client ID (App):   ${clientId ? `${clientId.substring(0, 6)}... (SET)` : "(NOT SET)"}`);
  console.log(`Client Secret:     ${clientSecret ? "****** (SET)" : "(NOT SET)"}`);

  let partnerVerified = false;
  let pgVerified = false;

  // 1. Test Partner API if partnerApiKey is set
  if (partnerApiKey) {
    console.log("\n------------------------------------------");
    console.log("1. Testing Cashfree Partner API...");
    console.log("------------------------------------------");

    try {
      const partnerRes = await fetch(`${partnerBaseUrl}/merchants`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-partner-apikey": partnerApiKey,
          "x-api-version": "2023-01-01",
        },
        body: JSON.stringify({}),
      });

      // 400 Bad Request indicates successful authentication (empty body validation)
      // 401 Unauthorized indicates invalid API key
      if (partnerRes.status === 400 || partnerRes.ok) {
        console.log("✅ Cashfree Partner API Connected & Authenticated Successfully!");
        console.log(`   Status: ${partnerRes.status} (Valid partner authentication confirmed)`);
        partnerVerified = true;
      } else {
        const errorText = await partnerRes.text();
        console.error(`❌ Cashfree Partner API returned status ${partnerRes.status}:`, errorText);
      }
    } catch (err) {
      console.error("❌ Cashfree Partner API network call failed:", err instanceof Error ? err.message : err);
    }
  }

  // 2. Test Standard PG API if clientId and clientSecret are both set
  if (clientId && clientSecret) {
    console.log("\n------------------------------------------");
    console.log("2. Testing Cashfree Standard PG API...");
    console.log("------------------------------------------");

    const testOrderId = `test_order_${Date.now()}`;
    console.log(`Attempting to create test order: ${testOrderId}...`);

    try {
      const response = await fetch(`${pgBaseUrl}/orders`, {
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
        console.error("❌ Cashfree PG API Error:");
        console.error(JSON.stringify(data, null, 2));
      } else {
        console.log("✅ Cashfree PG API Connected Successfully!");
        console.log(`   Order ID:            ${data.order_id}`);
        console.log(`   Cashfree Order ID:   ${data.cf_order_id}`);
        console.log(`   Order Status:        ${data.order_status}`);
        console.log(`   Payment Session ID:  ${data.payment_session_id?.substring(0, 20)}...`);
        pgVerified = true;
      }
    } catch (err) {
      console.error("❌ Cashfree PG network call failed:", err instanceof Error ? err.message : err);
    }
  } else if (!partnerApiKey) {
    console.error("\n❌ Neither CASHFREE_PARTNER_API_KEY nor (CASHFREE_CLIENT_ID + CASHFREE_CLIENT_SECRET) are configured in .env");
    process.exit(1);
  }

  console.log("\n==========================================");
  console.log("Diagnostic Summary:");
  console.log(`  Partner API Integration:   ${partnerVerified ? "✅ VERIFIED & ACTIVE" : (partnerApiKey ? "❌ FAILED" : "⚪ NOT CONFIGURED")}`);
  console.log(`  Standard PG Integration:  ${pgVerified ? "✅ VERIFIED & ACTIVE" : (clientId && clientSecret ? "❌ FAILED" : "⚪ AWAITING CLIENT_ID (APP ID)")}`);
  console.log("==========================================");

  if (partnerVerified && !pgVerified && !clientId) {
    console.log("\n💡 Note: Partner API is verified and active!");
    console.log("   If you also want standard merchant checkout mode, get your App ID from:");
    console.log("   Cashfree Dashboard -> Developers -> API Keys -> App ID");
    console.log("   and set CASHFREE_CLIENT_ID=TEST... in your .env file.\n");
  }
}

main();
