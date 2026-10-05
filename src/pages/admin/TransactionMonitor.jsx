import { useState } from "react";
import { Search } from "lucide-react";
import { db } from "../../data/mockData";
import { PAYMENT_MODE_COLORS } from "../../data/paymentModes";
import StatusBadge from "../../components/StatusBadge";

function fmtDate(iso) {
  return new Date(iso).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default function TransactionMonitor() {
  const [query, setQuery] = useState("");
  const txns = db.getAllTxns();
  const merchants = db.getMerchants();
  const merchantName = (id) => merchants.find((m) => m.merchant_id === id)?.business_name || id;

  const filtered = txns.filter(
    (t) => t.transaction_id.toLowerCase().includes(query.toLowerCase()) || merchantName(t.merchant_id).toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="max-w-5xl">
      <h1 className="font-display font-bold text-2xl text-green-700 mb-1">Transaction Monitoring</h1>
      <p className="text-sm text-green-300 mb-6">All payments across every merchant on the platform.</p>

      <div className="relative mb-4 max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-green-300" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by merchant or ID..."
          className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-green-100 focus:border-green-500 outline-none text-sm bg-white"
        />
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-green-50 text-green-500 text-xs uppercase font-semibold">
            <tr>
              <th className="text-left px-5 py-3">Transaction ID</th>
              <th className="text-left px-5 py-3">Merchant</th>
              <th className="text-left px-5 py-3">Method</th>
              <th className="text-left px-5 py-3">Mode</th>
              <th className="text-left px-5 py-3">Date</th>
              <th className="text-right px-5 py-3">Amount</th>
              <th className="text-right px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-green-50">
            {filtered.map((t) => (
              <tr key={t.transaction_id} className="hover:bg-green-50/50">
                <td className="px-5 py-3 font-mono text-xs text-green-500">{t.transaction_id}</td>
                <td className="px-5 py-3 font-semibold text-green-700">{merchantName(t.merchant_id)}</td>
                <td className="px-5 py-3 text-green-500">{t.payment_method}</td>
                <td className="px-5 py-3">
                  {t.payment_mode && (
                    <span
                      className="text-[11px] font-semibold px-2 py-0.5 rounded-full border"
                      style={{
                        color: PAYMENT_MODE_COLORS[t.payment_mode],
                        borderColor: PAYMENT_MODE_COLORS[t.payment_mode] + "40",
                        backgroundColor: PAYMENT_MODE_COLORS[t.payment_mode] + "0D",
                      }}
                    >
                      {t.payment_mode}
                    </span>
                  )}
                </td>
                <td className="px-5 py-3 text-green-400 text-xs">{fmtDate(t.created_at)}</td>
                <td className="px-5 py-3 text-right font-semibold text-green-700">₹{t.amount.toLocaleString("en-IN")}</td>
                <td className="px-5 py-3 text-right"><StatusBadge status={t.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="text-sm text-green-300 text-center py-10">No transactions found.</p>}
      </div>
    </div>
  );
}
