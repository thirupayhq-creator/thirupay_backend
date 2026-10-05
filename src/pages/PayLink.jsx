import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeCanvas } from "qrcode.react";
import { CheckCircle2, ShieldCheck, Clock, XCircle } from "lucide-react";
import { db, genId } from "../data/mockData";
import { PAYMENT_MODES } from "../data/paymentModes";
import { downloadReceiptPDF } from "../utils/receipt";
import { useToast } from "../context/ToastContext";

// This is what a CUSTOMER sees when they open a merchant's payment link —
// no login required. In production the "Pay" buttons here call the real
// payment gateway; for now they simulate success against mock data.
export default function PayLink() {
  const { linkId } = useParams();
  const { showToast } = useToast();
  const [paidTxn, setPaidTxn] = useState(null);
  const [paying, setPaying] = useState(false);

  const link = db.getLinkById(linkId);
  const merchant = link ? db.getMerchantById(link.merchant_id) : null;
  const isExpired = link && new Date(link.expiry) < new Date();
  const alreadyPaid = link?.status === "paid";

  const handlePay = (mode) => {
    if (!link || !merchant) return;
    setPaying(true);
    // Simulated gateway delay — swap this block for a real payment gateway call later.
    setTimeout(() => {
      const txn = {
        transaction_id: genId("txn"),
        merchant_id: merchant.merchant_id,
        amount: link.amount,
        payment_method: "Payment Link",
        payment_mode: mode,
        status: "success",
        created_at: new Date().toISOString(),
      };
      db.addTxn(txn);
      db.updateLinkStatus(link.link_id, "paid");
      db.addSettlement({
        settlement_id: genId("st"),
        merchant_id: merchant.merchant_id,
        amount: txn.amount,
        settlement_date: new Date(Date.now() + 86400000).toISOString(),
        status: "pending",
      });
      setPaidTxn(txn);
      setPaying(false);
      showToast({
        title: `₹${txn.amount.toLocaleString("en-IN")} payment received!`,
        subtitle: `${merchant.business_name} · via ${mode}`,
        type: "success",
      });
    }, 900);
  };

  if (!link || !merchant) {
    return (
      <div className="min-h-screen bg-[#F6F7FB] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-card p-8 max-w-sm w-full text-center">
          <XCircle size={40} className="text-rose-400 mx-auto mb-3" />
          <h1 className="font-display font-bold text-lg text-green-700">Link not found</h1>
          <p className="text-sm text-green-300 mt-1">This payment link is invalid or has been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F7FB] flex items-center justify-center px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="bg-white rounded-2xl shadow-card w-full max-w-sm overflow-hidden">
        {/* Header */}
        <div className="bg-green-700 px-6 py-6 text-center">
          <img src="/brand/logo-icon-white.png" alt="" className="h-8 w-auto mx-auto mb-2" />
          <p className="text-green-100 text-xs">Pay to</p>
          <p className="text-white font-display font-bold text-lg">{merchant.business_name}</p>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {alreadyPaid || paidTxn ? (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
                <CheckCircle2 size={48} className="text-emerald-500 mx-auto mb-3" />
                <p className="font-display font-bold text-2xl text-green-700">₹{link.amount.toLocaleString("en-IN")}</p>
                <p className="text-sm text-emerald-600 font-semibold mt-1">Payment successful</p>
                <p className="text-xs text-green-300 mt-1">{link.note}</p>
                {paidTxn && (
                  <button
                    onClick={() => downloadReceiptPDF(paidTxn, merchant)}
                    className="mt-5 w-full text-sm font-semibold text-green-700 border border-green-200 py-2.5 rounded-lg hover:bg-green-50 transition-colors"
                  >
                    Download receipt
                  </button>
                )}
              </motion.div>
            ) : isExpired ? (
              <motion.div key="expired" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                <Clock size={40} className="text-amber-400 mx-auto mb-3" />
                <p className="font-semibold text-green-700 text-sm">This payment link has expired</p>
                <p className="text-xs text-green-300 mt-1">Ask {merchant.business_name} to send a new link.</p>
              </motion.div>
            ) : (
              <motion.div key="pay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                <p className="font-display font-bold text-3xl text-green-700">₹{link.amount.toLocaleString("en-IN")}</p>
                <p className="text-xs text-green-300 mt-1">{link.note}</p>

                <div className="p-3 bg-white rounded-xl border-2 border-green-100 my-5 inline-block">
                  <QRCodeCanvas value={`thirupay://pay?merchant=${merchant.merchant_id}&amount=${link.amount}&link=${link.link_id}`} size={140} fgColor="#0B2A4A" level="M" />
                </div>
                <p className="text-xs text-green-300 mb-4 flex items-center justify-center gap-1.5">
                  <ShieldCheck size={13} /> Secured by ThiruPay
                </p>

                <div className="space-y-2">
                  {PAYMENT_MODES.map((m) => (
                    <button
                      key={m.key}
                      onClick={() => handlePay(m.key)}
                      disabled={paying}
                      className="w-full text-sm font-semibold text-white py-2.5 rounded-lg transition-opacity hover:opacity-90 disabled:opacity-60"
                      style={{ backgroundColor: m.color }}
                    >
                      {paying ? "Processing…" : `Pay via ${m.label}`}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-green-300 mt-3">Expires {new Date(link.expiry).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
