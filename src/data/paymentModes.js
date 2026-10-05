// Payment modes a customer can use to pay a ThiruPay merchant.
// "payment_method" on a transaction is the collection channel (QR / Payment Link).
// "payment_mode" is how the customer actually paid within that channel.

export const PAYMENT_MODES = [
  { key: "UPI", label: "UPI", color: "#0B2A4A" },
  { key: "Card", label: "Card", color: "#0B2A4A" },
  { key: "Wallet", label: "Wallet", color: "#0F766E" },
];

export const PAYMENT_MODE_COLORS = Object.fromEntries(PAYMENT_MODES.map((m) => [m.key, m.color]));
