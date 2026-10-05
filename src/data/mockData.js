// ThiruPay Phase 1 — Mock Data Layer (frontend-only, localStorage-backed)
// Mirrors Sir's IppoPay MVP schema: Users, Merchants, KYC, Payment Links, Transactions, Settlements

const KEYS = {
  USERS: "tp_users",
  MERCHANTS: "tp_merchants",
  KYC: "tp_kyc",
  LINKS: "tp_payment_links",
  TXNS: "tp_transactions",
  SETTLEMENTS: "tp_settlements",
  SESSION: "tp_session",
  REQUESTS: "tp_service_requests",
  TICKETS: "tp_support_tickets",
  ADMIN_STAFF: "tp_admin_staff",
  ATTENDANCE: "tp_admin_attendance",
  LEAVES: "tp_admin_leaves",
  CONTACT_MESSAGES: "tp_contact_messages",
  REFUNDS: "tp_refunds",
  BANK_HISTORY: "tp_bank_history",
  PROMO_BANNERS: "tp_promo_banners",
  PROMO_SEEDED: "tp_promo_seeded_v1",
  SEEDED: "tp_seeded_v1",
};

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    if (err && (err.name === "QuotaExceededError" || err.code === 22)) {
      throw new Error("STORAGE_QUOTA_EXCEEDED");
    }
    throw err;
  }
}

export function genId(prefix) {
  return `${prefix}_${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`;
}

// ---------- Seed data ----------
function seed() {
  if (read(KEYS.SEEDED, false)) return;

  const users = [
    { id: "u_admin1", name: "Admin (Sir)", email: "admin@thirupay.in", phone: "9999900000", role: "admin", password: "admin123" },
    { id: "u_merchant1", name: "Selvi Kumar", email: "selvi@shop.com", phone: "9840011122", role: "merchant", password: "merchant123" },
  ];

  const merchants = [
    {
      merchant_id: "m_001",
      user_id: "u_merchant1",
      business_name: "Selvi Fancy Store",
      owner_name: "Selvi Kumar",
      email: "selvi@shop.com",
      phone: "9840011122",
      gst: "33ABCDE1234F1Z5",
      status: "active", // pending | active | rejected | suspended
      address_line1: "Shop No. 12, Main Bazaar Street",
      address_line2: "Near Anna Bus Stand",
      pincode: "625001",
      city: "Madurai",
      state: "Tamil Nadu",
      business_photo: "",
      account_holder: "Selvi Kumar",
      account_number: "5011000123456",
      ifsc: "SBIN0001234",
      bank_name: "State Bank of India",
      branch: "T. Nagar, Chennai",
      bank_verification_status: "verified", // verified | pending — re-checked whenever bank details change
      created_at: new Date(Date.now() - 6 * 86400000).toISOString(),
    },
  ];

  const kyc = [
    {
      merchant_id: "m_001",
      pan: "ABCDE1234F",
      aadhaar: "XXXX-XXXX-4821",
      document_name: "aadhaar_selvi.pdf",
      document_url: "",
      verification_status: "approved", // pending | approved | rejected
    },
  ];

  const links = [
    { link_id: "pl_001", merchant_id: "m_001", amount: 1500, expiry: new Date(Date.now() + 2 * 86400000).toISOString(), status: "pending", note: "Order #221", created_at: new Date(Date.now() - 3600000).toISOString() },
    { link_id: "pl_002", merchant_id: "m_001", amount: 850, expiry: new Date(Date.now() - 86400000).toISOString(), status: "expired", note: "Saree order", created_at: new Date(Date.now() - 4 * 86400000).toISOString() },
  ];

  const txns = [
    { transaction_id: "txn_001", merchant_id: "m_001", amount: 500, payment_method: "QR", payment_mode: "UPI", status: "success", created_at: new Date(Date.now() - 2 * 3600000).toISOString() },
    { transaction_id: "txn_002", merchant_id: "m_001", amount: 1200, payment_method: "Payment Link", payment_mode: "Card", status: "success", created_at: new Date(Date.now() - 26 * 3600000).toISOString() },
    { transaction_id: "txn_003", merchant_id: "m_001", amount: 300, payment_method: "QR", payment_mode: "UPI", status: "success", created_at: new Date(Date.now() - 50 * 3600000).toISOString() },
  ];

  const settlements = [
    { settlement_id: "st_001", merchant_id: "m_001", amount: 300, settlement_date: new Date(Date.now() - 24 * 3600000).toISOString(), status: "settled" },
    { settlement_id: "st_002", merchant_id: "m_001", amount: 1700, settlement_date: new Date(Date.now() + 86400000).toISOString(), status: "pending" },
  ];

  const requests = [
    {
      request_id: "sr_001",
      merchant_id: "m_001",
      type: "soundbox",
      details: { quantity: 1 },
      status: "requested",
      created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
  ];

  write(KEYS.USERS, users);
  write(KEYS.MERCHANTS, merchants);
  write(KEYS.KYC, kyc);
  write(KEYS.LINKS, links);
  write(KEYS.TXNS, txns);
  write(KEYS.SETTLEMENTS, settlements);
  write(KEYS.REQUESTS, requests);
  write(KEYS.SEEDED, true);
}

seed();

// Promo banners were added after the initial seed() already ran on most
// devices — SEEDED being true skips seed() entirely, which would leave
// banners empty forever. This runs independently, gated by its own flag,
// so existing merchants/transactions/etc. are untouched.
function ensurePromoBannersSeeded() {
  if (read(KEYS.PROMO_SEEDED, false)) return;
  if (read(KEYS.PROMO_BANNERS, []).length > 0) {
    write(KEYS.PROMO_SEEDED, true);
    return;
  }

  const promoBanners = [
    {
      banner_id: "promo_thiru_insurance",
      order: 0,
      active: true,
      badge: "Thiru Insurance",
      headline: ["Protect your family.", "Secure your future."],
      subtitle: "Affordable and trusted insurance plans for you and your loved ones.",
      categories: [
        { icon: "HeartPulse", label: "Health Insurance" },
        { icon: "UserRound", label: "Life Insurance" },
        { icon: "ShieldAlert", label: "Personal Accident" },
        { icon: "Car", label: "Vehicle Insurance" },
      ],
      ctaLabel: "Explore Plans",
      theme: "blue",
      illustration: "shield",
      link: "http://localhost:5174", // TODO: replace with the live Thiru Insurance URL once deployed
      external: true,
      appendMerchantParams: true,
      created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    },
    {
      banner_id: "promo_soundbox",
      order: 1,
      active: true,
      badge: "ThiruPay SoundBox",
      headline: ["Never miss a payment.", "Hear every sale."],
      subtitle: "Instant voice confirmation for every UPI payment you receive.",
      categories: [
        { icon: "Volume2", label: "Instant Alerts" },
        { icon: "BatteryCharging", label: "8hr Battery" },
        { icon: "Wifi", label: "4G Enabled" },
      ],
      ctaLabel: "Order Now",
      theme: "amber",
      illustration: "device",
      link: "/merchant/services",
      external: false,
      appendMerchantParams: false,
      created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    },
    {
      banner_id: "promo_loan",
      order: 2,
      active: true,
      badge: "Business Loan",
      headline: ["Grow your business.", "Instant approval."],
      subtitle: "Collateral-free working capital loans based on your transaction history.",
      categories: [
        { icon: "Zap", label: "Quick Disbursal" },
        { icon: "Percent", label: "Low Interest" },
        { icon: "FileCheck2", label: "Minimal Docs" },
      ],
      ctaLabel: "Check Eligibility",
      theme: "violet",
      illustration: "loan",
      link: "/merchant/services",
      external: false,
      appendMerchantParams: false,
      created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
  ];

  write(KEYS.PROMO_BANNERS, promoBanners);
  write(KEYS.PROMO_SEEDED, true);
}

ensurePromoBannersSeeded();

// ---------- Accessors ----------
export const db = {
  // Users
  getUsers: () => read(KEYS.USERS, []),
  findUserByEmail: (email) => read(KEYS.USERS, []).find((u) => u.email.toLowerCase() === email.toLowerCase()),
  // Checks BOTH the merchant/owner table and the internal admin-staff table so
  // the same email can never be used for two different accounts/roles.
  isEmailTaken: (email, opts = {}) => {
    const { excludeUserId, excludeStaffId } = opts;
    const emailLower = (email || "").toLowerCase();
    const userMatch = read(KEYS.USERS, []).find((u) => u.email.toLowerCase() === emailLower && u.id !== excludeUserId);
    if (userMatch) return true;
    const staffMatch = read(KEYS.ADMIN_STAFF, []).find((s) => (s.email || "").toLowerCase() === emailLower && s.staff_id !== excludeStaffId);
    return !!staffMatch;
  },
  addUser: (user) => {
    const users = read(KEYS.USERS, []);
    users.push(user);
    write(KEYS.USERS, users);
    return user;
  },
  removeUser: (userId) => {
    const users = read(KEYS.USERS, []).filter((u) => u.id !== userId);
    write(KEYS.USERS, users);
  },
  updateUserPassword: (email, newPassword) => {
    const users = read(KEYS.USERS, []);
    const idx = users.findIndex((u) => u.email.toLowerCase() === email.toLowerCase());
    if (idx === -1) return null;
    users[idx] = { ...users[idx], password: newPassword };
    write(KEYS.USERS, users);
    return users[idx];
  },

  // Merchants
  getMerchants: () => read(KEYS.MERCHANTS, []),
  getMerchantById: (id) => read(KEYS.MERCHANTS, []).find((m) => m.merchant_id === id),
  getMerchantByUserId: (userId) => read(KEYS.MERCHANTS, []).find((m) => m.user_id === userId),
  addMerchant: (merchant) => {
    const merchants = read(KEYS.MERCHANTS, []);
    merchants.push(merchant);
    write(KEYS.MERCHANTS, merchants);
    return merchant;
  },
  updateMerchant: (id, patch) => {
    const merchants = read(KEYS.MERCHANTS, []);
    const idx = merchants.findIndex((m) => m.merchant_id === id);
    if (idx > -1) {
      merchants[idx] = { ...merchants[idx], ...patch };
      write(KEYS.MERCHANTS, merchants);
      return merchants[idx];
    }
    return null;
  },

  // KYC
  getKycByMerchant: (merchantId) => read(KEYS.KYC, []).find((k) => k.merchant_id === merchantId),
  addKyc: (kycRecord) => {
    const all = read(KEYS.KYC, []);
    const idx = all.findIndex((k) => k.merchant_id === kycRecord.merchant_id);
    if (idx > -1) all[idx] = kycRecord;
    else all.push(kycRecord);
    write(KEYS.KYC, all);
    return kycRecord;
  },
  updateKycStatus: (merchantId, status) => {
    const all = read(KEYS.KYC, []);
    const idx = all.findIndex((k) => k.merchant_id === merchantId);
    if (idx > -1) {
      all[idx].verification_status = status;
      write(KEYS.KYC, all);
      return all[idx];
    }
    return null;
  },

  // Payment Links
  getLinksByMerchant: (merchantId) => read(KEYS.LINKS, []).filter((l) => l.merchant_id === merchantId),
  getAllLinks: () => read(KEYS.LINKS, []),
  getLinkById: (linkId) => read(KEYS.LINKS, []).find((l) => l.link_id === linkId) || null,
  addLink: (link) => {
    const links = read(KEYS.LINKS, []);
    links.unshift(link);
    write(KEYS.LINKS, links);
    return link;
  },
  updateLinkStatus: (linkId, status) => {
    const links = read(KEYS.LINKS, []);
    const idx = links.findIndex((l) => l.link_id === linkId);
    if (idx > -1) {
      links[idx].status = status;
      write(KEYS.LINKS, links);
      return links[idx];
    }
    return null;
  },

  // Transactions
  getTxnsByMerchant: (merchantId) => read(KEYS.TXNS, []).filter((t) => t.merchant_id === merchantId).sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
  getAllTxns: () => read(KEYS.TXNS, []).sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
  addTxn: (txn) => {
    const txns = read(KEYS.TXNS, []);
    txns.unshift(txn);
    write(KEYS.TXNS, txns);
    return txn;
  },

  // Settlements
  getSettlementsByMerchant: (merchantId) => read(KEYS.SETTLEMENTS, []).filter((s) => s.merchant_id === merchantId).sort((a, b) => new Date(b.settlement_date) - new Date(a.settlement_date)),
  getAllSettlements: () => read(KEYS.SETTLEMENTS, []).sort((a, b) => new Date(b.settlement_date) - new Date(a.settlement_date)),
  addSettlement: (s) => {
    const all = read(KEYS.SETTLEMENTS, []);
    all.unshift(s);
    write(KEYS.SETTLEMENTS, all);
    return s;
  },
  updateSettlementStatus: (id, status) => {
    const all = read(KEYS.SETTLEMENTS, []);
    const idx = all.findIndex((s) => s.settlement_id === id);
    if (idx > -1) {
      all[idx].status = status;
      write(KEYS.SETTLEMENTS, all);
      return all[idx];
    }
    return null;
  },

  // Contact messages — from the public Contact page
  addContactMessage: (msg) => {
    const all = read(KEYS.CONTACT_MESSAGES, []);
    all.unshift(msg);
    write(KEYS.CONTACT_MESSAGES, all);
    return msg;
  },

  // Service Requests (Loan / Insurance / SoundBox / POS Device)
  getRequestsByMerchant: (merchantId) =>
    read(KEYS.REQUESTS, [])
      .filter((r) => r.merchant_id === merchantId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
  getAllRequests: () =>
    read(KEYS.REQUESTS, []).sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
  addRequest: (request) => {
    const all = read(KEYS.REQUESTS, []);
    all.unshift(request);
    write(KEYS.REQUESTS, all);
    return request;
  },
  updateRequestStatus: (requestId, status) => {
    const all = read(KEYS.REQUESTS, []);
    const idx = all.findIndex((r) => r.request_id === requestId);
    if (idx > -1) {
      all[idx].status = status;
      write(KEYS.REQUESTS, all);
      return all[idx];
    }
    return null;
  },

  // Session
  getSession: () => read(KEYS.SESSION, null),
  setSession: (session) => write(KEYS.SESSION, session),
  clearSession: () => localStorage.removeItem(KEYS.SESSION),

  // Notifications (read/unread state per user, derived notifications built by the UI)
  getReadNotificationIds: (userId) => read(`tp_notif_read_${userId}`, []),
  markNotificationsRead: (userId, ids) => {
    const existing = read(`tp_notif_read_${userId}`, []);
    const merged = Array.from(new Set([...existing, ...ids]));
    write(`tp_notif_read_${userId}`, merged);
    return merged;
  },

  // Admin Staff Management (ThiruPay's own internal team — Admin, Manager,
  // Support Executive, Sales Executive, Verification Officer)
  getAdminStaff: () => read(KEYS.ADMIN_STAFF, []).sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
  getAdminStaffByEmail: (email) =>
    read(KEYS.ADMIN_STAFF, []).find(
      (s) => s.email?.toLowerCase() === email.toLowerCase() || s.username?.toLowerCase() === email.toLowerCase()
    ),
  addAdminStaff: (staff) => {
    const all = read(KEYS.ADMIN_STAFF, []);
    all.unshift(staff);
    write(KEYS.ADMIN_STAFF, all);
    return staff;
  },
  updateAdminStaff: (staffId, patch) => {
    const all = read(KEYS.ADMIN_STAFF, []);
    const idx = all.findIndex((s) => s.staff_id === staffId);
    if (idx > -1) {
      all[idx] = { ...all[idx], ...patch };
      write(KEYS.ADMIN_STAFF, all);
      return all[idx];
    }
    return null;
  },
  removeAdminStaff: (staffId) => {
    const all = read(KEYS.ADMIN_STAFF, []).filter((s) => s.staff_id !== staffId);
    write(KEYS.ADMIN_STAFF, all);
  },

  // Attendance (one record per staff per calendar day)
  getAttendanceByStaff: (staffId) =>
    read(KEYS.ATTENDANCE, []).filter((a) => a.staff_id === staffId).sort((a, b) => (a.date < b.date ? 1 : -1)),
  getAllAttendance: () => read(KEYS.ATTENDANCE, []).sort((a, b) => (a.date < b.date ? 1 : -1)),
  getTodayAttendance: (staffId, dateStr) => read(KEYS.ATTENDANCE, []).find((a) => a.staff_id === staffId && a.date === dateStr),
  checkIn: (staffId, dateStr) => {
    const all = read(KEYS.ATTENDANCE, []);
    const existing = all.find((a) => a.staff_id === staffId && a.date === dateStr);
    if (existing) return existing;
    const record = { attendance_id: genId("att"), staff_id: staffId, date: dateStr, check_in: new Date().toISOString(), check_out: null };
    all.unshift(record);
    write(KEYS.ATTENDANCE, all);
    return record;
  },
  checkOut: (staffId, dateStr) => {
    const all = read(KEYS.ATTENDANCE, []);
    const idx = all.findIndex((a) => a.staff_id === staffId && a.date === dateStr);
    if (idx > -1 && !all[idx].check_out) {
      all[idx].check_out = new Date().toISOString();
      write(KEYS.ATTENDANCE, all);
      return all[idx];
    }
    return idx > -1 ? all[idx] : null;
  },

  // Leave requests
  getLeavesByStaff: (staffId) => read(KEYS.LEAVES, []).filter((l) => l.staff_id === staffId).sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
  getAllLeaves: () => read(KEYS.LEAVES, []).sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
  addLeaveRequest: (leave) => {
    const all = read(KEYS.LEAVES, []);
    all.unshift(leave);
    write(KEYS.LEAVES, all);
    return leave;
  },
  updateLeaveStatus: (leaveId, status) => {
    const all = read(KEYS.LEAVES, []);
    const idx = all.findIndex((l) => l.leave_id === leaveId);
    if (idx > -1) {
      all[idx].status = status;
      write(KEYS.LEAVES, all);
      return all[idx];
    }
    return null;
  },

  // Help & Support tickets
  getTicketsByMerchant: (merchantId) =>
    read(KEYS.TICKETS, [])
      .filter((tk) => tk.merchant_id === merchantId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
  getAllTickets: () => read(KEYS.TICKETS, []).sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
  addTicket: (ticket) => {
    const all = read(KEYS.TICKETS, []);
    all.unshift(ticket);
    write(KEYS.TICKETS, all);
    return ticket;
  },
  updateTicketStatus: (ticketId, status, adminReply) => {
    const all = read(KEYS.TICKETS, []);
    const idx = all.findIndex((tk) => tk.ticket_id === ticketId);
    if (idx > -1) {
      all[idx].status = status;
      if (adminReply !== undefined) all[idx].admin_reply = adminReply;
      write(KEYS.TICKETS, all);
      return all[idx];
    }
    return null;
  },

  // Refunds — merchant-initiated against a successful transaction.
  // status: "processing" | "refunded" | "failed"
  getRefundsByMerchant: (merchantId) =>
    read(KEYS.REFUNDS, [])
      .filter((r) => r.merchant_id === merchantId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
  getAllRefunds: () => read(KEYS.REFUNDS, []).sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
  getRefundByTxnId: (txnId) => read(KEYS.REFUNDS, []).find((r) => r.transaction_id === txnId) || null,
  addRefund: (refund) => {
    const all = read(KEYS.REFUNDS, []);
    all.unshift(refund);
    write(KEYS.REFUNDS, all);
    return refund;
  },
  updateRefundStatus: (refundId, status) => {
    const all = read(KEYS.REFUNDS, []);
    const idx = all.findIndex((r) => r.refund_id === refundId);
    if (idx > -1) {
      all[idx].status = status;
      all[idx].processed_at = new Date().toISOString();
      write(KEYS.REFUNDS, all);
      return all[idx];
    }
    return null;
  },

  // Bank account change history — every time a merchant updates settlement
  // bank details, we log the old + new details for audit/reference.
  getBankHistoryByMerchant: (merchantId) =>
    read(KEYS.BANK_HISTORY, [])
      .filter((h) => h.merchant_id === merchantId)
      .sort((a, b) => new Date(b.changed_at) - new Date(a.changed_at)),
  addBankHistory: (entry) => {
    const all = read(KEYS.BANK_HISTORY, []);
    all.unshift(entry);
    write(KEYS.BANK_HISTORY, all);
    return entry;
  },

  // Promo Banners — Merchant Dashboard carousel, fully admin-managed.
  getPromoBanners: () => read(KEYS.PROMO_BANNERS, []).sort((a, b) => a.order - b.order),
  getActivePromoBanners: () =>
    read(KEYS.PROMO_BANNERS, [])
      .filter((b) => b.active)
      .sort((a, b) => a.order - b.order),
  addPromoBanner: (banner) => {
    const all = read(KEYS.PROMO_BANNERS, []);
    const record = { ...banner, banner_id: genId("promo"), order: all.length, created_at: new Date().toISOString() };
    all.push(record);
    write(KEYS.PROMO_BANNERS, all);
    return record;
  },
  updatePromoBanner: (bannerId, patch) => {
    const all = read(KEYS.PROMO_BANNERS, []);
    const idx = all.findIndex((b) => b.banner_id === bannerId);
    if (idx > -1) {
      all[idx] = { ...all[idx], ...patch };
      write(KEYS.PROMO_BANNERS, all);
      return all[idx];
    }
    return null;
  },
  removePromoBanner: (bannerId) => {
    const all = read(KEYS.PROMO_BANNERS, []).filter((b) => b.banner_id !== bannerId);
    write(KEYS.PROMO_BANNERS, all);
  },
  movePromoBanner: (bannerId, direction) => {
    // direction: -1 (up/earlier) or 1 (down/later) — swaps `order` with the adjacent banner.
    const all = read(KEYS.PROMO_BANNERS, []).sort((a, b) => a.order - b.order);
    const idx = all.findIndex((b) => b.banner_id === bannerId);
    const swapIdx = idx + direction;
    if (idx === -1 || swapIdx < 0 || swapIdx >= all.length) return;
    const tmp = all[idx].order;
    all[idx].order = all[swapIdx].order;
    all[swapIdx].order = tmp;
    write(KEYS.PROMO_BANNERS, all);
  },
};

export { KEYS };