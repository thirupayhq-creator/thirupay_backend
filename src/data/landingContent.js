import {
  QrCode,
  Link2,
  Wallet,
  ShieldCheck,
  UserPlus,
  FileCheck2,
  Rocket,
  Banknote,
  ShieldPlus,
  Volume2,
  Smartphone,
  Lock,
  Landmark,
  Headset,
  Store,
  Coffee,
  Shirt,
  Scissors,
  Users,
  MapPin,
  TimerReset,
} from "lucide-react";

export const FEATURES = [
  { icon: QrCode, title: "Instant QR Collection", desc: "Generate a QR in seconds — get paid the moment a customer scans, no hardware needed.", detail: "One static QR for your counter, printed once and reused for every sale. Every scan is tracked live on your dashboard, and money settles to your bank the next business day." },
  { icon: Link2, title: "Payment Links", desc: "Share a link over WhatsApp or SMS for remote orders. No scan required.", detail: "Create a link for any amount, set an expiry, and send it over WhatsApp or SMS. Customers can pay from anywhere — perfect for phone orders and deliveries." },
  { icon: Wallet, title: "Settlement Tracking", desc: "See exactly when every rupee lands in your bank account, from collection to payout.", detail: "Every collection shows a clear settlement date and status — pending or settled — so you always know what's in transit and what's already in your account." },
  { icon: ShieldCheck, title: "Admin-Verified Merchants", desc: "Every merchant is KYC-verified and approved before they can collect payments.", detail: "PAN and Aadhaar verification keeps the platform trustworthy for both merchants and their customers, with our admin team reviewing every account before activation." },
];

export const SERVICES = [
  { icon: Banknote, title: "Business Loans", desc: "Up to ₹2,00,000 with zero processing fees and no collateral — apply in minutes.", detail: "Request a loan directly from your merchant dashboard based on your collection history. No paperwork trips — our admin team reviews and disburses digitally." },
  { icon: ShieldPlus, title: "Insurance", desc: "Business, device, health, motor & more — protect what matters, request in one tap.", detail: "Cover your shop, your soundbox or POS device, or your family's health — all requestable from the same dashboard you already use to collect payments." },
  { icon: Volume2, title: "SoundBox", desc: "Instant voice alerts for every payment received, even without checking your phone.", detail: "A small speaker device that announces every payment out loud in Tamil or English, so you never have to stop and check your phone at the counter." },
  { icon: Smartphone, title: "POS Devices", desc: "Accept card payments in-store with a POS terminal delivered to your doorstep.", detail: "For customers who prefer to tap or swipe a card, request a POS terminal and start accepting card payments alongside UPI." },
];

export const STEPS = [
  { icon: UserPlus, title: "Register", desc: "Create your merchant account with your business details in under 5 minutes." },
  { icon: FileCheck2, title: "Get Verified", desc: "Upload PAN & Aadhaar — our admin team reviews and activates your account." },
  { icon: Rocket, title: "Start Collecting", desc: "Generate your QR or payment link and start receiving payments instantly." },
];

export const STATS = [
  { value: "< 5 min", label: "merchant onboarding" },
  { value: "0%", label: "setup fee" },
  { value: "24/7", label: "QR & link uptime" },
];

export const STAT_HIGHLIGHTS = [
  { icon: Store, value: "7+", label: "Cities across Tamil Nadu" },
  { icon: Users, value: "< 5 min", label: "Average onboarding time" },
  { icon: TimerReset, value: "T+1", label: "Standard settlement time" },
  { icon: ShieldCheck, value: "100%", label: "KYC-verified merchants" },
];

export const USE_CASES = [
  { icon: Store, title: "Kirana & grocery stores", desc: "One QR at the counter — collect for daily groceries without a card machine." },
  { icon: Coffee, title: "Tea stalls & food carts", desc: "Send a payment link for standing orders, no scanning needed for phone orders." },
  { icon: Shirt, title: "Textile & fancy stores", desc: "Track every sale by settlement date instead of counting cash at closing time." },
  { icon: Scissors, title: "Salons & service shops", desc: "Let customers pay by scan while you finish the service — no change to manage." },
];

// Used by the navbar's Product mega-menu — grouped, merchant-only (no partner/agent items)
export const NAV_PRODUCT_GROUPS = [
  {
    title: "Payments",
    items: [
      { icon: QrCode, name: "QR Collection", desc: "Static QR for your counter", to: "/product#core-features" },
      { icon: Link2, name: "Payment Links", desc: "Share over WhatsApp/SMS", to: "/product#core-features" },
      { icon: Wallet, name: "Settlement Tracking", desc: "Know when money lands", to: "/product#core-features" },
    ],
  },
  {
    title: "Grow your business",
    items: [
      { icon: Banknote, name: "Business Loans", desc: "Up to ₹2,00,000", to: "/product#beyond-payments" },
      { icon: ShieldPlus, name: "Insurance", desc: "Business, device & more", to: "/product#beyond-payments" },
      { icon: Volume2, name: "SoundBox", desc: "Voice payment alerts", to: "/product#beyond-payments" },
      { icon: Smartphone, name: "POS Devices", desc: "Accept card payments", to: "/product#beyond-payments" },
    ],
  },
];

export const CITIES = ["Chennai", "Coimbatore", "Madurai", "Trichy", "Salem", "Vellore", "Erode"];

export const COMPARE = [
  { row: "Money reaches your account", cash: "Manual, end of day", thirupay: "Auto-settled, tracked live" },
  { row: "Proof of every sale", cash: "Handwritten / none", thirupay: "Digital receipt, searchable" },
  { row: "Accepting UPI, cards, wallets", cash: "Needs separate machines", thirupay: "One QR, one dashboard" },
  { row: "Risk of theft or shortage", cash: "High — physical cash on hand", thirupay: "None — money is digital" },
  { row: "Setup cost", cash: "POS machine rental fees", thirupay: "₹0 to get started" },
];

export const TESTIMONIALS = [
  {
    name: "Selvi Kumar",
    business: "Selvi Fancy Store",
    city: "Chennai",
    quote: "Just showing the QR to scan made it so easy for my customers. And I can see the settlement date clearly on my bank account too.",
  },
  {
    name: "Murugan R.",
    business: "Murugan Tea Stall",
    city: "Madurai",
    quote: "I don't worry about cash anymore. I send a payment link for orders, and by evening the whole total shows up automatically on the dashboard.",
  },
  {
    name: "Kaveri Devi",
    business: "Kaveri Textiles",
    city: "Coimbatore",
    quote: "I thought the KYC upload would take 2 days, but my account was active the very next day. The support team replied quickly too.",
  },
];

export const FAQS = [
  { q: "When does settlement reach my account?", a: "Your collections settle to your linked bank account on the next business day, as standard. The dashboard shows the exact date and pending amount in real time." },
  { q: "Are there any fees?", a: "There's no setup fee to create a merchant account or generate a QR. Transaction-based charges are shown transparently on the dashboard — nothing hidden." },
  { q: "What documents do I need for KYC?", a: "PAN and Aadhaar are enough for registration. Our admin team reviews your documents and usually verifies and activates your account within 24 hours." },
  { q: "Are my bank account details safe?", a: "Your bank details are stored encrypted, with access limited to verified admins only. As a merchant, you only ever see your own details on your own dashboard." },
  { q: "Is there a mobile app?", a: "Yes — the ThiruPay app is available for merchants who want to manage collections on the go. Visit the Get the App page for details." },
];

export const TRUST_BADGES = [
  { icon: Lock, title: "Encrypted by default", desc: "Bank details and KYC documents are encrypted end-to-end." },
  { icon: Landmark, title: "Verified settlements", desc: "Every payout is reconciled against your transaction ledger." },
  { icon: Headset, title: "Real support", desc: "A team that replies in Tamil or English, whichever you prefer." },
];
