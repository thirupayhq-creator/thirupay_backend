import { useState, useRef, useEffect } from "react";
import { Wallet, TrendingUp, Receipt, Percent, ChevronDown, Check } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { db } from "../../data/mockData";
import { computeFee, MDR_PERCENT } from "../../data/feeConfig";
import StatCard from "../../components/StatCard";

const RANGES = [
  { key: "today", label: "Today", days: 1 },
  { key: "7d", label: "Last 7 days", days: 7 },
  { key: "30d", label: "Last 30 days", days: 30 },
];

export default function AdminCommission() {
  const merchants = db.getMerchants();
  const txns = db.getAllTxns().filter((t) => t.status === "success");

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

  const rangeStart = new Date();
  rangeStart.setDate(rangeStart.getDate() - (range.days - 1));
  rangeStart.setHours(0, 0, 0, 0);
  const txnsInRange = txns.filter((t) => new Date(t.created_at) >= rangeStart);

  // Every txn's commission, computed the same way the merchant-facing
  // Transactions page shows "FEE (MDR)" — single source of truth: feeConfig.js
  const withFee = txnsInRange.map((t) => ({ ...t, fee: computeFee(t.amount).fee }));

  const totalVolume = withFee.reduce((s, t) => s + t.amount, 0);
  const totalCommission = withFee.reduce((s, t) => s + t.fee, 0);
  const avgCommission = withFee.length ? totalCommission / withFee.length : 0;

  // Trend: first half of range vs second half (same pattern as AdminDashboard)
  const chartData = Array.from({ length: range.days }).map((_, i) => {
    const day = new Date();
    day.setDate(day.getDate() - (range.days - 1 - i));
    const label =
      range.days === 1
        ? "Today"
        : range.days <= 7
        ? day.toLocaleDateString("en-IN", { weekday: "short" })
        : day.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
    const dayTxns = withFee.filter((t) => new Date(t.created_at).toDateString() === day.toDateString());
    return { day: label, commission: Math.round(dayTxns.reduce((s, t) => s + t.fee, 0) * 100) / 100 };
  });

  const half = Math.max(1, Math.floor(chartData.length / 2));
  const recent = chartData.slice(-half).reduce((s, d) => s + d.commission, 0);
  const prior = chartData.slice(0, chartData.length - half).reduce((s, d) => s + d.commission, 0);
  const commissionTrend = prior > 0 ? Math.round(((recent - prior) / prior) * 100) : recent > 0 ? 100 : 0;

  // Merchant-wise commission ranking for the selected range
  const commissionByMerchant = merchants
    .map((m) => {
      const mTxns = withFee.filter((t) => t.merchant_id === m.merchant_id);
      return {
        merchant: m,
        commission: mTxns.reduce((s, t) => s + t.fee, 0),
        volume: mTxns.reduce((s, t) => s + t.amount, 0),
        count: mTxns.length,
      };
    })
    .filter((v) => v.count > 0)
    .sort((a, b) => b.commission - a.commission);

  return (
    <div className="max-w-6xl">
      <div className="flex items-start justify-between mb-1 flex-wrap gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl text-green-700 mb-1">Commission Dashboard</h1>
          <p className="text-sm text-green-300">
            ThiruPay's earnings from merchant transactions — {MDR_PERCENT}% MDR on every successful payment.
          </p>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 mt-6">
        <StatCard
          icon={Wallet}
          label="Commission Earned"
          value={`₹${totalCommission.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`}
          sub={range.label.toLowerCase()}
          trend={commissionTrend}
          accent="green"
        />
        <StatCard
          icon={Receipt}
          label="Transaction Volume"
          value={`₹${totalVolume.toLocaleString("en-IN")}`}
          sub={`${withFee.length} successful transactions`}
        />
        <StatCard
          icon={TrendingUp}
          label="Avg Commission / Txn"
          value={`₹${avgCommission.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`}
          sub={range.label.toLowerCase()}
        />
        <StatCard icon={Percent} label="Current MDR Rate" value={`${MDR_PERCENT}%`} sub="flat, all merchants" accent="green" />
      </div>

      <div className="card p-5 mb-6">
        <h2 className="font-display font-semibold text-green-700 mb-4">Commission Trend — {range.label}</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#EAF1F8" vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#3D6EA0" }} axisLine={false} tickLine={false} interval={range.days > 10 ? Math.ceil(range.days / 10) : 0} />
            <YAxis tick={{ fontSize: 12, fill: "#3D6EA0" }} axisLine={false} tickLine={false} />
            <Tooltip formatter={(v) => [`₹${v.toLocaleString("en-IN")}`, "Commission"]} contentStyle={{ borderRadius: 8, border: "1px solid #EAF1F8", fontSize: 12 }} />
            <Bar dataKey="commission" fill="#059669" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={16} className="text-green-500" />
          <h2 className="font-display font-semibold text-green-700">Merchant-wise Commission — {range.label}</h2>
        </div>
        {commissionByMerchant.length === 0 ? (
          <p className="text-sm text-green-300 text-center py-6">No successful transactions in this period.</p>
        ) : (
          <div className="divide-y divide-green-50">
            {commissionByMerchant.map((v, i) => (
              <div key={v.merchant.merchant_id} className="flex items-center justify-between py-2.5">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-green-50 text-green-500 text-[11px] font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-green-700">{v.merchant.business_name}</p>
                    <p className="text-xs text-green-300">
                      {v.count} transactions · ₹{v.volume.toLocaleString("en-IN")} volume
                    </p>
                  </div>
                </div>
                <p className="text-sm font-semibold text-emerald-700">
                  ₹{v.commission.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}