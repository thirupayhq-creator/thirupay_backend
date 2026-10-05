// Option lists for the Promo Banner system.
// Actual banner records now live in mockData.js (localStorage, admin-managed) —
// this file only defines the pickable options for the Admin > Promo Banners form.

export const PROMO_THEMES = [
  { value: "blue", label: "Blue" },
  { value: "green", label: "Green" },
  { value: "amber", label: "Amber" },
  { value: "violet", label: "Violet" },
];

export const PROMO_ILLUSTRATIONS = [
  { value: "shield", label: "Shield (protection/insurance)" },
  { value: "device", label: "Device (soundbox/hardware)" },
  { value: "loan", label: "Loan (coins/growth)" },
];

// Icons available for a banner's feature chips (e.g. "Health Insurance").
export const PROMO_ICONS = [
  "HeartPulse", "UserRound", "ShieldAlert", "Car",
  "Volume2", "BatteryCharging", "Wifi",
  "Zap", "Percent", "FileCheck2",
];