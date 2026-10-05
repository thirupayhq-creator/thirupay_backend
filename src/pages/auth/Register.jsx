import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { UserPlus, MapPin, ImagePlus, ShieldCheck, Check } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { lookupPincode } from "../../data/pincodeLookup";
import { compressImage } from "../../utils/imageCompress";

const BASIC_FIELDS = [
  { key: "businessName", label: "Business Name", placeholder: "Selvi Fancy Store", required: true },
  { key: "ownerName", label: "Owner Name", placeholder: "Selvi Kumar", required: true },
  { key: "email", label: "Email", placeholder: "you@business.com", type: "email", required: true },
  { key: "gst", label: "GST Number (optional)", placeholder: "33ABCDE1234F1Z5" },
];

const BUSINESS_CATEGORIES = [
  "Retail / Kirana Store",
  "Restaurant / Food",
  "Services",
  "E-commerce / Online Store",
  "Healthcare / Pharmacy",
  "Education",
  "Other",
];

const ENTITY_TYPES = ["Sole Proprietorship", "Partnership", "Private Limited", "LLP", "Other"];

export default function Register() {
  const { registerMerchant } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ businessCategory: BUSINESS_CATEGORIES[0], entityType: ENTITY_TYPES[0] });
  const [error, setError] = useState("");

  // ---------- Mobile OTP (mocked — no real SMS gateway in this demo) ----------
  const [otpSent, setOtpSent] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState(null);
  const [otpError, setOtpError] = useState("");

  const handleChange = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handlePhoneChange = (value) => {
    const clean = value.replace(/\D/g, "").slice(0, 10);
    setForm((f) => ({ ...f, phone: clean, phoneVerified: false }));
    setOtpSent(false);
    setOtpValue("");
  };

  const sendOtp = () => {
    if ((form.phone || "").length !== 10) {
      setOtpError("Enter a valid 10-digit mobile number first.");
      return;
    }
    setOtpError("");
    const code = String(Math.floor(1000 + Math.random() * 9000));
    setGeneratedOtp(code);
    setOtpSent(true);
    setOtpValue("");
    // No real SMS gateway wired up yet in this demo — surfaced via toast so it's testable.
    showToast({ title: "OTP sent (demo)", subtitle: `Your OTP is ${code} — real SMS gateway to be added by backend`, type: "info", duration: 6000 });
  };

  const verifyOtp = () => {
    if (otpValue !== generatedOtp) {
      setOtpError("Incorrect OTP. Please try again.");
      return;
    }
    setOtpError("");
    setForm((f) => ({ ...f, phoneVerified: true }));
    showToast({ title: "Mobile number verified", type: "success" });
  };

  const handlePincodeChange = (value) => {
    const clean = value.replace(/\D/g, "").slice(0, 6);
    setForm((f) => {
      const match = clean.length === 6 ? lookupPincode(clean) : null;
      return {
        ...f,
        pincode: clean,
        city: match ? match.city : f.city,
        state: match ? match.state : f.state,
      };
    });
  };

  const handlePhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file, { maxWidth: 900, quality: 0.6 });
      setForm((f) => ({ ...f, businessPhoto: compressed }));
    } catch {
      setError("Could not upload photo, please try a different image.");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!form.phoneVerified) {
      setError("Please verify your mobile number with OTP before continuing.");
      return;
    }
    if ((form.pincode || "").length !== 6) {
      setError("Pincode 6 digits ah irukanum.");
      return;
    }
    if (form.accountNumber !== form.confirmAccountNumber) {
      setError("Account number rendu fields um match aaganum.");
      return;
    }
    if ((form.ifsc || "").length !== 11) {
      setError("IFSC code 11 characters ah irukanum.");
      return;
    }
    if ((form.password || "").length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Password and Confirm Password do not match.");
      return;
    }
    if (!form.agreedToTerms) {
      setError("Please accept the Terms of Service & Privacy Policy to continue.");
      return;
    }

    const res = registerMerchant(form);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    navigate("/merchant/kyc");
  };

  return (
    <div className="min-h-screen bg-[#F6F7FB] flex items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg"
      >
        <div className="text-center mb-6">
          <img src="/brand/logo-full.png" alt="ThiruPay" className="h-16 w-auto mx-auto" />
          <p className="text-green-300 text-sm mt-1">Merchant Onboarding — Step 1 of 2</p>
        </div>

        <div className="card p-8">
          <h1 className="font-display font-bold text-xl text-green-700 mb-1">Create your merchant account</h1>
          <p className="text-sm text-green-300 mb-6">Fill your business details. Admin verification follows KYC upload.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {BASIC_FIELDS.map((f) => (
              <div key={f.key}>
                <label className="block text-xs font-semibold text-green-500 mb-1.5">{f.label}</label>
                <input
                  type={f.type || "text"}
                  required={f.required}
                  placeholder={f.placeholder}
                  value={form[f.key] || ""}
                  onChange={(e) => handleChange(f.key, e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-green-100 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none text-sm"
                />
              </div>
            ))}

            {/* Mobile number + OTP verification */}
            <div>
              <label className="block text-xs font-semibold text-green-500 mb-1.5">Phone Number</label>
              <div className="flex gap-2">
                <input
                  required
                  inputMode="numeric"
                  disabled={form.phoneVerified}
                  placeholder="98400xxxxx"
                  value={form.phone || ""}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-green-100 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none text-sm disabled:bg-green-50 disabled:text-green-600"
                />
                {form.phoneVerified ? (
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 rounded-lg shrink-0">
                    <Check size={14} /> Verified
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={sendOtp}
                    className="text-xs font-semibold text-green-700 border border-green-200 px-3 rounded-lg hover:bg-green-50 shrink-0"
                  >
                    {otpSent ? "Resend OTP" : "Send OTP"}
                  </button>
                )}
              </div>

              {otpSent && !form.phoneVerified && (
                <div className="mt-2.5 flex gap-2">
                  <input
                    inputMode="numeric"
                    maxLength={4}
                    placeholder="Enter 4-digit OTP"
                    value={otpValue}
                    onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    className="flex-1 px-4 py-2.5 rounded-lg border border-green-100 focus:border-green-500 outline-none text-sm"
                  />
                  <button
                    type="button"
                    onClick={verifyOtp}
                    className="text-xs font-semibold text-white bg-green-600 hover:bg-green-700 px-4 rounded-lg shrink-0"
                  >
                    Verify
                  </button>
                </div>
              )}
              {otpError && <p className="text-rose-600 text-xs font-medium mt-1.5">{otpError}</p>}
              {!form.phoneVerified && (
                <p className="text-[11px] text-green-300 mt-1.5 flex items-center gap-1">
                  <ShieldCheck size={12} /> We'll verify this number with an OTP before your account is created.
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-green-500 mb-1.5">Business Category</label>
                <select
                  value={form.businessCategory}
                  onChange={(e) => handleChange("businessCategory", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-green-100 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none text-sm bg-white"
                >
                  {BUSINESS_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-green-500 mb-1.5">Business Entity Type</label>
                <select
                  value={form.entityType}
                  onChange={(e) => handleChange("entityType", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-green-100 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none text-sm bg-white"
                >
                  {ENTITY_TYPES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-2 border-t border-green-50">
              <p className="text-xs font-semibold text-green-500 uppercase tracking-wide mb-3 mt-4 flex items-center gap-1.5">
                <MapPin size={13} /> Business Location
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-green-500 mb-1.5">Address Line 1</label>
                  <input
                    required
                    placeholder="Shop No. 12, Main Bazaar Street"
                    value={form.addressLine1 || ""}
                    onChange={(e) => handleChange("addressLine1", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-green-100 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-green-500 mb-1.5">Address Line 2 (optional)</label>
                  <input
                    placeholder="Near Anna Bus Stand"
                    value={form.addressLine2 || ""}
                    onChange={(e) => handleChange("addressLine2", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-green-100 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none text-sm"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-green-500 mb-1.5">Pincode</label>
                    <input
                      required
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="625001"
                      value={form.pincode || ""}
                      onChange={(e) => handlePincodeChange(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-green-100 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-green-500 mb-1.5">City</label>
                    <input
                      required
                      placeholder="Madurai"
                      value={form.city || ""}
                      onChange={(e) => handleChange("city", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-green-100 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-green-500 mb-1.5">State</label>
                    <input
                      required
                      placeholder="Tamil Nadu"
                      value={form.state || ""}
                      onChange={(e) => handleChange("state", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-green-100 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none text-sm"
                    />
                  </div>
                </div>
                <p className="text-[11px] text-green-300 -mt-1">City/State will auto-fill from the pincode (you can edit it).</p>

                <div>
                  <label className="block text-xs font-semibold text-green-500 mb-1.5">Business Location Photo</label>
                  <label className="flex items-center gap-3 border border-dashed border-green-200 rounded-lg px-4 py-3 cursor-pointer hover:bg-green-50">
                    <ImagePlus size={18} className="text-green-300 shrink-0" />
                    <span className="text-xs text-green-400 truncate">
                      {form.businessPhoto ? "Photo selected ✓" : "Upload storefront/shop photo"}
                    </span>
                    <input type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
                  </label>
                  {form.businessPhoto && (
                    <img src={form.businessPhoto} alt="Business location preview" className="mt-3 w-full h-32 object-cover rounded-lg border border-green-100" />
                  )}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-green-50">
              <p className="text-xs font-semibold text-green-500 uppercase tracking-wide mb-3 mt-4">Bank Account Details</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-green-500 mb-1.5">Account Holder Name</label>
                  <input
                    required
                    placeholder="Selvi Kumar"
                    value={form.accountHolder || ""}
                    onChange={(e) => handleChange("accountHolder", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-green-100 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-green-500 mb-1.5">Account Number</label>
                  <input
                    required
                    inputMode="numeric"
                    placeholder="5011000123456"
                    value={form.accountNumber || ""}
                    onChange={(e) => handleChange("accountNumber", e.target.value.replace(/\D/g, ""))}
                    className="w-full px-4 py-2.5 rounded-lg border border-green-100 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-green-500 mb-1.5">Confirm Account Number</label>
                  <input
                    required
                    inputMode="numeric"
                    placeholder="Re-enter account number"
                    value={form.confirmAccountNumber || ""}
                    onChange={(e) => handleChange("confirmAccountNumber", e.target.value.replace(/\D/g, ""))}
                    className="w-full px-4 py-2.5 rounded-lg border border-green-100 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-green-500 mb-1.5">IFSC Code</label>
                    <input
                      required
                      maxLength={11}
                      placeholder="SBIN0001234"
                      value={form.ifsc || ""}
                      onChange={(e) => handleChange("ifsc", e.target.value.toUpperCase())}
                      className="w-full px-4 py-2.5 rounded-lg border border-green-100 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none text-sm uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-green-500 mb-1.5">Bank Name</label>
                    <input
                      required
                      placeholder="State Bank of India"
                      value={form.bankName || ""}
                      onChange={(e) => handleChange("bankName", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-green-100 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-green-500 mb-1.5">Branch</label>
                  <input
                    required
                    placeholder="T. Nagar, Chennai"
                    value={form.branch || ""}
                    onChange={(e) => handleChange("branch", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-green-100 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-green-50 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-green-500 mb-1.5 mt-4">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={form.password || ""}
                  onChange={(e) => handleChange("password", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-green-100 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none text-sm"
                />
                <p className="text-[11px] text-green-300 mt-1">At least 6 characters.</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-green-500 mb-1.5">Confirm Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={form.confirmPassword || ""}
                  onChange={(e) => handleChange("confirmPassword", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-green-100 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none text-sm"
                />
              </div>
            </div>

            <label className="flex items-start gap-2.5 pt-1 cursor-pointer">
              <input
                type="checkbox"
                checked={!!form.agreedToTerms}
                onChange={(e) => handleChange("agreedToTerms", e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-green-200 text-green-600 focus:ring-green-300 shrink-0"
              />
              <span className="text-xs text-green-500">
                I agree to ThiruPay's <span className="text-green-700 font-semibold">Terms of Service</span> and <span className="text-green-700 font-semibold">Privacy Policy</span>.
              </span>
            </label>

            {error && <p className="text-rose-600 text-xs font-medium">{error}</p>}

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm mt-2"
            >
              <UserPlus size={16} /> Save & Continue to KYC
            </button>
          </form>

          <p className="text-center text-sm text-green-400 mt-6">
            Already registered?{" "}
            <Link to="/login" className="text-green-600 font-semibold hover:underline">
              Login
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
