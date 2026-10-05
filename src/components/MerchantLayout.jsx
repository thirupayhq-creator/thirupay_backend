import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutGrid, QrCode, Link2, Receipt, Wallet, User, LogOut, Sparkles, Languages, LifeBuoy, BarChart3 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { db } from "../data/mockData";
import NotificationBell from "./NotificationBell";

const NAV = [
  { to: "/merchant", key: "dashboard", icon: LayoutGrid, end: true },
  { to: "/merchant/qr", key: "generateQR", icon: QrCode },
  { to: "/merchant/links", key: "paymentLinks", icon: Link2 },
  { to: "/merchant/transactions", key: "transactions", icon: Receipt },
  { to: "/merchant/insights", key: "insights", icon: BarChart3 },
  { to: "/merchant/settlements", key: "settlements", icon: Wallet },
  { to: "/merchant/services", key: "services", icon: Sparkles },
  { to: "/merchant/help", key: "help", icon: LifeBuoy },
  { to: "/merchant/profile", key: "profile", icon: User },
];

// Only the top items fit in a phone bottom tab bar — mirrors what real
// merchant apps (PhonePe Business, Paytm Business) keep on the home row.
const BOTTOM_NAV = [
  { to: "/merchant", key: "dashboard", icon: LayoutGrid, end: true },
  { to: "/merchant/qr", key: "generateQR", icon: QrCode },
  { to: "/merchant/transactions", key: "transactions", icon: Receipt },
  { to: "/merchant/settlements", key: "settlements", icon: Wallet },
  { to: "/merchant/profile", key: "profile", icon: User },
];

export default function MerchantLayout() {
  const { session, logout } = useAuth();
  const { lang, toggleLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const merchant = session?.merchantId ? db.getMerchantById(session.merchantId) : null;
  const isActive = merchant?.status === "active";

  const notifications = [];
  if (session?.merchantId) {
    const kyc = db.getKycByMerchant(session.merchantId);
    if (kyc?.verification_status === "approved") {
      notifications.push({
        id: `kyc-approved-${session.merchantId}`,
        title: "KYC approved!",
        subtitle: "You can now use QR & Payment Links",
        to: "/merchant/profile",
      });
    } else if (kyc?.verification_status === "rejected") {
      notifications.push({
        id: `kyc-rejected-${session.merchantId}`,
        title: "KYC rejected",
        subtitle: "Please check your documents and resubmit",
        to: "/merchant/kyc",
      });
    }

    db.getRequestsByMerchant(session.merchantId)
      .filter((r) => r.status !== "requested")
      .forEach((r) => {
        notifications.push({
          id: `req-${r.request_id}`,
          title: `${r.type.replace("_", " ")} request ${r.status === "approved" ? "approved" : "rejected"}`,
          subtitle: "View details on the Services page",
          to: "/merchant/services",
        });
      });

    db.getSettlementsByMerchant(session.merchantId)
      .filter((s) => s.status === "pending")
      .slice(0, 5)
      .forEach((s) => {
        notifications.push({
          id: `settle-${s.settlement_id}`,
          title: `₹${s.amount.toLocaleString("en-IN")} settlement pending`,
          subtitle: "Will be credited to your bank account",
          to: "/merchant/settlements",
        });
      });

    db.getTxnsByMerchant(session.merchantId)
      .slice(0, 3)
      .forEach((tx) => {
        notifications.push({
          id: `txn-${tx.transaction_id}`,
          title: `₹${tx.amount.toLocaleString("en-IN")} payment received`,
          subtitle: `via ${tx.payment_method}`,
          to: "/merchant/transactions",
        });
      });
  }

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex bg-[#F6F7FB]">
      {/* Sidebar — desktop/tablet only. Phones use the bottom tab bar instead. */}
      <aside className="hidden md:flex w-64 bg-green-700 text-white flex-col shrink-0">
        <div className="px-6 py-6 border-b border-white/10">
          <div className="flex items-center gap-2">
            <img src="/brand/logo-icon-white.png" alt="" className="h-7 w-auto" />
            <p className="font-display font-extrabold text-xl tracking-tight">
              Thiru<span className="text-orange-400">Pay</span>
            </p>
          </div>
          <p className="text-green-200 text-xs mt-0.5">{t("merchantPortal")}</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(({ to, key, icon: Icon, end }) => {
            const locked = !isActive && to !== "/merchant" && to !== "/merchant/profile";
            return (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={(e) => locked && e.preventDefault()}
                className={({ isActive: navActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    locked
                      ? "text-green-300 opacity-50 cursor-not-allowed"
                      : navActive
                      ? "bg-green-500 text-white shadow-glow"
                      : "text-green-100 hover:bg-white/10"
                  }`
                }
              >
                <Icon size={18} />
                {t(key)}
                {locked && <span className="ml-auto text-[10px] uppercase bg-white/10 px-1.5 py-0.5 rounded">{t("locked")}</span>}
              </NavLink>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-green-100 hover:bg-white/10 w-full transition-colors"
          >
            <LogOut size={18} />
            {t("logout")}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-green-100 flex items-center justify-between px-4 md:px-8 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <img src="/brand/logo-icon.png" alt="" className="h-6 w-auto md:hidden shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-green-700 truncate">{merchant?.business_name || "Merchant"}</p>
              <p className="text-xs text-green-300 truncate">{session?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            <button
              onClick={toggleLanguage}
              title={lang === "en" ? "தமிழுக்கு மாற்று" : "Switch to English"}
              className="flex items-center gap-1.5 text-xs font-semibold px-2.5 md:px-3 py-1.5 rounded-full border border-green-100 text-green-600 hover:bg-green-50 transition-colors"
            >
              <Languages size={14} />
              <span className="hidden sm:inline">{lang === "en" ? "EN" : "தமிழ்"}</span>
            </button>
            <NotificationBell userId={session?.userId} items={notifications} />
            {merchant && (
              <span
                className={`hidden sm:inline text-xs font-semibold px-3 py-1 rounded-full capitalize ${
                  isActive ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                }`}
              >
                {merchant.status}
              </span>
            )}
          </div>
        </header>

        {/* pb-24 on phones so content never hides behind the fixed bottom tab bar */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
          <Outlet />
        </main>
      </div>

      {/* Bottom tab bar — phones only, mirrors real merchant apps (PhonePe/Paytm Business) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-green-100 flex items-stretch shadow-[0_-4px_16px_rgba(24,83,56,0.08)]">
        {BOTTOM_NAV.map(({ to, key, icon: Icon, end }) => {
          const locked = !isActive && to !== "/merchant" && to !== "/merchant/profile";
          return (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={(e) => locked && e.preventDefault()}
              className={({ isActive: navActive }) =>
                `flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors ${
                  locked ? "text-green-200" : navActive ? "text-green-700" : "text-green-300"
                }`
              }
            >
              <Icon size={19} />
              <span className="truncate max-w-[60px]">{t(key)}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
