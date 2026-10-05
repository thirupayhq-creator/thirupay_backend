import { useState } from "react";
import { Link2, IndianRupee, Copy, CheckCircle2, Share2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { db, genId } from "../../data/mockData";
import { PAYMENT_MODES } from "../../data/paymentModes";
import StatusBadge from "../../components/StatusBadge";
import { useToast } from "../../context/ToastContext";

function fmtDate(iso) {
  return new Date(iso).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default function PaymentLinks() {
  const { session } = useAuth();
  const { t } = useLanguage();
  const { showToast } = useToast();
  const merchant = db.getMerchantById(session.merchantId);
  const [links, setLinks] = useState(db.getLinksByMerchant(session.merchantId));
  const [form, setForm] = useState({ amount: "", note: "", expiryHours: "24" });
  const [copiedId, setCopiedId] = useState(null);
  const [modePickerFor, setModePickerFor] = useState(null);

  const refresh = () => setLinks(db.getLinksByMerchant(session.merchantId));

  const handleCreate = (e) => {
    e.preventDefault();
    if (!form.amount || Number(form.amount) <= 0) return;
    const link = {
      link_id: genId("pl"),
      merchant_id: merchant.merchant_id,
      amount: Number(form.amount),
      expiry: new Date(Date.now() + Number(form.expiryHours) * 3600000).toISOString(),
      status: "pending",
      note: form.note || "Payment request",
      created_at: new Date().toISOString(),
    };
    db.addLink(link);
    setForm({ amount: "", note: "", expiryHours: "24" });
    refresh();
  };

  const handleCopy = (link) => {
    const url = `https://thirupay.in/pay/${link.link_id}`;
    navigator.clipboard?.writeText(url);
    setCopiedId(link.link_id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleShare = async (link) => {
    const url = `https://thirupay.in/pay/${link.link_id}`;
    const text = `Pay ₹${link.amount.toLocaleString("en-IN")} to ${merchant.business_name} via ThiruPay: ${url}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "ThiruPay Payment Link", text, url });
        return;
      } catch (err) {
        if (err?.name === "AbortError") return;
      }
    }
    // Fallback: open WhatsApp web share intent
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  };

  const simulatePaid = (link, payMode) => {
    db.updateLinkStatus(link.link_id, "paid");
    db.addTxn({
      transaction_id: genId("txn"),
      merchant_id: merchant.merchant_id,
      amount: link.amount,
      payment_method: "Payment Link",
      payment_mode: payMode,
      status: "success",
      created_at: new Date().toISOString(),
    });
    db.addSettlement({
      settlement_id: genId("st"),
      merchant_id: merchant.merchant_id,
      amount: link.amount,
      settlement_date: new Date(Date.now() + 86400000).toISOString(),
      status: "pending",
    });
    setModePickerFor(null);
    refresh();
    showToast({
      title: `₹${link.amount.toLocaleString("en-IN")} received!`,
      subtitle: `${link.note} · via ${payMode}`,
      type: "success",
    });
  };

  return (
    <div className="max-w-3xl">
      <h1 className="font-display font-bold text-2xl text-green-700 mb-1">{t("paymentLinksTitle")}</h1>
      <p className="text-sm text-green-300 mb-6">{t("paymentLinksSubtitle")}</p>

      <form onSubmit={handleCreate} className="card p-5 mb-8 grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
        <div>
          <label className="block text-xs font-semibold text-green-500 mb-1.5">{t("amountLabel")}</label>
          <div className="relative">
            <IndianRupee size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-green-300" />
            <input
              type="number"
              min="1"
              required
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              placeholder="1500"
              className="w-full pl-8 pr-3 py-2.5 rounded-lg border border-green-100 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none text-sm"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-green-500 mb-1.5">{t("noteLabel")}</label>
          <input
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
            placeholder="Order #221"
            className="w-full px-3 py-2.5 rounded-lg border border-green-100 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-green-500 mb-1.5">{t("expiresIn")}</label>
          <select
            value={form.expiryHours}
            onChange={(e) => setForm({ ...form, expiryHours: e.target.value })}
            className="w-full px-3 py-2.5 rounded-lg border border-green-100 focus:border-green-500 outline-none text-sm bg-white"
          >
            <option value="24">24 hours</option>
            <option value="72">3 days</option>
            <option value="168">7 days</option>
          </select>
        </div>
        <button type="submit" className="sm:col-span-3 bg-green-500 hover:bg-green-600 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2">
          <Link2 size={16} /> {t("createPaymentLink")}
        </button>
      </form>

      <div className="card divide-y divide-green-50">
        {links.length === 0 ? (
          <p className="text-sm text-green-300 text-center py-10">{t("noPaymentLinksYet")}</p>
        ) : (
          links.map((l) => (
            <div key={l.link_id} className="flex items-center justify-between p-4">
              <div>
                <p className="font-semibold text-green-700 text-sm">₹{l.amount.toLocaleString("en-IN")} · {l.note}</p>
                <p className="text-xs text-green-300 mt-0.5">Created {fmtDate(l.created_at)} · Expires {fmtDate(l.expiry)}</p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={l.status} />
                {l.status === "pending" && (
                  <>
                    <button
                      onClick={() => handleCopy(l)}
                      className="text-xs font-semibold text-green-500 border border-green-100 px-3 py-1.5 rounded-lg hover:bg-green-50 flex items-center gap-1.5"
                    >
                      {copiedId === l.link_id ? <CheckCircle2 size={13} className="text-emerald-600" /> : <Copy size={13} />}
                      {copiedId === l.link_id ? t("copied") : t("copyLink")}
                    </button>
                    <button
                      onClick={() => handleShare(l)}
                      className="text-xs font-semibold text-white bg-green-500 hover:bg-green-600 px-3 py-1.5 rounded-lg flex items-center gap-1.5"
                    >
                      <Share2 size={13} /> {t("share")}
                    </button>
                    {modePickerFor === l.link_id ? (
                      <div className="flex items-center gap-1 border border-green-100 rounded-lg px-1.5 py-1">
                        {PAYMENT_MODES.map((m) => (
                          <button
                            key={m.key}
                            onClick={() => simulatePaid(l, m.key)}
                            className="text-[11px] font-semibold px-2 py-1 rounded-md text-white transition-opacity hover:opacity-90"
                            style={{ backgroundColor: m.color }}
                          >
                            {m.label}
                          </button>
                        ))}
                        <button onClick={() => setModePickerFor(null)} className="text-green-300 hover:text-green-500 px-1 text-xs">✕</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setModePickerFor(l.link_id)}
                        className="text-xs font-semibold text-green-600 border border-green-200 px-3 py-1.5 rounded-lg hover:bg-green-50"
                      >
                        {t("simulatePaid")}
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
