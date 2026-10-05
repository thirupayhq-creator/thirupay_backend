import { useState } from "react";
import { TrendingUp, Clock, CalendarDays, Receipt, Undo2, Download, CheckCircle2, XCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { db } from "../../data/mockData";
import { PAYMENT_MODE_COLORS } from "../../data/paymentModes";
import { computeFee } from "../../data/feeConfig";
import { downloadCSV } from "../../utils/csv";
import StatCard from "../../components/StatCard";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const REPORT_RANGES = [
  { key: "today", label: "Today" },
  { key: "week", label: "This Week" },
  { key: "month", label: "This Month" },
  { key: "custom", label: "Custom Range" },
];

function fmtMoney(n) {
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}

function hourLabel(h) {
  const hr = h % 12 === 0 ? 12 : h % 12;
  const suffix = h < 12 ? "AM" : "PM";
  return `${hr}${suffix}`;
}

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

// ---------- Transaction Reports (Daily / Weekly / Monthly / Custom) ----------
function TransactionReports({ allTxns }) {
  const [rangeKey, setRangeKey] = useState("week");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const now = new Date();
  let rangeStart, rangeEnd;

  if (rangeKey === "today") {
    rangeStart = startOfDay(now);
    rangeEnd = new Date();
  } else if (rangeKey === "week") {
    rangeStart = startOfDay(new Date(now.getTime() - 6 * 86400000));
    rangeEnd = new Date();
  } else if (rangeKey === "month") {
    rangeStart = new Date(now.getFullYear(), now.getMonth(), 1);
    rangeEnd = new Date();
  } else {
    rangeStart = customFrom ? startOfDay(new Date(customFrom)) : startOfDay(now);
    rangeEnd = customTo ? new Date(new Date(customTo).setHours(23, 59, 59, 999)) : new Date();
  }

  const inRange = allTxns.filter((t) => {
    const d = new Date(t.created_at);
    return d >= rangeStart && d <= rangeEnd;
  });

  const successTxns = inRange.filter((t) => t.status === "success");
  const failedTxns = inRange.filter((t) => t.status !== "success");
  const totalVolume = successTxns.reduce((s, t) => s + t.amount, 0);
  const successRate = inRange.length > 0 ? Math.round((successTxns.length / inRange.length) * 100) : 0;

  // Payment mode breakup within range
  const modeMap = {};
  successTxns.forEach((t) => {
    const mode = t.payment_mode || "Other";
    modeMap[mode] = (modeMap[mode] || 0) + t.amount;
  });
  const modeBreakup = Object.entries(modeMap)
    .map(([mode, volume]) => ({ mode, volume, pct: totalVolume > 0 ? Math.round((volume / totalVolume) * 100) : 0 }))
    .sort((a, b) => b.volume - a.volume);

  // Daily trend within the range (capped visually — fine up to ~31 bars for "This Month")
  const dayCount = Math.max(1, Math.ceil((rangeEnd - rangeStart) / 86400000) + 1);
  const trendData = Array.from({ length: dayCount }).map((_, i) => {
    const day = new Date(rangeStart.getTime() + i * 86400000);
    const dayTxns = successTxns.filter((t) => startOfDay(new Date(t.created_at)).getTime() === startOfDay(day).getTime());
    return {
      label: dayCount <= 31 ? day.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "",
      volume: dayTxns.reduce((s, t) => s + t.amount, 0),
    };
  });

  const handleExport = () => {
    const rows = inRange
      .slice()
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .map((t) => {
        const { fee, net } = computeFee(t.amount);
        return {
          transaction_id: t.transaction_id,
          method: t.payment_method,
          mode: t.payment_mode,
          date: new Date(t.created_at).toLocaleString("en-IN"),
          amount: t.amount,
          fee: t.status === "success" ? fee : 0,
          net: t.status === "success" ? net : 0,
          status: t.status,
        };
      });
    downloadCSV(`transactions_${rangeKey}_${Date.now()}.csv`, rows, [
      { key: "transaction_id", label: "Transaction ID" },
      { key: "method", label: "Method" },
      { key: "mode", label: "Mode" },
      { key: "date", label: "Date" },
      { key: "amount", label: "Amount" },
      { key: "fee", label: "Fee (MDR)" },
      { key: "net", label: "Net" },
      { key: "status", label: "Status" },
    ]);
  };

  return (
    <div className="card p-5 mb-6">
      <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
        <div>
          <h2 className="font-display font-semibold text-green-700">Transaction Reports</h2>
          <p className="text-xs text-green-300 mt-0.5">Daily, weekly and monthly breakdown of your collections.</p>
        </div>
        <button
          onClick={handleExport}
          disabled={inRange.length === 0}
          className="flex items-center gap-1.5 text-xs font-semibold text-green-600 border border-green-100 px-3 py-1.5 rounded-lg hover:bg-green-50 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
        >
          <Download size={13} /> Export CSV
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-5">
        {REPORT_RANGES.map((r) => (
          <button
            key={r.key}
            onClick={() => setRangeKey(r.key)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
              rangeKey === r.key
                ? "bg-green-600 text-white border-green-600"
                : "text-green-600 border-green-100 hover:bg-green-50"
            }`}
          >
            {r.label}
          </button>
        ))}
        {rangeKey === "custom" && (
          <div className="flex items-center gap-2 ml-1">
            <input
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-green-100 outline-none"
            />
            <span className="text-xs text-green-300">to</span>
            <input
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-green-100 outline-none"
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
        <div className="bg-green-50/60 rounded-xl p-3.5">
          <p className="text-[11px] font-semibold text-green-400 uppercase tracking-wide">Total Volume</p>
          <p className="font-display font-bold text-lg text-green-700 mt-1">{fmtMoney(totalVolume)}</p>
        </div>
        <div className="bg-green-50/60 rounded-xl p-3.5">
          <p className="text-[11px] font-semibold text-green-400 uppercase tracking-wide">Total Transactions</p>
          <p className="font-display font-bold text-lg text-green-700 mt-1">{inRange.length}</p>
        </div>
        <div className="bg-emerald-50/60 rounded-xl p-3.5">
          <p className="text-[11px] font-semibold text-emerald-500 uppercase tracking-wide flex items-center gap-1">
            <CheckCircle2 size={11} /> Success
          </p>
          <p className="font-display font-bold text-lg text-emerald-700 mt-1">{successTxns.length}</p>
        </div>
        <div className="bg-rose-50/60 rounded-xl p-3.5">
          <p className="text-[11px] font-semibold text-rose-500 uppercase tracking-wide flex items-center gap-1">
            <XCircle size={11} /> Failed
          </p>
          <p className="font-display font-bold text-lg text-rose-700 mt-1">{failedTxns.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EAF1F8" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#3D6EA0" }} axisLine={false} tickLine={false} interval={dayCount > 10 ? Math.ceil(dayCount / 8) : 0} />
              <YAxis tick={{ fontSize: 11, fill: "#3D6EA0" }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => [`₹${v.toLocaleString("en-IN")}`, "Collected"]} contentStyle={{ borderRadius: 8, border: "1px solid #EAF1F8", fontSize: 12 }} />
              <Bar dataKey="volume" fill="#0B2A4A" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div>
          <p className="text-xs font-semibold text-green-700 mb-2">Payment Mode ({rangeKeyLabel(rangeKey)})</p>
          {modeBreakup.length === 0 ? (
            <p className="text-xs text-green-300">No successful transactions in this period.</p>
          ) : (
            <div className="space-y-3">
              {modeBreakup.map((m) => (
                <div key={m.mode}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-green-700 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: PAYMENT_MODE_COLORS[m.mode] || "#8FBFDD" }} />
                      {m.mode}
                    </span>
                    <span className="text-xs text-green-400">{m.pct}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-green-50 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${m.pct}%`, backgroundColor: PAYMENT_MODE_COLORS[m.mode] || "#8FBFDD" }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function rangeKeyLabel(key) {
  return REPORT_RANGES.find((r) => r.key === key)?.label || "";
}

export default function Insights() {
  const { session } = useAuth();
  const { t } = useLanguage();
  const allTxns = db.getTxnsByMerchant(session.merchantId);
  const txns = allTxns.filter((tx) => tx.status === "success");
  const refunds = db.getRefundsByMerchant(session.merchantId);

  const now = Date.now();
  const last14 = txns.filter((tx) => now - new Date(tx.created_at).getTime() <= 14 * 86400000);
  const currentWeek = last14.filter((tx) => now - new Date(tx.created_at).getTime() <= 7 * 86400000);
  const previousWeek = last14.filter((tx) => {
    const age = now - new Date(tx.created_at).getTime();
    return age > 7 * 86400000 && age <= 14 * 86400000;
  });

  const currentWeekTotal = currentWeek.reduce((s, tx) => s + tx.amount, 0);
  const previousWeekTotal = previousWeek.reduce((s, tx) => s + tx.amount, 0);
  const weekGrowth = previousWeekTotal > 0 ? Math.round(((currentWeekTotal - previousWeekTotal) / previousWeekTotal) * 100) : null;

  const avgTicket = txns.length > 0 ? txns.reduce((s, tx) => s + tx.amount, 0) / txns.length : 0;

  const hourBuckets = Array.from({ length: 24 }).map((_, h) => ({ hour: h, volume: 0, count: 0 }));
  txns.forEach((tx) => {
    const h = new Date(tx.created_at).getHours();
    hourBuckets[h].volume += tx.amount;
    hourBuckets[h].count += 1;
  });
  const peakHourBucket = hourBuckets.reduce((max, b) => (b.volume > max.volume ? b : max), hourBuckets[0]);
  const hourChartData = hourBuckets
    .filter((b) => b.count > 0)
    .map((b) => ({ label: hourLabel(b.hour), volume: b.volume, hour: b.hour }));

  const dayBuckets = Array.from({ length: 7 }).map((_, d) => ({ day: d, volume: 0 }));
  txns.forEach((tx) => {
    const d = new Date(tx.created_at).getDay();
    dayBuckets[d].volume += tx.amount;
  });
  const bestDay = dayBuckets.reduce((max, b) => (b.volume > max.volume ? b : max), dayBuckets[0]);

  const modeMap = {};
  txns.forEach((tx) => {
    const mode = tx.payment_mode || "Other";
    if (!modeMap[mode]) modeMap[mode] = { mode, volume: 0, count: 0 };
    modeMap[mode].volume += tx.amount;
    modeMap[mode].count += 1;
  });
  const totalVolume = txns.reduce((s, tx) => s + tx.amount, 0);
  const modeBreakdown = Object.values(modeMap)
    .map((m) => ({ ...m, pct: totalVolume > 0 ? Math.round((m.volume / totalVolume) * 100) : 0, avg: m.volume / m.count }))
    .sort((a, b) => b.volume - a.volume);
  const topMode = modeBreakdown[0];

  const refundedAmount = refunds.filter((r) => r.status === "refunded").reduce((s, r) => s + r.amount, 0);
  const refundRate = totalVolume > 0 ? ((refundedAmount / totalVolume) * 100).toFixed(1) : "0.0";

  return (
    <div className="max-w-6xl">
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl text-green-700">{t("insightsTitle")}</h1>
        <p className="text-sm text-green-300 mt-1">{t("insightsSubtitle")}</p>
      </div>

      <TransactionReports allTxns={allTxns} />

      {txns.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-sm text-green-300">{t("noInsightsYet")}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              icon={TrendingUp}
              label={t("weekOnWeek")}
              value={weekGrowth === null ? "—" : `${weekGrowth >= 0 ? "+" : ""}${weekGrowth}%`}
              sub={`${fmtMoney(currentWeekTotal)} ${t("thisWeek")}`}
              trend={weekGrowth ?? undefined}
            />
            <StatCard icon={Receipt} label={t("avgTicketSize")} value={fmtMoney(avgTicket)} sub={`${txns.length} ${t("transactionsTitle").toLowerCase()}`} />
            <StatCard icon={Clock} label={t("peakHour")} value={peakHourBucket.count > 0 ? hourLabel(peakHourBucket.hour) : "—"} sub={peakHourBucket.count > 0 ? `${fmtMoney(peakHourBucket.volume)} ${t("collected")}` : "—"} />
            <StatCard icon={CalendarDays} label={t("bestDay")} value={bestDay.volume > 0 ? DAY_NAMES[bestDay.day] : "—"} sub={bestDay.volume > 0 ? fmtMoney(bestDay.volume) : "—"} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            <div className="card p-5 lg:col-span-2">
              <h2 className="font-display font-semibold text-green-700 mb-1">{t("collectionsByHour")}</h2>
              <p className="text-xs text-green-300 mb-4">{t("collectionsByHourSub")}</p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={hourChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EAF1F8" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#3D6EA0" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#3D6EA0" }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v) => [`₹${v.toLocaleString("en-IN")}`, "Collected"]} contentStyle={{ borderRadius: 8, border: "1px solid #EAF1F8", fontSize: 12 }} />
                  <Bar dataKey="volume" radius={[6, 6, 0, 0]}>
                    {hourChartData.map((d) => (
                      <Cell key={d.hour} fill={d.hour === peakHourBucket.hour ? "#0B2A4A" : "#8FBFDD"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="card p-5">
              <h2 className="font-display font-semibold text-green-700 mb-4">{t("paymentModeBreakdown")}</h2>
              <div className="space-y-4">
                {modeBreakdown.map((m) => (
                  <div key={m.mode}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-green-700 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: PAYMENT_MODE_COLORS[m.mode] || "#8FBFDD" }} />
                        {m.mode}
                      </span>
                      <span className="text-xs text-green-400">{m.pct}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-green-50 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${m.pct}%`, backgroundColor: PAYMENT_MODE_COLORS[m.mode] || "#8FBFDD" }} />
                    </div>
                    <p className="text-[11px] text-green-300 mt-1">{t("avgTicket")}: {fmtMoney(m.avg)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="card p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-green-50 text-green-700 flex items-center justify-center shrink-0">
                <TrendingUp size={20} />
              </div>
              <div>
                <p className="font-semibold text-green-700 text-sm">{topMode ? `${topMode.mode} ${t("isYourTopMode")}` : t("noDataYet")}</p>
                <p className="text-xs text-green-300">{topMode ? `${topMode.pct}% ${t("ofYourCollections")}` : "—"}</p>
              </div>
            </div>
            <div className="card p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-violet-50 text-violet-700 flex items-center justify-center shrink-0">
                <Undo2 size={20} />
              </div>
              <div>
                <p className="font-semibold text-green-700 text-sm">{t("refundRate")}: {refundRate}%</p>
                <p className="text-xs text-green-300">{fmtMoney(refundedAmount)} {t("refundedAllTime")}</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}