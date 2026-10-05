import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck, Upload, Clock, Plus, Minus } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../data/mockData";
import { compressImage } from "../../utils/imageCompress";

const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

const IDENTITY_DOC_TYPES = [
  { value: "aadhaar", label: "Aadhaar" },
  { value: "passport", label: "Passport (File No)" },
  { value: "driving_licence", label: "Driving Licence" },
  { value: "voter_id", label: "Voter ID" },
];

// Generic file handler — compresses images, guards non-image files against a size cap.
async function readFile(file, { maxSizeMB = 2 } = {}) {
  if (file.type.startsWith("image/")) {
    const compressed = await compressImage(file, { maxWidth: 1000, quality: 0.65 });
    return { fileName: file.name, fileData: compressed };
  }
  if (file.size > maxSizeMB * 1024 * 1024) {
    throw new Error(`File must be under ${maxSizeMB}MB. Please upload a smaller file.`);
  }
  const fileData = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Could not read file."));
    reader.readAsDataURL(file);
  });
  return { fileName: file.name, fileData };
}

function FileUploadField({ label, hint, value, onChange, error, accept }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-green-500 mb-1.5">{label}</label>
      <label className="flex items-center gap-3 px-4 py-3 rounded-lg border border-dashed border-green-200 cursor-pointer hover:bg-green-50 transition-colors">
        <Upload size={18} className="text-green-400" />
        <span className="text-sm text-green-400 truncate">{value || "Click to upload file"}</span>
        <input type="file" accept={accept} onChange={onChange} className="hidden" />
      </label>
      {hint && <p className="text-[11px] text-green-300 mt-1">{hint}</p>}
      {error && <p className="text-rose-600 text-xs font-medium mt-1.5">{error}</p>}
    </div>
  );
}

function AccordionSection({ title, subtitle, isOpen, onToggle, children }) {
  return (
    <div className="rounded-xl border border-green-100 bg-white overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <span className="font-semibold text-sm text-green-700">
          {title}
          {subtitle && <span className="font-normal text-green-300 ml-2">{subtitle}</span>}
        </span>
        {isOpen ? <Minus size={16} className="text-green-400" /> : <Plus size={16} className="text-green-400" />}
      </button>
      {isOpen && <div className="px-5 pb-5 pt-1 space-y-4">{children}</div>}
    </div>
  );
}

export default function KYCUpload() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const existing = db.getKycByMerchant(session.merchantId);
  const [submitted, setSubmitted] = useState(!!existing);

  const [openSection, setOpenSection] = useState("companyIdentity");
  const toggleSection = (key) => setOpenSection((prev) => (prev === key ? "" : key));

  const [form, setForm] = useState({
    // Company Identity
    pan: existing?.pan || "",
    panFileName: existing?.pan_document_name || "",
    panFileData: existing?.pan_document_url || "",

    // Identity Verification (choose any one)
    identityDocType: existing?.identity_doc_type || "",
    identityDocNumber: existing?.identity_doc_number || existing?.aadhaar || "",
    identityFileName: existing?.identity_document_name || existing?.document_name || "",
    identityFileData: existing?.identity_document_url || existing?.document_url || "",

    // Company Documents
    numberOfDirectors: existing?.number_of_directors || "",
    directorsZipName: existing?.directors_zip_name || "",
    directorsZipData: existing?.directors_zip_url || "",
    incorporationFileName: existing?.incorporation_document_name || "",
    incorporationFileData: existing?.incorporation_document_url || "",
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState("");

  const setError = (key, msg) => setFieldErrors((f) => ({ ...f, [key]: msg }));

  const handleUpload = async (key, file, opts) => {
    if (!file) return;
    setError(key, "");
    try {
      const { fileName, fileData } = await readFile(file, opts);
      setForm((f) => ({ ...f, [`${key}Name`]: fileName, [`${key}Data`]: fileData }));
    } catch (err) {
      setError(key, err.message || "Could not upload file.");
    }
  };

  const identityDocLabel =
    IDENTITY_DOC_TYPES.find((d) => d.value === form.identityDocType)?.label || "Document";

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitError("");

    const pan = (form.pan || "").trim().toUpperCase();
    if (!PAN_REGEX.test(pan)) {
      setSubmitError("Enter a valid PAN number, e.g. ABCDE1234F (5 letters, 4 digits, 1 letter).");
      return;
    }
    if (!form.panFileData) {
      setSubmitError("Please upload the PAN card.");
      return;
    }
    if (!form.identityDocType) {
      setSubmitError("Choose one identity verification document type.");
      return;
    }
    if (!form.identityDocNumber?.trim()) {
      setSubmitError(`Enter the ${identityDocLabel} number.`);
      return;
    }
    if (!form.identityFileData) {
      setSubmitError(`Please upload the ${identityDocLabel} document.`);
      return;
    }
    const directors = parseInt(form.numberOfDirectors, 10);
    if (!directors || directors < 2) {
      setSubmitError("Enter a valid number of directors (minimum 2 for a company).");
      return;
    }
    if (!form.directorsZipData) {
      setSubmitError("Please upload the directors list (ZIP).");
      return;
    }
    if (!form.incorporationFileData) {
      setSubmitError("Please upload the Certificate of Incorporation.");
      return;
    }

    try {
      db.addKyc({
        merchant_id: session.merchantId,
        pan,
        pan_document_name: form.panFileName,
        pan_document_url: form.panFileData,
        identity_doc_type: form.identityDocType,
        identity_doc_number: form.identityDocNumber,
        identity_document_name: form.identityFileName,
        identity_document_url: form.identityFileData,
        number_of_directors: directors,
        directors_zip_name: form.directorsZipName,
        directors_zip_url: form.directorsZipData,
        incorporation_document_name: form.incorporationFileName,
        incorporation_document_url: form.incorporationFileData,
        verification_status: "pending",
      });
      setSubmitted(true);
    } catch {
      setSubmitError("Could not save — storage is full. Please try smaller files.");
    }
  };

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto mt-10">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
            <Clock size={26} />
          </div>
          <h2 className="font-display font-bold text-lg text-green-700 mb-1">KYC submitted — waiting for approval</h2>
          <p className="text-sm text-green-300 mb-6">
            Admin will verify your company and identity documents. You can track the status from your dashboard.
          </p>
          <button
            onClick={() => navigate("/merchant")}
            className="bg-green-700 hover:bg-green-800 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors"
          >
            Go to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-6">
      <div className="text-center mb-6">
        <div className="w-12 h-12 rounded-xl bg-green-50 text-green-700 flex items-center justify-center mx-auto mb-3">
          <ShieldCheck size={22} />
        </div>
        <h1 className="font-display font-bold text-xl text-green-700">Upload KYC Documents</h1>
        <p className="text-sm text-green-300 mt-1">Company &amp; identity documents required for verification</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Company Identity */}
        <AccordionSection
          title="Company Identity"
          isOpen={openSection === "companyIdentity"}
          onToggle={() => toggleSection("companyIdentity")}
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-green-500 mb-1.5">
                PAN Number <span className="text-rose-500">*</span>
              </label>
              <input
                value={form.pan}
                onChange={(e) => setForm({ ...form, pan: e.target.value.toUpperCase() })}
                placeholder="e.g. ABCDE1234F"
                maxLength={10}
                className="w-full px-4 py-2.5 rounded-lg border border-green-100 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none text-sm uppercase"
              />
            </div>
            <FileUploadField
              label="PAN Card Upload *"
              hint="JPEG, PNG or PDF — max 2MB"
              value={form.panFileName}
              error={fieldErrors.panFile}
              onChange={(e) => handleUpload("panFile", e.target.files?.[0])}
            />
          </div>
        </AccordionSection>

        {/* Identity Verification */}
        <AccordionSection
          title="Identity Verification"
          subtitle="(Choose any one)"
          isOpen={openSection === "identityVerification"}
          onToggle={() => toggleSection("identityVerification")}
        >
          <div>
            <label className="block text-xs font-semibold text-green-500 mb-1.5">
              Document Type <span className="text-rose-500">*</span>
            </label>
            <select
              value={form.identityDocType}
              onChange={(e) =>
                setForm({ ...form, identityDocType: e.target.value, identityDocNumber: "", identityFileName: "", identityFileData: "" })
              }
              className="w-full px-4 py-2.5 rounded-lg border border-green-100 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none text-sm bg-white"
            >
              <option value="">-- Select Document Type --</option>
              {IDENTITY_DOC_TYPES.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          {form.identityDocType && (
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-green-500 mb-1.5">
                  {identityDocLabel} Number <span className="text-rose-500">*</span>
                </label>
                <input
                  value={form.identityDocNumber}
                  onChange={(e) => setForm({ ...form, identityDocNumber: e.target.value })}
                  placeholder={form.identityDocType === "aadhaar" ? "XXXX-XXXX-XXXX" : `Enter ${identityDocLabel} number`}
                  className="w-full px-4 py-2.5 rounded-lg border border-green-100 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none text-sm"
                />
              </div>
              <FileUploadField
                label={`Upload ${identityDocLabel} *`}
                hint="JPEG, PNG or PDF — max 2MB"
                value={form.identityFileName}
                error={fieldErrors.identityFile}
                onChange={(e) => handleUpload("identityFile", e.target.files?.[0])}
              />
            </div>
          )}
        </AccordionSection>

        {/* Company Documents */}
        <AccordionSection
          title="Company Documents"
          isOpen={openSection === "companyDocuments"}
          onToggle={() => toggleSection("companyDocuments")}
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-green-500 mb-1.5">
                Number of Directors <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min={2}
                value={form.numberOfDirectors}
                onChange={(e) => setForm({ ...form, numberOfDirectors: e.target.value })}
                placeholder="Enter total number of directors"
                className="w-full px-4 py-2.5 rounded-lg border border-green-100 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none text-sm"
              />
            </div>
            <FileUploadField
              label="Directors List (ZIP) *"
              hint="ZIP files only"
              accept=".zip"
              value={form.directorsZipName}
              error={fieldErrors.directorsZip}
              onChange={(e) => handleUpload("directorsZip", e.target.files?.[0], { maxSizeMB: 5 })}
            />
          </div>
          <FileUploadField
            label="Certificate of Incorporation — (CIN from MCA, MOA & AOA) *"
            hint="JPEG, PNG or PDF — max 4MB"
            value={form.incorporationFileName}
            error={fieldErrors.incorporationFile}
            onChange={(e) => handleUpload("incorporationFile", e.target.files?.[0], { maxSizeMB: 4 })}
          />
        </AccordionSection>

        {submitError && <p className="text-rose-600 text-xs font-medium">{submitError}</p>}

        <button
          type="submit"
          className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm mt-2"
        >
          Submit for Verification
        </button>
      </form>
    </div>
  );
}