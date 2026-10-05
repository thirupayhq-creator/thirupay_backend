// Help & Support content for ThiruPay merchants.

export const FAQ_CATEGORIES = [
  {
    key: "payments",
    label: "Payments",
    icon: "QrCode",
    faqs: [
      { q: "Why hasn't my QR payment shown up in Transactions?", a: "QR payments usually reflect within a minute. If it's been longer, check your internet connection and refresh the Transactions page. If it still doesn't appear, raise a ticket with the approximate time and amount." },
      { q: "Can customers pay with Card or Wallet, not just UPI?", a: "Yes — your QR and Payment Links accept UPI, Card, and Wallet. The payment mode used is shown against each transaction." },
      { q: "What happens if a Payment Link expires before the customer pays?", a: "An expired link can no longer be paid. Create a new Payment Link with a fresh expiry for the customer." },
    ],
  },
  {
    key: "settlements",
    label: "Settlements",
    icon: "Wallet",
    faqs: [
      { q: "When does money reach my bank account?", a: "Collections settle to your registered bank account on the next settlement cycle, usually within 24 hours of the transaction." },
      { q: "My settlement is still pending, what do I do?", a: "Check the Settlements page for the expected settlement date. If it's overdue, raise a ticket referencing the settlement ID." },
      { q: "Can I change my bank account details?", a: "Bank details can only be updated by the account owner from the Profile page. Staff accounts cannot change this." },
    ],
  },
  {
    key: "account",
    label: "KYC & Account",
    icon: "ShieldCheck",
    faqs: [
      { q: "Why is my KYC still pending?", a: "KYC review is done by the ThiruPay admin team and typically takes 1-2 business days after documents are submitted." },
      { q: "What documents are needed for KYC?", a: "PAN card and Aadhaar card are required. GST certificate is optional but recommended if you're GST-registered." },
      { q: "I forgot my password, how do I reset it?", a: "Use the \"Forgot password?\" link on the login page to reset it with your registered email." },
    ],
  },
  {
    key: "services",
    label: "Loan, Insurance & Devices",
    icon: "Sparkles",
    faqs: [
      { q: "How long does a Loan/POS/SoundBox request take to approve?", a: "Requests are usually reviewed within 24-48 hours. You'll see the status update under Services > My Requests." },
      { q: "Can I cancel a device order after requesting it?", a: "Raise a support ticket with your request details before it's dispatched, and our team will cancel it for you." },
      { q: "Where do I track my POS/SoundBox delivery?", a: "Go to Services > My Requests to see the live order status: Requested → Approved → Dispatched → Delivered." },
    ],
  },
];


export const TICKET_CATEGORIES = [
  "Payment issue",
  "Settlement issue",
  "KYC / Account",
  "Loan / Insurance / Device",
  "Staff access",
  "Report a problem",
  "Other",
];

export const TICKET_STATUSES = ["open", "in_progress", "resolved"];
