// ThiruPay's own internal team (Admin Panel side) — separate from a merchant's
// own shop staff. These roles decide who on Sir's team can see/do what
// inside the Admin console.

export const ADMIN_ROLES = ["Admin", "Manager", "Support Executive", "Sales Executive", "Verification Officer"];

// Which admin nav sections each internal role can access.
// Enforced in AdminLayout: nav items are filtered and direct-URL access is
// blocked for sections outside a staff member's role.
export const ADMIN_ROLE_ACCESS = {
  Admin: ["dashboard", "merchants", "kyc", "transactions", "settlements", "service-requests", "support-tickets", "staff", "banners"],
  Manager: ["dashboard", "merchants", "kyc", "transactions", "settlements", "service-requests", "support-tickets", "banners"],
  "Support Executive": ["dashboard", "merchants", "transactions", "support-tickets"],
  "Sales Executive": ["dashboard", "merchants", "service-requests"],
  "Verification Officer": ["dashboard", "merchants", "kyc"],
};

export const ADMIN_NAV_LABELS = {
  dashboard: "Dashboard",
  merchants: "Merchants",
  kyc: "KYC Verification",
  transactions: "Transactions",
  settlements: "Settlements",
  "service-requests": "Service Requests",
  "support-tickets": "Support Tickets",
  staff: "Staff Management",
  banners: "Promo Banners",
};

// `adminRole` is null for Sir's own Super Admin account — always full access.
export function canAccessAdmin(adminRole, navKey) {
  if (!adminRole) return true;
  return (ADMIN_ROLE_ACCESS[adminRole] || []).includes(navKey);
}