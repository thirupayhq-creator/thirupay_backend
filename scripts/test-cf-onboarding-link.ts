import dotenv from "dotenv";
dotenv.config();

import { env } from "../src/core/config/env";

async function main() {
  const merchantId = "cmuwdeoz00008uk78dettmkny";
  const apiKey = env.CASHFREE_PARTNER_API_KEY;

  console.log("Partner API Key configured:", !!apiKey);
  console.log("Partner URL:", env.CASHFREE_PARTNER_API_URL);

  const url = `${env.CASHFREE_PARTNER_API_URL}/merchants/${encodeURIComponent(merchantId)}/onboarding_link`;
  console.log("Calling URL:", url);

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "x-partner-apikey": apiKey,
      "x-api-version": "2023-01-01",
    },
    body: JSON.stringify({
      type: "account_onboarding",
      return_url: "http://localhost:5174/merchant",
    }),
  });

  const text = await res.text();
  console.log("Status:", res.status);
  console.log("Response:", text);
}

main().catch(console.error);
