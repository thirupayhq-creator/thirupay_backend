import { useState } from "react";
import { Search, Flag, Download, Undo2, X, RefreshCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { useToast } from "../../context/ToastContext";
import { db, genId } from "../../data/mockData";
import { PAYMENT_MODE_COLORS } from "../../data/paymentModes";
import { computeFee } from "../../data/feeConfig";
import { downloadReceiptPDF } from "../../utils/receipt";
import StatusBadge from "../../components/StatusBadge";

const REFUND_REASONS = [
  "Customer requested",
  "Duplicate payment",
  "Product / service returned",
  "Order cancelled",
  "Other",
];

function fmtDate(iso) {
  return new Date(iso).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function fmtMoney(n) {
  return `₹${Number(n).toLocaleString("en-IN")}`;
}

export default function Transactions() {
  const { session } = useAuth();
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [query, setQuery] = useState("");
  const [refundTxn, setRefundTxn] = useState(null); // txn currently being refunded (modal)
  const merchant = db.getMerchantById(session.merchantId);
  const all = db.getTxnsByMerchant(session.merchantId);
  const [refunds, setRefunds] = useState(db.getRefundsByMerchant(session.merchantId));

  const refundFor = (txnId) => refunds.find((r) => r.transaction_id === txnId);

  const refreshRefunds = () => setRefunds(db.getRefundsByMerchant(session.merchantId));

  const filtered = all.filter(
    (tx) => tx.transaction_id.toLowerCase().includes(query.toLowerCase()) || tx.payment_method.toLowerCase().includes(query.toLowerCase())
  );

  const submitRefund = ({ amount, reason, note }) => {
    const refund = {
      refund_id: genId("rf"),
      transaction_id: refundTxn.transaction_id,
      merchant_id: merchant.merchant_id,
      amount,
      reason,
      note,
      status: "processing",
      created_at: new Date().toISOString(),
      processed_at: null,
    };
    db.addRefund(refund);
    refreshRefunds();
    setRefundTxn(null);
    showToast({
      title: t("refundInitiated"),
      subtitle: `${fmtMoney(amount)} · ${refundTxn.transaction_id}`,
      type: "info",
    });
  };

  const simulateRefundComplete = (refund) => {
    db.updateRefundStatus(refund.refund_id, "refunded");
    refreshRefunds();
    showToast({
      title: t("refundCompleted"),
      subtitle: `${fmtMoney(refund.amount)} credited back to customer`,
      type: "success",
    });
  };

  return (
    <div className="max-w-5xl">
      <h1 className="font-display font-bold text-2xl text-green-700 mb-1">{t("transactionsTitle")}</h1>
      <p className="text-sm text-green-300 mb-6">{t("transactionsSubtitle")}</p>

      <div className="relative mb-4 max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-green-300" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("searchByIdMethod")}
          className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-green-100 focus:border-green-500 outline-none text-sm bg-white"
        />
      </div>

      {/* overflow-x-auto so the table scrolls sideways on phones instead of breaking the page layout */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[960px]">
            <thead className="bg-green-50 text-green-500 text-xs uppercase font-semibold">
              <tr>
                <th className="text-left px-5 py-3">{t("txnId")}</th>
                <th className="text-left px-5 py-3">{t("method")}</th>
                <th className="text-left px-5 py-3">Mode</th>
                <th className="text-left px-5 py-3">{t("date")}</th>
                <th className="text-right px-5 py-3">{t("amount")}</th>
                <th className="text-right px-5 py-3">Fee (MDR)</th>
                <th className="text-right px-5 py-3">Net</th>
                <th className="text-right px-5 py-3">{t("status")}</th>
                <th className="text-right px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-green-50">
              {filtered.map((tx) => {
                const { fee, net } = computeFee(tx.amount);
                const refund = refundFor(tx.transaction_id);
                return (
                  <tr key={tx.transaction_id} className="hover:bg-green-50/50">
                    <td className="px-5 py-3 font-mono text-xs text-green-500">{tx.transaction_id}</td>
                    <td className="px-5 py-3 text-green-600">{tx.payment_method}</td>
                    <td className="px-5 py-3">
                      {tx.payment_mode && (
                        <span
                          className="text-[11px] font-semibold px-2 py-0.5 rounded-full border"
                          style={{
                            color: PAYMENT_MODE_COLORS[tx.payment_mode],
                            borderColor: PAYMENT_MODE_COLORS[tx.payment_mode] + "40",
                            backgroundColor: PAYMENT_MODE_COLORS[tx.payment_mode] + "0D",
                          }}
                        >
                          {tx.payment_mode}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-green-400 text-xs">{fmtDate(tx.created_at)}</td>
                    <td className="px-5 py-3 text-right font-semibold text-green-700">₹{tx.amount.toLocaleString("en-IN")}</td>
                    <td className="px-5 py-3 text-right text-rose-500 text-xs">-₹{fee.toLocaleString("en-IN")}</td>
                    <td className="px-5 py-3 text-right font-semibold text-emerald-600">₹{net.toLocaleString("en-IN")}</td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex flex-col items-end gap-1">
                        <StatusBadge status={refund?.status === "refunded" ? "refunded" : tx.status} />
                        {refund && refund.status === "processing" && (
                          <button
                            onClick={() => simulateRefundComplete(refund)}
                            className="text-[10px] font-semibold text-sky-600 hover:underline flex items-center gap-1"
                            title={t("simulateRefundDemo")}
                          >
                            <RefreshCcw size={10} /> {t("refundProcessingLabel")}
                          </button>
                        )}
                        {refund && refund.status === "refunded" && (
                          <span className="text-[10px] text-green-300">{fmtMoney(refund.amount)} · {fmtDate(refund.processed_at)}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {tx.status === "success" && (
                          <button
                            onClick={() => downloadReceiptPDF(tx, merchant)}
                            className="text-green-300 hover:text-green-600 inline-flex items-center"
                            title="Download receipt"
                          >
                            <Download size={13} />
                          </button>
                        )}
                        {tx.status === "success" && !refund && (
                          <button
                            onClick={() => setRefundTxn(tx)}
                            className="text-green-300 hover:text-rose-500 inline-flex items-center"
                            title={t("initiateRefund")}
                          >
                            <Undo2 size={13} />
                          </button>
                        )}
                        <Link
                          to={`/merchant/help?report=${tx.transaction_id}`}
                          className="text-green-300 hover:text-rose-500 inline-flex items-center"
                          title="Report a problem"
                        >
                          <Flag size={13} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <p className="text-sm text-green-300 text-center py-10">{t("noTransactionsFound")}</p>}
      </div>

      <AnimatePresence>
        {refundTxn && (
          <RefundModal
            txn={refundTxn}
            t={t}
            onClose={() => setRefundTxn(null)}
            onSubmit={submitRefund}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function RefundModal({ txn, onClose, onSubmit, t }) {
  const [amount, setAmount] = useState(txn.amount);
  const [reason, setReason] = useState(REFUND_REASONS[0]);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const amt = Number(amount);
    if (!amt || amt <= 0) return setError(t("enterValidAmount"));
    if (amt > txn.amount) return setError(t("refundExceedsAmount"));
    setError("");
    onSubmit({ amount: amt, reason, note });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-green-900/50 flex items-center justify-center z-50 px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-card w-full max-w-md p-6 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-display font-bold text-lg text-green-700">{t("initiateRefund")}</h3>
          <button onClick={onClose} className="text-green-300 hover:text-green-600">
            <X size={18} />
          </button>
        </div>
        <p className="text-xs text-green-300 mb-5 font-mono">{txn.transaction_id} · {fmtMoney(txn.amount)}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-green-600 block mb-1.5">{t("refundAmount")}</label>
            <input
              type="number"
              min="1"
              max={txn.amount}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-green-100 focus:border-green-500 outline-none text-sm"
            />
            <p className="text-[11px] text-green-300 mt-1">{t("maxRefundable")}: {fmtMoney(txn.amount)}</p>
          </div>

          <div>
            <label className="text-xs font-semibold text-green-600 block mb-1.5">{t("refundReason")}</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-green-100 focus:border-green-500 outline-none text-sm bg-white"
            >
              {REFUND_REASONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-green-600 block mb-1.5">{t("refundNoteOptional")}</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              className="w-full px-3 py-2.5 rounded-lg border border-green-100 focus:border-green-500 outline-none text-sm resize-none"
              placeholder={t("refundNotePlaceholder")}
            />
          </div>

          {error && <p className="text-xs text-rose-600">{error}</p>}

          <p className="text-[11px] text-green-400 bg-green-50/60 rounded-lg p-3">{t("refundTimelineNote")}</p>

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold text-sm py-2.5 rounded-lg transition-colors"
          >
            {t("confirmRefund")}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}
