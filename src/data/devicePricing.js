// Pricing for hardware services (SoundBox / POS Device).
// Two billing models, same pattern PhonePe/real fintech apps use:
//  - "onetime": pay once, device is yours
//  - "rental": lower upfront, small recurring monthly charge

export const GST_RATE = 0.18;

export const DEVICE_PRICING = {
  soundbox: {
    onetime: 1999,
    rental: 99,
  },
  pos_device: {
    onetime: 3999,
    rental: 199,
  },
};

export function calcInvoice({ type, quantity = 1, pricingOption = "onetime" }) {
  const unitPrice = DEVICE_PRICING[type]?.[pricingOption] ?? 0;
  const qty = Number(quantity) || 1;
  const subtotal = unitPrice * qty;
  const gst = Math.round(subtotal * GST_RATE);
  const total = subtotal + gst;
  return { unitPrice, qty, subtotal, gst, total, pricingOption };
}

// Order lifecycle for hardware requests: requested -> approved -> dispatched -> delivered
// (or requested -> rejected)
export const ORDER_STAGES = ["requested", "approved", "dispatched", "delivered"];
