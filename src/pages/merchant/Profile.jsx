import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { useToast } from "../../context/ToastContext";
import { db, genId } from "../../data/mockData";
import { compressImage } from "../../utils/imageCompress";
import StatusBadge from "../../components/StatusBadge";
import { Building2, Mail, Phone, Landmark, FileBadge, MapPin, Camera, Pencil, X } from "lucide-react";

export default function Profile() {
  const { session } = useAuth();
  const { t } = useLanguage();
  const { showToast } = useToast();
  const fileInputRef = useRef(null);
  const [merchant, setMerchant] = useState(() => db.getMerchantById(session.merchantId));
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const [bankModalOpen, setBankModalOpen] = useState(false);
  const kyc = db.getKycByMerchant(session.merchantId);

  const initials = (merchant.business_name || "?")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const handlePhotoClick = () => fileInputRef.current?.click();

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file later
    if (!file) return;

    setPhotoError("");
    setPhotoBusy(true);
    try {
      const dataUrl = await compressImage(file, { maxWidth: 400, quality: 0.7 });
      const updated = db.updateMerchant(merchant.merchant_id, { business_photo: dataUrl });
      setMerchant(updated);
    } catch (err) {
      setPhotoError(t("photoError"));
    } finally {
      setPhotoBusy(false);
    }
  };

  const rows = [
    { icon: Building2, label: t("businessName"), value: merchant.business_name },
    { icon: Building2, label: t("ownerName"), value: merchant.owner_name },
    { icon: Mail, label: t("email"), value: merchant.email },
    { icon: Phone, label: t("phone"), value: merchant.phone },
    { icon: FileBadge, label: t("gstNumber"), value: merchant.gst || t("notProvided") },
    { icon: MapPin, label: t("address"), value: merchant.address_line1 ? `${merchant.address_line1}${merchant.address_line2 ? ", " + merchant.address_line2 : ""}` : "—" },
    { icon: MapPin, label: t("cityState"), value: merchant.city ? `${merchant.city}, ${merchant.state}` : "—" },
    { icon: MapPin, label: t("pincode"), value: merchant.pincode || "—" },
  ];

  const bankRows = [
    { icon: Landmark, label: t("accountHolder"), value: merchant.account_holder || "—" },
    { icon: Landmark, label: t("accountNumber"), value: merchant.account_number ? `XXXX XXXX ${merchant.account_number.slice(-4)}` : "—" },
    { icon: Landmark, label: t("ifscCode"), value: merchant.ifsc || "—" },
    { icon: Landmark, label: t("bankName"), value: merchant.bank_name || "—" },
  ];

  const handleBankUpdate = (form) => {
    const oldDetails = {
      account_holder: merchant.account_holder,
      account_number: merchant.account_number,
      ifsc: merchant.ifsc,
      bank_name: merchant.bank_name,
    };
    const updated = db.updateMerchant(merchant.merchant_id, {
      account_holder: form.account_holder,
      account_number: form.account_number,
      ifsc: form.ifsc.toUpperCase(),
      bank_name: form.bank_name,
      bank_verification_status: "pending",
    });
    db.addBankHistory({
      history_id: genId("bh"),
      merchant_id: merchant.merchant_id,
      old_details: oldDetails,
      new_details: { account_holder: form.account_holder, account_number: form.account_number, ifsc: form.ifsc.toUpperCase(), bank_name: form.bank_name },
      changed_at: new Date().toISOString(),
    });
    setMerchant(updated);
    setBankModalOpen(false);
    showToast({
      title: t("bankDetailsUpdated"),
      subtitle: t("bankVerificationPendingNote"),
      type: "info",
    });
  };

  return (
    <div className="max-w-2xl">
      <h1 className="font-display font-bold text-2xl text-green-700 mb-1">{t("merchantProfile")}</h1>
      <p className="text-sm text-green-300 mb-6">{t("profileSubtitle")}</p>

      <div className="card p-6 mb-6 flex items-center gap-5">
        <div className="relative shrink-0">
          <div className="w-20 h-20 rounded-full bg-green-50 text-green-600 flex items-center justify-center overflow-hidden border border-green-100">
            {merchant.business_photo ? (
              <img src={merchant.business_photo} alt={merchant.business_name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xl font-bold">{initials}</span>
            )}
          </div>
          <button
            type="button"
            onClick={handlePhotoClick}
            disabled={photoBusy}
            title={merchant.business_photo ? t("changePhoto") : t("uploadPhoto")}
            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-green-500 text-white flex items-center justify-center border-2 border-white shadow-sm hover:bg-green-600 transition-colors disabled:opacity-60"
          >
            <Camera size={13} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoChange}
          />
        </div>
        <div>
          <p className="text-sm font-semibold text-green-700">{merchant.business_name}</p>
          <button
            type="button"
            onClick={handlePhotoClick}
            disabled={photoBusy}
            className="text-xs font-medium text-green-600 hover:text-green-700 mt-1"
          >
            {photoBusy ? "..." : merchant.business_photo ? t("changePhoto") : t("uploadPhoto")}
          </button>
          {photoError && <p className="text-xs text-rose-600 mt-1">{photoError}</p>}
        </div>
      </div>

      <div className="card p-6 mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-green-400 uppercase tracking-wide">{t("accountStatus")}</p>
          <div className="mt-2"><StatusBadge status={merchant.status} /></div>
        </div>
        <div>
          <p className="text-xs font-semibold text-green-400 uppercase tracking-wide text-right">{t("kycStatus")}</p>
          <div className="mt-2"><StatusBadge status={kyc?.verification_status || "pending"} /></div>
        </div>
      </div>

      <div className="card divide-y divide-green-50 mb-6">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center gap-4 p-4">
            <div className="w-9 h-9 rounded-lg bg-green-50 text-green-600 flex items-center justify-center shrink-0">
              <r.icon size={16} />
            </div>
            <div>
              <p className="text-xs text-green-300">{r.label}</p>
              <p className="text-sm font-semibold text-green-700">{r.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="flex items-center justify-between p-4 border-b border-green-50">
          <div className="flex items-center gap-2">
            <p className="text-sm font-display font-semibold text-green-700">{t("settlementBankAccount")}</p>
            <StatusBadge status={merchant.bank_verification_status === "verified" ? "verified" : "pending"} />
          </div>
          <button
            type="button"
            onClick={() => setBankModalOpen(true)}
            className="flex items-center gap-1.5 text-xs font-semibold text-green-600 hover:text-green-700"
          >
            <Pencil size={13} /> {t("changeBankDetails")}
          </button>
        </div>
        <div className="divide-y divide-green-50">
          {bankRows.map((r) => (
            <div key={r.label} className="flex items-center gap-4 p-4">
              <div className="w-9 h-9 rounded-lg bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                <r.icon size={16} />
              </div>
              <div>
                <p className="text-xs text-green-300">{r.label}</p>
                <p className="text-sm font-semibold text-green-700">{r.value}</p>
              </div>
            </div>
          ))}
        </div>
        {merchant.bank_verification_status === "pending" && (
          <p className="text-[11px] text-amber-600 bg-amber-50/60 px-4 py-3 rounded-b-2xl">{t("bankVerificationPendingNote")}</p>
        )}
      </div>

      <AnimatePresence>
        {bankModalOpen && (
          <BankDetailsModal
            merchant={merchant}
            t={t}
            onClose={() => setBankModalOpen(false)}
            onSubmit={handleBankUpdate}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function BankDetailsModal({ merchant, onClose, onSubmit, t }) {
  const [form, setForm] = useState({
    account_holder: merchant.account_holder || "",
    account_number: "",
    ifsc: merchant.ifsc || "",
    bank_name: merchant.bank_name || "",
  });
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.account_holder.trim() || !form.bank_name.trim()) return setError(t("fillAllFields"));
    if (!/^\d{9,18}$/.test(form.account_number)) return setError(t("invalidAccountNumber"));
    if (!/^[A-Za-z]{4}0[A-Z0-9]{6}$/.test(form.ifsc.trim())) return setError(t("invalidIfsc"));
    setError("");
    onSubmit(form);
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
          <h3 className="font-display font-bold text-lg text-green-700">{t("changeBankDetails")}</h3>
          <button onClick={onClose} className="text-green-300 hover:text-green-600">
            <X size={18} />
          </button>
        </div>
        <p className="text-xs text-green-300 mb-5">{t("bankChangeSubtitle")}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-green-600 block mb-1.5">{t("accountHolder")}</label>
            <input
              value={form.account_holder}
              onChange={(e) => setForm({ ...form, account_holder: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg border border-green-100 focus:border-green-500 outline-none text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-green-600 block mb-1.5">{t("accountNumber")}</label>
            <input
              value={form.account_number}
              onChange={(e) => setForm({ ...form, account_number: e.target.value.replace(/\D/g, "") })}
              placeholder="e.g. 5011000123456"
              className="w-full px-3 py-2.5 rounded-lg border border-green-100 focus:border-green-500 outline-none text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-green-600 block mb-1.5">{t("ifscCode")}</label>
            <input
              value={form.ifsc}
              onChange={(e) => setForm({ ...form, ifsc: e.target.value.toUpperCase() })}
              placeholder="e.g. SBIN0001234"
              className="w-full px-3 py-2.5 rounded-lg border border-green-100 focus:border-green-500 outline-none text-sm uppercase"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-green-600 block mb-1.5">{t("bankName")}</label>
            <input
              value={form.bank_name}
              onChange={(e) => setForm({ ...form, bank_name: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg border border-green-100 focus:border-green-500 outline-none text-sm"
            />
          </div>

          {error && <p className="text-xs text-rose-600">{error}</p>}

          <p className="text-[11px] text-green-400 bg-green-50/60 rounded-lg p-3">{t("bankChangeNote")}</p>

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold text-sm py-2.5 rounded-lg transition-colors"
          >
            {t("saveBankDetails")}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}
