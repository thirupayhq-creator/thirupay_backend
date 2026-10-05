import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Banknote, ShieldPlus, Volume2, Smartphone, Clock, X, ExternalLink, Receipt } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { db, genId } from "../../data/mockData";
import { DEVICE_PRICING, calcInvoice } from "../../data/devicePricing";
import StatusBadge from "../../components/StatusBadge";
import OrderTracker from "../../components/OrderTracker";

// Thiru Insurance is live at thiruhq.com (deployed via GitHub Pages, custom
// domain). Update this one line if the domain ever changes.
const THIRU_INSURANCE_URL = "https://www.thiruhq.com";

const HARDWARE_TYPES = ["soundbox", "pos_device"];

function getServices(t) {
  return [
    { type: "loan", icon: Banknote, title: t("loanTitle"), tagline: t("loanTagline") },
    { type: "insurance", icon: ShieldPlus, title: t("insuranceTitle"), tagline: t("insuranceTagline") },
    { type: "soundbox", icon: Volume2, title: t("soundboxTitle"), tagline: t("soundboxTagline") },
    { type: "pos_device", icon: Smartphone, title: t("posTitle"), tagline: t("posTagline") },
  ];
}

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function fmtMoney(n) {
  return `₹${Number(n).toLocaleString("en-IN")}`;
}

function detailsSummary(req) {
  switch (req.type) {
    case "loan":
      return `${fmtMoney(req.details.amount)} · ${req.details.purpose}`;
    case "insurance":
      return `${req.details.insuranceType} · Coverage ${fmtMoney(req.details.coverage)}`;
    case "soundbox":
    case "pos_device": {
      const plan = req.details.pricingOption === "rental" ? "Rental" : "One-time";
      const device = req.details.deviceType || (req.type === "soundbox" ? "SoundBox" : "POS Device");
      return `${device} · Qty ${req.details.quantity} · ${plan} · ${fmtMoney(req.details.invoiceTotal || 0)}${req.details.pricingOption === "rental" ? "/mo" : ""}`;
    }
    default:
      return "";
  }
}

export default function Services() {
  const { session } = useAuth();
  const { t } = useLanguage();
  const merchant = db.getMerchantById(session.merchantId);
  const SERVICES = getServices(t);
  const [activeModal, setActiveModal] = useState(null); // service type or null
  const [requests, setRequests] = useState(db.getRequestsByMerchant(session.merchantId));

  const refresh = () => setRequests(db.getRequestsByMerchant(session.merchantId));

  const hasPending = (type) => requests.some((r) => r.type === type && r.status === "requested");
  const latestStatus = (type) => requests.find((r) => r.type === type)?.status;

  const submitRequest = (type, details) => {
    db.addRequest({
      request_id: genId("sr"),
      merchant_id: merchant.merchant_id,
      type,
      details,
      status: "requested",
      created_at: new Date().toISOString(),
    });
    setActiveModal(null);
    refresh();
  };

  const openThiruInsurance = () => {
    const params = new URLSearchParams({
      merchantId: merchant.merchant_id,
      name: merchant.owner_name || "",
      business: merchant.business_name || "",
    });
    window.open(`${THIRU_INSURANCE_URL}/?${params.toString()}`, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="max-w-4xl">
      <h1 className="font-display font-bold text-2xl text-green-700 mb-1">{t("servicesTitle")}</h1>
      <p className="text-sm text-green-300 mb-6">{t("servicesSubtitle")}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {SERVICES.map((s) => {
          const pending = hasPending(s.type);
          const status = latestStatus(s.type);
          return (
            <div key={s.type} className="card p-5 flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-green-50 text-green-700 flex items-center justify-center shrink-0">
                <s.icon size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-green-700 text-sm">{s.title}</p>
                <p className="text-xs text-green-300 mt-0.5 mb-1">{s.tagline}</p>
                {HARDWARE_TYPES.includes(s.type) && (
                  <p className="text-[11px] text-green-400 mb-2">
                    From {fmtMoney(DEVICE_PRICING[s.type].rental)}/mo or {fmtMoney(DEVICE_PRICING[s.type].onetime)} one-time
                  </p>
                )}
                {status && (
                  <div className="mb-2">
                    <StatusBadge status={status === "requested" ? "pending" : status} />
                  </div>
                )}
                {s.type === "insurance" ? (
                  <button
                    onClick={openThiruInsurance}
                    className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white transition-colors"
                  >
                    Open Thiru Insurance <ExternalLink size={13} />
                  </button>
                ) : (
                  <button
                    disabled={pending}
                    onClick={() => setActiveModal(s.type)}
                    className={`text-xs font-semibold px-4 py-2 rounded-lg transition-colors ${
                      pending
                        ? "bg-green-50 text-green-300 cursor-not-allowed"
                        : "bg-green-500 hover:bg-green-600 text-white"
                    }`}
                  >
                    {pending ? t("requestedAwaitingAdmin") : `${t("requestPrefix")} ${s.title}`}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="card p-5">
        <h2 className="font-display font-semibold text-green-700 mb-4">{t("myRequests")}</h2>
        {requests.length === 0 ? (
          <p className="text-sm text-green-300 text-center py-8">{t("noRequestsYet")}</p>
        ) : (
          <div className="divide-y divide-green-50">
            {requests.map((r) => {
              const isHardware = HARDWARE_TYPES.includes(r.type);
              return (
                <div key={r.request_id} className="py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-green-700 capitalize">{r.type.replace("_", " ")}</p>
                      <p className="text-xs text-green-300">{detailsSummary(r)} · {fmtDate(r.created_at)}</p>
                    </div>
                    {!isHardware && <StatusBadge status={r.status === "requested" ? "pending" : r.status} />}
                  </div>

                  {isHardware && (
                    <div className="mt-3 space-y-3">
                      <OrderTracker status={r.status} />
                      {r.status !== "requested" && r.status !== "rejected" && (
                        <div className="bg-green-50/60 rounded-lg p-3 text-xs text-green-500 space-y-1">
                          <div className="flex items-center gap-1.5 font-semibold text-green-700 mb-1">
                            <Receipt size={13} /> Invoice
                          </div>
                          <div className="flex justify-between"><span>Unit price × {r.details.quantity}</span><span>{fmtMoney(r.details.unitPrice * r.details.quantity)}</span></div>
                          <div className="flex justify-between"><span>GST (18%)</span><span>{fmtMoney(r.details.gst)}</span></div>
                          <div className="flex justify-between font-semibold text-green-700 pt-1 border-t border-green-100">
                            <span>Total{r.details.pricingOption === "rental" ? " / month" : ""}</span>
                            <span>{fmtMoney(r.details.invoiceTotal)}</span>
                          </div>
                          <p className="text-[11px] text-green-400 pt-1">Delivery to: {r.details.address}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <AnimatePresence>
        {activeModal && (
          <RequestModal
            type={activeModal}
            merchant={merchant}
            t={t}
            onClose={() => setActiveModal(null)}
            onSubmit={(details) => submitRequest(activeModal, details)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function RequestModal({ type, merchant, onClose, onSubmit, t }) {
  const [form, setForm] = useState({
    amount: "",
    purpose: "Working Capital",
    turnover: "",
    existingLoan: "No",
    consent: false,
    insuranceType: "Business Protection",
    coverage: "",
    quantity: 1,
    deviceType: "Basic POS",
    pricingOption: "onetime",
    address: merchant.address_line1 ? `${merchant.address_line1}, ${merchant.city || ""} ${merchant.pincode || ""}`.trim() : "",
  });

  const meta = getServices(t).find((s) => s.type === type);
  const isHardware = type === "soundbox" || type === "pos_device";
  const invoice = isHardware ? calcInvoice({ type, quantity: form.quantity, pricingOption: form.pricingOption }) : null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (type === "loan") {
      onSubmit({ amount: form.amount, purpose: form.purpose, turnover: form.turnover, existingLoan: form.existingLoan });
    } else if (type === "insurance") {
      onSubmit({ insuranceType: form.insuranceType, coverage: form.coverage });
    } else if (isHardware) {
      onSubmit({
        deviceType: type === "pos_device" ? form.deviceType : "SoundBox",
        quantity: Number(form.quantity),
        pricingOption: form.pricingOption,
        unitPrice: invoice.unitPrice,
        gst: invoice.gst,
        invoiceTotal: invoice.total,
        address: form.address,
      });
    }
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
          <h3 className="font-display font-bold text-lg text-green-700">{t("requestPrefix")} {meta.title}</h3>
          <button onClick={onClose} className="text-green-300 hover:text-green-600">
            <X size={18} />
          </button>
        </div>
        <p className="text-xs text-green-300 mb-5">{meta.tagline}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {type === "loan" && (
            <>
              <div>
                <label className="block text-xs font-semibold text-green-500 mb-1.5">Loan Amount Needed (max ₹2,00,000)</label>
                <input
                  type="number"
                  required
                  min="1000"
                  max="200000"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  placeholder="50000"
                  className="w-full px-4 py-2.5 rounded-lg border border-green-100 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-green-500 mb-1.5">Purpose</label>
                <select
                  value={form.purpose}
                  onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-green-100 outline-none text-sm bg-white"
                >
                  <option>Working Capital</option>
                  <option>Inventory</option>
                  <option>Equipment</option>
                  <option>Business Expansion</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-green-500 mb-1.5">Monthly Business Turnover (approx)</label>
                <input
                  type="number"
                  required
                  value={form.turnover}
                  onChange={(e) => setForm({ ...form, turnover: e.target.value })}
                  placeholder="80000"
                  className="w-full px-4 py-2.5 rounded-lg border border-green-100 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-green-500 mb-1.5">Existing loan?</label>
                <div className="flex gap-2">
                  {["No", "Yes"].map((v) => (
                    <button
                      type="button"
                      key={v}
                      onClick={() => setForm({ ...form, existingLoan: v })}
                      className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                        form.existingLoan === v ? "bg-green-700 text-white border-green-700" : "border-green-100 text-green-500"
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
              <label className="flex items-start gap-2 text-xs text-green-400">
                <input
                  type="checkbox"
                  required
                  checked={form.consent}
                  onChange={(e) => setForm({ ...form, consent: e.target.checked })}
                  className="mt-0.5"
                />
                I agree to share my business details with ThiruPay's lending partner for eligibility review.
              </label>
            </>
          )}

          {type === "insurance" && (
            <>
              <div>
                <label className="block text-xs font-semibold text-green-500 mb-1.5">Insurance Type</label>
                <select
                  value={form.insuranceType}
                  onChange={(e) => setForm({ ...form, insuranceType: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-green-100 outline-none text-sm bg-white"
                >
                  <option>Business Protection</option>
                  <option>Device Insurance</option>
                  <option>Motor Insurance (Bike/Car)</option>
                  <option>Health Insurance</option>
                  <option>Life Insurance</option>
                  <option>Commercial Vehicle Insurance</option>
                  <option>Travel Insurance</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-green-500 mb-1.5">Coverage Amount Needed</label>
                <input
                  type="number"
                  required
                  value={form.coverage}
                  onChange={(e) => setForm({ ...form, coverage: e.target.value })}
                  placeholder="100000"
                  className="w-full px-4 py-2.5 rounded-lg border border-green-100 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none text-sm"
                />
              </div>
            </>
          )}

          {isHardware && (
            <>
              {type === "pos_device" && (
                <div>
                  <label className="block text-xs font-semibold text-green-500 mb-1.5">Device Type</label>
                  <select
                    value={form.deviceType}
                    onChange={(e) => setForm({ ...form, deviceType: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-green-100 outline-none text-sm bg-white"
                  >
                    <option>Basic POS</option>
                    <option>Android Smart POS</option>
                    <option>SoundBox + POS Combo</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-green-500 mb-1.5">Billing plan</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: "onetime", label: "One-time", price: DEVICE_PRICING[type].onetime, suffix: "" },
                    { key: "rental", label: "Rental", price: DEVICE_PRICING[type].rental, suffix: "/mo" },
                  ].map((opt) => (
                    <button
                      type="button"
                      key={opt.key}
                      onClick={() => setForm({ ...form, pricingOption: opt.key })}
                      className={`text-left p-3 rounded-lg border transition-colors ${
                        form.pricingOption === opt.key ? "border-green-500 bg-green-50" : "border-green-100"
                      }`}
                    >
                      <p className="text-xs font-semibold text-green-700">{opt.label}</p>
                      <p className="text-sm font-bold text-green-700">{fmtMoney(opt.price)}<span className="text-[11px] font-normal text-green-400">{opt.suffix}</span></p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-green-500 mb-1.5">Quantity</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-green-100 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-green-500 mb-1.5">Delivery Address</label>
                <textarea
                  required
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-lg border border-green-100 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none text-sm resize-none"
                />
              </div>

              {invoice && (
                <div className="bg-green-50/60 rounded-lg p-3 text-xs text-green-500 space-y-1">
                  <div className="flex justify-between"><span>Unit price × {invoice.qty}</span><span>{fmtMoney(invoice.subtotal)}</span></div>
                  <div className="flex justify-between"><span>GST (18%)</span><span>{fmtMoney(invoice.gst)}</span></div>
                  <div className="flex justify-between font-semibold text-green-700 pt-1 border-t border-green-100">
                    <span>Total{form.pricingOption === "rental" ? " / month" : ""}</span>
                    <span>{fmtMoney(invoice.total)}</span>
                  </div>
                </div>
              )}
            </>
          )}

          <button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors mt-2 flex items-center justify-center gap-2"
          >
            <Clock size={15} /> {t("submitRequest")}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}