import { useState } from "react";
import { db } from "../../data/mockData";
import StatusBadge from "../../components/StatusBadge";

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export default function SettlementManagement() {
  const [tick, setTick] = useState(0);
  const settlements = db.getAllSettlements();
  const merchants = db.getMerchants();
  const merchantName = (id) => merchants.find((m) => m.merchant_id === id)?.business_name || id;

  const markSettled = (id) => {
    db.updateSettlementStatus(id, "settled");
    setTick((t) => t + 1);
  };

  return (
    <div className="max-w-5xl">
      <h1 className="font-display font-bold text-2xl text-green-700 mb-1">Settlement Management</h1>
      <p className="text-sm text-green-300 mb-6">Process and track fund transfers to merchant bank accounts.</p>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-green-50 text-green-500 text-xs uppercase font-semibold">
            <tr>
              <th className="text-left px-5 py-3">Settlement ID</th>
              <th className="text-left px-5 py-3">Merchant</th>
              <th className="text-left px-5 py-3">Settlement Date</th>
              <th className="text-right px-5 py-3">Amount</th>
              <th className="text-right px-5 py-3">Status</th>
              <th className="text-right px-5 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-green-50">
            {settlements.map((s) => (
              <tr key={s.settlement_id} className="hover:bg-green-50/50">
                <td className="px-5 py-3 font-mono text-xs text-green-500">{s.settlement_id}</td>
                <td className="px-5 py-3 font-semibold text-green-700">{merchantName(s.merchant_id)}</td>
                <td className="px-5 py-3 text-green-400 text-xs">{fmtDate(s.settlement_date)}</td>
                <td className="px-5 py-3 text-right font-semibold text-green-700">₹{s.amount.toLocaleString("en-IN")}</td>
                <td className="px-5 py-3 text-right"><StatusBadge status={s.status} /></td>
                <td className="px-5 py-3 text-right">
                  {s.status === "pending" && (
                    <button
                      onClick={() => markSettled(s.settlement_id)}
                      className="text-xs font-semibold text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-lg hover:bg-emerald-50"
                    >
                      Mark Settled
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {settlements.length === 0 && <p className="text-sm text-green-300 text-center py-10">No settlements yet.</p>}
      </div>
    </div>
  );
}
