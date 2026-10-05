import { useState, useRef, useEffect } from "react";
import { Users, ShieldCheck, Receipt, Wallet, TrendingUp, ChevronDown, Check } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from "recharts";
import { db } from "../../data/mockData";
import StatCard from "../../components/StatCard";
import StatusBadge from "../../components/StatusBadge";

const STATUS_COLORS = {
  active: "#10B981",
  pending: "#F59E0B",
  rejected: "#F43F5E",
  suspended: "#94A3B8",
};

const RANGES = [
  { key: "today", label: "Today", days: 1 },
  { key: "7d", label: "Last 7 days", days: 7 },
  { key: "30d", label: "Last 30 days", days: 30 },
];

export default function AdminDashboard() {
  const merchants = db.getMerchants();
  const txns = db.getAllTxns();
  const settlements = db.getAllSettlements();

  const [rangeKey, setRangeKey] = useState("7d");
  const [open, setOpen] = useState(false);
  const ddRef = useRef(null);
  const range = RANGES.find((r) => r.key === rangeKey);

  useEffect(() => {
    const onClick = (e) => {
      if (ddRef.current && !ddRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const pendingApprovals = merchants.filter((m) => m.status === "pending").length;
  const activeMerchants = merchants.filter((m) => m.status === "active").length;

  // Chart data for the selected range
  const chartData = Array.from({ length: range.days }).map((_, i) => {
    const day = new Date();
    day.setDate(day.getDate() - (range.days - 1 - i));
    const label =
      range.days === 1
        ? "Today"
        : range.days <= 7
        ? day.toLocaleDateString("en-IN", { weekday: "short" })
        : day.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
    const dayTxns = txns.filter((t) => new Date(t.created_at).toDateString() === day.toDateString());
    return { day: label, volume: dayTxns.reduce((s, t) => s + t.amount, 0), count: dayTxns.length };
  });

  const rangeStart = new Date();
  rangeStart.setDate(rangeStart.getDate() - (range.days - 1));
  rangeStart.setHours(0, 0, 0, 0);
  const txnsInRange = txns.filter((t) => new Date(t.created_at) >= rangeStart);
  const totalVolume = txnsInRange.reduce((s, t) => s + t.amount, 0);
  const pendingSettlement = settlements.filter((s) => s.status === "pending").reduce((s, x) => s + x.amount, 0);

  // trend: first half of range vs second half
  const half = Math.max(1, Math.floor(chartData.length / 2));
  const recent = chartData.slice(-half).reduce((s, d) => s + d.volume, 0);
  const prior = chartData.slice(0, chartData.length - half).reduce((s, d) => s + d.volume, 0);
  const volumeTrend = prior > 0 ? Math.round(((recent - prior) / prior) * 100) : recent > 0 ? 100 : 0;

  const statusCounts = merchants.reduce((acc, m) => {
    acc[m.status] = (acc[m.status] || 0) + 1;
    return acc;
  }, {});
  const donutData = Object.entries(statusCounts).map(([status, count]) => ({ name: status, value: count }));

  const volumeByMerchant = merchants
    .map((m) => ({
      merchant: m,
      volume: txnsInRange.filter((t) => t.merchant_id === m.merchant_id).reduce((s, t) => s + t.amount, 0),
      count: txnsInRange.filter((t) => t.merchant_id === m.merchant_id).length,
    }))
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 5);

  return (
    <div className="max-w-6xl">
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl text-green-700 mb-1">Admin Dashboard</h1>
          <p className="text-sm text-green-300">System-wide overview and key performance indicators.</p>
        </div>

        <div className="relative" ref={ddRef}>
          <button
            onClick={() => setOpen((o) => !o)}
            className="flex items-center gap-1.5 text-xs font-semibold text-green-600 border border-green-100 bg-white px-3 py-2 rounded-lg hover:bg-green-50"
          >
            {range.label} <ChevronDown size={13} className={`transition-transform ${open ? "rotate-180" : ""}`} />
          </button>
          {open && (
            <div className="absolute right-0 mt-1.5 bg-white rounded-lg shadow-card border border-green-100 overflow-hidden z-40 w-44">
              {RANGES.map((r) => (
                <button
                  key={r.key}
                  onClick={() => {
                    setRangeKey(r.key);
                    setOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-medium text-green-600 hover:bg-green-50"
                >
                  {r.label}
                  {rangeKey === r.key && <Check size={13} className="text-green-500" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Users} label="Total Merchants" value={merchants.length} sub={`${activeMerchants} active`} />
        <StatCard icon={ShieldCheck} label="Pending Approvals" value={pendingApprovals} sub="need KYC review" accent="green" />
        <StatCard icon={Receipt} label="Transaction Volume" value={`₹${totalVolume.toLocaleString("en-IN")}`} sub={`${txnsInRange.length} transactions · ${range.label.toLowerCase()}`} trend={volumeTrend} />
        <StatCard icon={Wallet} label="Pending Settlements" value={`₹${pendingSettlement.toLocaleString("en-IN")}`} accent="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <div className="card p-5 lg:col-span-2">
          <h2 className="font-display font-semibold text-green-700 mb-4">Transaction Volume — {range.label}</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EAF1F8" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#3D6EA0" }} axisLine={false} tickLine={false} interval={range.days > 10 ? Math.ceil(range.days / 10) : 0} />
              <YAxis tick={{ fontSize: 12, fill: "#3D6EA0" }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => [`₹${v.toLocaleString("en-IN")}`, "Volume"]} contentStyle={{ borderRadius: 8, border: "1px solid #EAF1F8", fontSize: 12 }} />
              <Bar dataKey="volume" fill="#0B2A4A" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h2 className="font-display font-semibold text-green-700 mb-2">Merchant Status</h2>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={donutData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={70} paddingAngle={3}>
                {donutData.map((entry) => (
                  <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || "#94A3B8"} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #EAF1F8", fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 justify-center mt-1">
            {donutData.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: STATUS_COLORS[d.name] || "#94A3B8" }} />
                <span className="text-[11px] text-green-400 capitalize">{d.name} ({d.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-green-500" />
            <h2 className="font-display font-semibold text-green-700">Top Merchants — {range.label}</h2>
          </div>
          {volumeByMerchant.length === 0 || volumeByMerchant[0].volume === 0 ? (
            <p className="text-sm text-green-300 text-center py-6">No transaction volume in this period.</p>
          ) : (
            <div className="divide-y divide-green-50">
              {volumeByMerchant.map((v, i) => (
                <div key={v.merchant.merchant_id} className="flex items-center justify-between py-2.5">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-green-50 text-green-500 text-[11px] font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                    <div>
                      <p className="text-sm font-semibold text-green-700">{v.merchant.business_name}</p>
                      <p className="text-xs text-green-300">{v.count} transactions</p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-green-700">₹{v.volume.toLocaleString("en-IN")}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-5">
          <h2 className="font-display font-semibold text-green-700 mb-4">Recent Merchant Activity</h2>
          <div className="divide-y divide-green-50">
            {merchants.slice(0, 5).map((m) => (
              <div key={m.merchant_id} className="flex items-center justify-between py-2.5">
                <div>
                  <p className="text-sm font-semibold text-green-700">{m.business_name}</p>
                  <p className="text-xs text-green-300">{m.owner_name} · {m.phone}</p>
                </div>
                <StatusBadge status={m.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
