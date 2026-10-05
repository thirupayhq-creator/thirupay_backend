import { Link } from "react-router-dom";
import { IndianRupee, Receipt, QrCode, Link2, Clock, Wallet, Sparkles } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from "recharts";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { db } from "../../data/mockData";
import { PAYMENT_MODE_COLORS } from "../../data/paymentModes";
import StatCard from "../../components/StatCard";
import StatusBadge from "../../components/StatusBadge";
import PromoBanner from "../../components/PromoBanner";  

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const hrs = Math.floor(diff / 3600000);
  if (hrs < 1) return "just now";
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function Dashboard() {
  const { session } = useAuth();
  const { t } = useLanguage();
  const merchant = db.getMerchantById(session.merchantId);
  const kyc = db.getKycByMerchant(session.merchantId);
  const txns = db.getTxnsByMerchant(session.merchantId);
  const links = db.getLinksByMerchant(session.merchantId);
  const settlements = db.getSettlementsByMerchant(session.merchantId);

  const today = new Date().toDateString();
  const todaysTxns = txns.filter((t) => new Date(t.created_at).toDateString() === today);
  const todaysTotal = todaysTxns.reduce((s, t) => s + t.amount, 0);
  const totalCollected = txns.reduce((s, t) => s + t.amount, 0);
  const pendingLinks = links.filter((l) => l.status === "pending").length;
  const isActive = merchant?.status === "active";

  // 7-day trend
  const chartData = Array.from({ length: 7 }).map((_, i) => {
    const day = new Date();
    day.setDate(day.getDate() - (6 - i));
    const label = day.toLocaleDateString("en-IN", { weekday: "short" });
    const dayTotal = txns.filter((t) => new Date(t.created_at).toDateString() === day.toDateString()).reduce((s, t) => s + t.amount, 0);
    return { day: label, volume: dayTotal };
  });

  // Payment mode split (UPI / Card / Wallet)
  const splitData = ["UPI", "Card", "Wallet"]
    .map((mode) => ({ name: mode, value: txns.filter((t) => t.payment_mode === mode).reduce((s, t) => s + t.amount, 0) }))
    .filter((d) => d.value > 0);

  // Settlement summary
  const pendingSettlement = settlements.filter((s) => s.status === "pending").reduce((s, x) => s + x.amount, 0);
  const nextSettlement = settlements.filter((s) => s.status === "pending").sort((a, b) => new Date(a.settlement_date) - new Date(b.settlement_date))[0];

  return (
    <div className="max-w-6xl">
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl text-green-700">{t("welcome")}, {merchant?.owner_name?.split(" ")[0]}</h1>
        
      </div>
        <PromoBanner merchant={merchant} />  
      {!isActive && (
        <div className="card p-5 mb-6 border-l-4 border-amber-400 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock size={20} />
          </div>
          <div>
            <p className="font-semibold text-green-700 text-sm">
              {kyc ? t("kycSubmittedTitle") : t("kycPendingTitle")}
            </p>
            <p className="text-xs text-green-300 mt-0.5">
              {kyc ? t("kycSubmittedSub") : t("kycPendingSub")}
            </p>
          </div>
          {!kyc && (
            <Link to="/merchant/kyc" className="ml-auto shrink-0 bg-green-700 text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-green-800">
              {t("uploadKyc")}
            </Link>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={IndianRupee} label={t("todaysCollection")} value={`₹${todaysTotal.toLocaleString("en-IN")}`} sub={`${todaysTxns.length} ${t("transactionsTitle").toLowerCase()}`} accent="green" />
        <StatCard icon={Receipt} label={t("totalCollectedLabel")} value={`₹${totalCollected.toLocaleString("en-IN")}`} sub={t("allTime")} />
        <StatCard icon={QrCode} label={t("qrPayments")} value={txns.filter((t) => t.payment_method === "QR").length} sub={t("viaQrScans")} />
        <StatCard icon={Link2} label={t("pendingLinksLabel")} value={pendingLinks} sub={t("awaitingPayment")} />
      </div>

      {todaysTotal === 0 && isActive && (
        <div className="card p-4 mb-6 bg-green-50/60 border border-green-100 flex items-center gap-3">
          <Sparkles size={16} className="text-green-500 shrink-0" />
          <p className="text-xs text-green-500">{t("noSalesToday")}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="card p-5 lg:col-span-2">
          <h2 className="font-display font-semibold text-green-700 mb-4">{t("collectionTrend")}</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EAF1F8" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#3D6EA0" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#3D6EA0" }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => [`₹${v.toLocaleString("en-IN")}`, "Collected"]} contentStyle={{ borderRadius: 8, border: "1px solid #EAF1F8", fontSize: 12 }} />
              <Bar dataKey="volume" fill="#0B2A4A" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5 flex flex-col">
          <h2 className="font-display font-semibold text-green-700 mb-2">{t("collectionSplit")}</h2>
          {splitData.length === 0 ? (
            <p className="text-sm text-green-300 text-center py-10">{t("noCollectionsYet")}</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie data={splitData} dataKey="value" nameKey="name" innerRadius={38} outerRadius={62} paddingAngle={3}>
                    {splitData.map((d) => (
                      <Cell key={d.name} fill={PAYMENT_MODE_COLORS[d.name]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => [`₹${v.toLocaleString("en-IN")}`, ""]} contentStyle={{ borderRadius: 8, border: "1px solid #EAF1F8", fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-1">
                {splitData.map((d) => (
                  <div key={d.name} className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: PAYMENT_MODE_COLORS[d.name] }} />
                    <span className="text-[11px] text-green-400">{d.name}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Link
          to={isActive ? "/merchant/qr" : "#"}
          className={`card p-5 flex items-center gap-4 group transition-transform ${isActive ? "hover:-translate-y-0.5" : "opacity-50 cursor-not-allowed"}`}
        >
          <div className="w-11 h-11 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
            <QrCode size={20} />
          </div>
          <div>
            <p className="font-semibold text-green-700 text-sm">{t("generateQRTitle")}</p>
            <p className="text-xs text-green-300">{t("receivePaymentsInstantly")}</p>
          </div>
        </Link>
        <Link
          to={isActive ? "/merchant/links" : "#"}
          className={`card p-5 flex items-center gap-4 group transition-transform ${isActive ? "hover:-translate-y-0.5" : "opacity-50 cursor-not-allowed"}`}
        >
          <div className="w-11 h-11 rounded-xl bg-green-50 text-green-700 flex items-center justify-center">
            <Link2 size={20} />
          </div>
          <div>
            <p className="font-semibold text-green-700 text-sm">{t("createPaymentLinkTitle")}</p>
            <p className="text-xs text-green-300">{t("shareViaWhatsappSms")}</p>
          </div>
        </Link>
        <Link to="/merchant/settlements" className="card p-5 flex items-center gap-4 group hover:-translate-y-0.5 transition-transform">
          <div className="w-11 h-11 rounded-xl bg-green-50 text-green-700 flex items-center justify-center">
            <Wallet size={20} />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-green-700 text-sm">₹{pendingSettlement.toLocaleString("en-IN")} {t("settlingSuffix")}</p>
            <p className="text-xs text-green-300 truncate">
              {nextSettlement ? `${t("nextLabel")}: ${new Date(nextSettlement.settlement_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}` : t("noPendingSettlements")}
            </p>
          </div>
        </Link>
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-green-700">{t("recentTransactions")}</h2>
          <Link to="/merchant/transactions" className="text-xs font-semibold text-green-600 hover:underline">{t("viewAll")}</Link>
        </div>
        {txns.length === 0 ? (
          <p className="text-sm text-green-300 text-center py-8">{t("noTransactionsGenerateQr")}</p>
        ) : (
          <div className="divide-y divide-green-50">
            {txns.slice(0, 5).map((t) => (
              <div key={t.transaction_id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-semibold text-green-700">₹{t.amount.toLocaleString("en-IN")}</p>
                  <p className="text-xs text-green-300">{t.payment_method}{t.payment_mode ? ` · ${t.payment_mode}` : ""} · {timeAgo(t.created_at)}</p>
                </div>
                <StatusBadge status={t.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
