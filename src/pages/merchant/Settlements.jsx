import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { db } from "../../data/mockData";
import StatCard from "../../components/StatCard";
import StatusBadge from "../../components/StatusBadge";
import { downloadCSV } from "../../utils/csv";
import { Wallet, Clock, CheckCircle2, Download } from "lucide-react";

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export default function Settlements() {
  const { session } = useAuth();
  const { t } = useLanguage();
  const settlements = db.getSettlementsByMerchant(session.merchantId);

  const settled = settlements.filter((s) => s.status === "settled").reduce((sum, s) => sum + s.amount, 0);
  const pending = settlements.filter((s) => s.status === "pending").reduce((sum, s) => sum + s.amount, 0);

  const handleExport = () => {
    downloadCSV(
      `ThiruPay_Settlements_${new Date().toISOString().slice(0, 10)}.csv`,
      settlements.map((s) => ({
        settlement_id: s.settlement_id,
        settlement_date: fmtDate(s.settlement_date),
        amount: s.amount,
        status: s.status,
      })),
      [
        { key: "settlement_id", label: "Settlement ID" },
        { key: "settlement_date", label: "Date" },
        { key: "amount", label: "Amount (INR)" },
        { key: "status", label: "Status" },
      ]
    );
  };

  return (
    <div className="max-w-4xl">
      <div className="flex items-start justify-between gap-3 mb-1">
        <h1 className="font-display font-bold text-2xl text-green-700">{t("settlementsTitle")}</h1>
        {settlements.length > 0 && (
          <button
            onClick={handleExport}
            className="shrink-0 flex items-center gap-1.5 text-xs font-semibold bg-green-700 hover:bg-green-800 text-white px-3.5 py-2 rounded-lg transition-colors"
          >
            <Download size={13} /> Download report
          </button>
        )}
      </div>
      <p className="text-sm text-green-300 mb-6">{t("settlementsSubtitle")}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <StatCard icon={CheckCircle2} label={t("settledToBank")} value={`₹${settled.toLocaleString("en-IN")}`} accent="green" />
        <StatCard icon={Clock} label={t("pendingSettlementLabel")} value={`₹${pending.toLocaleString("en-IN")}`} accent="green" />
      </div>

      {/* overflow-x-auto so the table scrolls sideways on phones instead of breaking the page layout */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[520px]">
            <thead className="bg-green-50 text-green-500 text-xs uppercase font-semibold">
              <tr>
                <th className="text-left px-5 py-3">{t("settlementId")}</th>
                <th className="text-left px-5 py-3">{t("settlementDate")}</th>
                <th className="text-right px-5 py-3">{t("amount")}</th>
                <th className="text-right px-5 py-3">{t("status")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-green-50">
              {settlements.map((s) => (
                <tr key={s.settlement_id} className="hover:bg-green-50/50">
                  <td className="px-5 py-3 font-mono text-xs text-green-500">{s.settlement_id}</td>
                  <td className="px-5 py-3 text-green-400 text-xs">{fmtDate(s.settlement_date)}</td>
                  <td className="px-5 py-3 text-right font-semibold text-green-700">₹{s.amount.toLocaleString("en-IN")}</td>
                  <td className="px-5 py-3 text-right"><StatusBadge status={s.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {settlements.length === 0 && (
          <p className="text-sm text-green-300 text-center py-10 flex items-center justify-center gap-2">
            <Wallet size={16} /> {t("noSettlementsYet")}
          </p>
        )}
      </div>
    </div>
  );
}
