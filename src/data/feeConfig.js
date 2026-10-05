// Mock MDR (Merchant Discount Rate) config.
// Backend integrate aana odane, idha replace pannama real fee value transaction data-la
// direct-a varum (txn.fee). Athuvarai idhu than mock calculation.

export const MDR_PERCENT = 2; // 2% flat, illustrative only

export function computeFee(amount) {
  const fee = Math.round(amount * (MDR_PERCENT / 100) * 100) / 100;
  const net = Math.round((amount - fee) * 100) / 100;
  return { fee, net };
}
