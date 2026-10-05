import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, X, Landmark, ShieldCheck, Clock, Building2, MapPin } from "lucide-react";
import { db } from "../../data/mockData";
import StatusBadge from "../../components/StatusBadge";

export default function MerchantManagement() {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [merchants, setMerchants] = useState(db.getMerchants());
  const [viewing, setViewing] = useState(null);

  const refresh = () => setMerchants(db.getMerchants());

  const setStatus = (id, status) => {
    db.updateMerchant(id, { status });
    refresh();
  };

  const filtered = merchants.filter(
    (m) =>
      m.business_name.toLowerCase().includes(query.toLowerCase()) ||
      m.owner_name.toLowerCase().includes(query.toLowerCase()) ||
      m.phone.includes(query)
  );

  return (
    <div className="max-w-5xl">
      <h1 className="font-display font-bold text-2xl text-green-700 mb-1">Merchant Management</h1>
      <p className="text-sm text-green-300 mb-6">View, approve, suspend, or reactivate merchants.</p>

      <div className="relative mb-4 max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-green-300" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search merchants..."
          className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-green-100 focus:border-green-500 outline-none text-sm bg-white"
        />
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-green-50 text-green-500 text-xs uppercase font-semibold">
            <tr>
              <th className="text-left px-5 py-3">Business</th>
              <th className="text-left px-5 py-3">Owner</th>
              <th className="text-left px-5 py-3">GST</th>
              <th className="text-left px-5 py-3">Status</th>
              <th className="text-right px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-green-50">
            {filtered.map((m) => (
              <tr key={m.merchant_id} className="hover:bg-green-50/50">
                <td className="px-5 py-3 font-semibold text-green-700">{m.business_name}</td>
                <td className="px-5 py-3 text-green-500">{m.owner_name}</td>
                <td className="px-5 py-3 text-green-400 text-xs font-mono">{m.gst || "—"}</td>
                <td className="px-5 py-3"><StatusBadge status={m.status} /></td>
                <td className="px-5 py-3 text-right space-x-2">
                  <button
                    onClick={() => setViewing(m)}
                    className="text-xs font-semibold text-green-600 border border-green-100 px-3 py-1.5 rounded-lg hover:bg-green-50"
                  >
                    View
                  </button>
                  {m.status !== "active" && (
                    <button onClick={() => setStatus(m.merchant_id, "active")} className="text-xs font-semibold text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-lg hover:bg-emerald-50">
                      Activate
                    </button>
                  )}
                  {m.status === "active" && (
                    <button onClick={() => setStatus(m.merchant_id, "suspended")} className="text-xs font-semibold text-rose-700 border border-rose-200 px-3 py-1.5 rounded-lg hover:bg-rose-50">
                      Suspend
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="text-sm text-green-300 text-center py-10">No merchants found.</p>}
      </div>

      {viewing && <MerchantDetailModal merchant={viewing} onClose={() => setViewing(null)} />}
    </div>
  );
}

function MerchantDetailModal({ merchant, onClose }) {
  const masked = (num) => (num ? `XXXX XXXX ${num.slice(-4)}` : "—");
  const bankStatus = merchant.bank_verification_status;

  return (
    <div className="fixed inset-0 bg-green-900/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-green-50">
          <h2 className="font-display font-bold text-lg text-green-700">{merchant.business_name}</h2>
          <button onClick={onClose} className="text-green-300 hover:text-green-600">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-6">
          <section>
            <p className="text-xs font-semibold text-green-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <Building2 size={13} /> Business Info
            </p>
            <div className="space-y-1.5 text-sm">
              <DetailRow label="Owner Name" value={merchant.owner_name} />
              <DetailRow label="Email" value={merchant.email} />
              <DetailRow label="Phone" value={merchant.phone} />
              <DetailRow label="GST Number" value={merchant.gst || "Not provided"} />
              <DetailRow label="Status" value={<StatusBadge status={merchant.status} />} />
            </div>
          </section>

          <section>
            <p className="text-xs font-semibold text-green-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <MapPin size={13} /> Business Location
            </p>
            {merchant.address_line1 ? (
              <>
                <div className="space-y-1.5 text-sm">
                  <DetailRow label="Address" value={`${merchant.address_line1}${merchant.address_line2 ? ", " + merchant.address_line2 : ""}`} />
                  <DetailRow label="City" value={merchant.city} />
                  <DetailRow label="State" value={merchant.state} />
                  <DetailRow label="Pincode" value={merchant.pincode} mono />
                </div>
                {merchant.business_photo && (
                  <img
                    src={merchant.business_photo}
                    alt="Business location"
                    className="mt-3 w-full h-40 object-cover rounded-lg border border-green-100"
                  />
                )}
              </>
            ) : (
              <p className="text-sm text-green-300 italic">Merchant has not added location details yet.</p>
            )}
          </section>

          <section>
            <p className="text-xs font-semibold text-green-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <Landmark size={13} /> Bank Details
            </p>
            {merchant.account_number ? (
              <>
                <div className="space-y-1.5 text-sm">
                  <DetailRow label="Account Holder" value={merchant.account_holder} />
                  <DetailRow label="Account Number" value={masked(merchant.account_number)} mono />
                  <DetailRow label="IFSC Code" value={merchant.ifsc} mono />
                  <DetailRow label="Bank Name" value={merchant.bank_name} />
                  <DetailRow label="Branch" value={merchant.branch} />
                </div>
                {bankStatus === "verified" ? (
                  <div className="mt-3 flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2">
                    <ShieldCheck size={14} /> Verified
                  </div>
                ) : (
                  <div className="mt-3 flex items-center gap-2 text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
                    <Clock size={14} /> Verification pending
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-green-300 italic">Merchant has not added bank details yet.</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value, mono }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-green-50 last:border-0">
      <span className="text-green-300">{label}</span>
      <span className={`font-semibold text-green-700 text-right ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}
