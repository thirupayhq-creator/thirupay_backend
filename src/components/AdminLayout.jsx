import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { LayoutGrid, Users, ShieldCheck, Receipt, Wallet, LogOut, Sparkles, Search, LifeBuoy, UserCog, ShieldAlert, Clock3, Megaphone, Percent } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { db } from "../data/mockData";
import { canAccessAdmin } from "../data/adminRoles";
import NotificationBell from "./NotificationBell";

const NAV = [
  { to: "/admin", label: "Dashboard", navKey: "dashboard", icon: LayoutGrid, end: true },
  { to: "/admin/merchants", label: "Merchants", navKey: "merchants", icon: Users },
  { to: "/admin/kyc", label: "KYC Verification", navKey: "kyc", icon: ShieldCheck },
  { to: "/admin/transactions", label: "Transactions", navKey: "transactions", icon: Receipt },
  { to: "/admin/settlements", label: "Settlements", navKey: "settlements", icon: Wallet },
  { to: "/admin/commission", label: "Commission Dashboard", navKey: "commission", icon: Percent },
  { to: "/admin/service-requests", label: "Service Requests", navKey: "service-requests", icon: Sparkles },
  { to: "/admin/support-tickets", label: "Support Tickets", navKey: "support-tickets", icon: LifeBuoy },
  { to: "/admin/banners", label: "Promo Banners", navKey: "banners", icon: Megaphone },
  { to: "/admin/staff", label: "Staff Management", navKey: "staff", icon: UserCog },
];

// Personal utility route — always accessible to any logged-in staff account,
// not gated by the role permission matrix (it's "my own" data, not a module).
const SELF_NAV = { to: "/admin/my-attendance", label: "My Attendance", icon: Clock3 };

export default function AdminLayout() {
  const { session, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const merchantName = (id) => db.getMerchantById(id)?.business_name || id;

  const notifications = [
    ...db.getMerchants()
      .filter((m) => m.status === "pending")
      .map((m) => ({
        id: `kyc-${m.merchant_id}`,
        title: `${m.business_name} — KYC review pending`,
        subtitle: "New merchant needs KYC verification",
        to: "/admin/kyc",
        ts: m.registered_at ? new Date(m.registered_at).getTime() : 0,
      })),
    ...db.getAllRequests()
      .filter((r) => r.status === "requested")
      .map((r) => ({
        id: `req-${r.request_id}`,
        title: `${merchantName(r.merchant_id)} — ${r.type.replace("_", " ")} request`,
        subtitle: "Service request needs review",
        to: "/admin/service-requests",
        ts: new Date(r.created_at).getTime(),
      })),
    ...db.getAllSettlements()
      .filter((s) => s.status === "pending")
      .slice(0, 8)
      .map((s) => ({
        id: `settle-${s.settlement_id}`,
        title: `₹${s.amount.toLocaleString("en-IN")} settlement pending`,
        subtitle: merchantName(s.merchant_id),
        to: "/admin/settlements",
        ts: s.settlement_date ? new Date(s.settlement_date).getTime() : 0,
      })),
    ...db.getAllTickets()
      .filter((tk) => tk.status !== "resolved")
      .map((tk) => ({
        id: `ticket-${tk.ticket_id}`,
        title: `${merchantName(tk.merchant_id)} — ${tk.subject}`,
        subtitle: "Support ticket needs a reply",
        to: "/admin/support-tickets",
        ts: new Date(tk.created_at).getTime(),
      })),
    ...db.getAllLeaves()
      .filter((l) => l.status === "pending")
      .map((l) => {
        const staffName = db.getAdminStaff().find((s) => s.staff_id === l.staff_id)?.name || "Staff";
        return {
          id: `leave-${l.leave_id}`,
          title: `${staffName} — leave request pending`,
          subtitle: "Needs approve/reject",
          to: "/admin/staff",
          ts: new Date(l.created_at).getTime(),
        };
      }),
  ].sort((a, b) => b.ts - a.ts);

  const matches =
    query.trim().length > 0
      ? db.getMerchants().filter(
          (m) =>
            m.business_name.toLowerCase().includes(query.toLowerCase()) ||
            m.owner_name.toLowerCase().includes(query.toLowerCase()) ||
            m.phone.includes(query)
        )
      : [];

  const goToMerchants = () => {
    if (!query.trim()) return;
    navigate(`/admin/merchants?q=${encodeURIComponent(query.trim())}`);
    setShowSuggestions(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") goToMerchants();
    if (e.key === "Escape") setShowSuggestions(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex bg-[#F6F7FB]">
      <aside className="w-64 bg-green-700 text-white flex flex-col shrink-0">
        <div className="px-6 py-6 border-b border-white/10">
          <div className="flex items-center gap-2">
            <img src="/brand/logo-icon-white.png" alt="" className="h-7 w-auto" />
            <p className="font-display font-extrabold text-xl tracking-tight">
              Thiru<span className="text-orange-400">Pay</span>
            </p>
          </div>
          <p className="text-green-200 text-xs mt-0.5">Admin Console</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.filter((n) => canAccessAdmin(session?.adminRole, n.navKey)).map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? "bg-green-500 text-white shadow-glow" : "text-green-100 hover:bg-white/10"
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
          {session?.adminStaffId && (
            <>
              <div className="h-px bg-white/10 my-2" />
              <NavLink
                to={SELF_NAV.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? "bg-green-500 text-white shadow-glow" : "text-green-100 hover:bg-white/10"
                  }`
                }
              >
                <Clock3 size={18} />
                {SELF_NAV.label}
              </NavLink>
            </>
          )}
        </nav>

        <div className="px-3 py-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-green-100 hover:bg-white/10 w-full transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-green-100 flex items-center gap-4 px-8 shrink-0 relative">
          <div className="relative flex-1 max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-green-300" />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => query && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              onKeyDown={handleKeyDown}
              placeholder="Search merchants, phone..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-green-100 focus:border-green-500 outline-none text-sm bg-green-50/50"
            />

            {showSuggestions && query.trim() && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-lg shadow-card border border-green-100 overflow-hidden z-50 max-h-64 overflow-y-auto">
                {matches.length === 0 ? (
                  <p className="text-xs text-green-300 px-4 py-3">No merchants match "{query}"</p>
                ) : (
                  matches.slice(0, 6).map((m) => (
                    <button
                      key={m.merchant_id}
                      onMouseDown={() => navigate(`/admin/merchants?q=${encodeURIComponent(m.business_name)}`)}
                      className="w-full text-left px-4 py-2.5 hover:bg-green-50 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-xs font-semibold text-green-700">{m.business_name}</p>
                        <p className="text-[11px] text-green-300">{m.owner_name} · {m.phone}</p>
                      </div>
                      <span className="text-[10px] font-semibold text-green-400 capitalize">{m.status}</span>
                    </button>
                  ))
                )}
                {matches.length > 0 && (
                  <button
                    onMouseDown={goToMerchants}
                    className="w-full text-left px-4 py-2 text-[11px] font-semibold text-green-600 hover:bg-green-50 border-t border-green-50"
                  >
                    View all results in Merchants →
                  </button>
                )}
              </div>
            )}
          </div>

          <NotificationBell userId={session?.userId} items={notifications} />

          <div className="ml-auto text-right">
            <p className="text-sm font-semibold text-green-700">{session?.name}</p>
            <span className="text-[11px] font-semibold text-green-400">{session?.adminRole || "Super Admin Access"}</span>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-8">
          {(() => {
            const matched = [...NAV].sort((a, b) => b.to.length - a.to.length).find((n) => location.pathname.startsWith(n.to));
            if (matched && !canAccessAdmin(session?.adminRole, matched.navKey)) {
              return (
                <div className="max-w-md mx-auto mt-16 text-center">
                  <ShieldAlert size={36} className="text-green-200 mx-auto mb-4" />
                  <p className="font-semibold text-green-700 mb-1">Access restricted</p>
                  <p className="text-sm text-green-400">Your {session?.adminRole || "staff"} role doesn't have access to this section.</p>
                </div>
              );
            }
            return <Outlet />;
          })()}
        </main>
      </div>
    </div>
  );
}
