import { useState } from "react";
import { Banknote, ShieldPlus, Volume2, Smartphone, Check, X, Truck, PackageCheck, Receipt } from "lucide-react";
import { db } from "../../data/mockData";
import StatusBadge from "../../components/StatusBadge";
import OrderTracker from "../../components/OrderTracker";

const ICONS = {
  loan: Banknote,
  insurance: ShieldPlus,
  soundbox: Volume2,
  pos_device: Smartphone,
};

const HARDWARE_TYPES = ["soundbox", "pos_device"];

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function fmtMoney(n) {
  return `₹${Number(n).toLocaleString("en-IN")}`;
}

function detailsSummary(req) {
  switch (req.type) {
    case "loan":
      return `${fmtMoney(req.details.amount)} · ${req.details.purpose} · Turnover ${fmtMoney(req.details.turnover)}/mo`;
    case "insurance":
      return `${req.details.insuranceType} · Coverage ${fmtMoney(req.details.coverage)}`;
    case "soundbox":
    case "pos_device": {
      const plan = req.details.pricingOption === "rental" ? "Rental" : "One-time";
      const device = req.details.deviceType || (req.type === "soundbox" ? "SoundBox" : "POS Device");
      return `${device} · Qty ${req.details.quantity} · ${plan}`;
    }
    default:
      return "";
  }
}

export default function ServiceRequests() {
  const [tick, setTick] = useState(0);
  const requests = db.getAllRequests();
  const merchants = db.getMerchants();
  const merchantName = (id) => merchants.find((m) => m.merchant_id === id)?.business_name || id;

  const decide = (requestId, status) => {
    db.updateRequestStatus(requestId, status);
    setTick((t) => t + 1);
  };

  return (
    <div className="max-w-4xl">
      <h1 className="font-display font-bold text-2xl text-green-700 mb-1">Service Requests</h1>
      <p className="text-sm text-green-300 mb-6">Loan, Insurance, SoundBox, and POS Device requests from merchants.</p>

      <div className="space-y-3">
        {requests.map((r) => {
          const Icon = ICONS[r.type];
          const isHardware = HARDWARE_TYPES.includes(r.type);
          return (
            <div key={r.request_id} className="card p-5">
              <div className="flex items-center gap-5">
                <div className="w-11 h-11 rounded-xl bg-green-50 text-green-700 flex items-center justify-center shrink-0">
                  <Icon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-green-700 text-sm capitalize">
                    {merchantName(r.merchant_id)} · <span className="text-green-400 font-normal">{r.type.replace("_", " ")}</span>
                  </p>
                  <p className="text-xs text-green-300 mt-0.5">{detailsSummary(r)} · {fmtDate(r.created_at)}</p>
                </div>
                {!isHardware && <StatusBadge status={r.status === "requested" ? "pending" : r.status} />}
                {isHardware && r.status === "requested" && <StatusBadge status="pending" />}

                {r.status === "requested" && (
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => decide(r.request_id, "approved")}
                      className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-lg hover:bg-emerald-50"
                    >
                      <Check size={13} /> Approve
                    </button>
                    <button
                      onClick={() => decide(r.request_id, "rejected")}
                      className="flex items-center gap-1.5 text-xs font-semibold text-rose-700 border border-rose-200 px-3 py-1.5 rounded-lg hover:bg-rose-50"
                    >
                      <X size={13} /> Reject
                    </button>
                  </div>
                )}

                {isHardware && r.status === "approved" && (
                  <button
                    onClick={() => decide(r.request_id, "dispatched")}
                    className="flex items-center gap-1.5 text-xs font-semibold text-sky-700 border border-sky-200 px-3 py-1.5 rounded-lg hover:bg-sky-50 shrink-0"
                  >
                    <Truck size={13} /> Mark Dispatched
                  </button>
                )}
                {isHardware && r.status === "dispatched" && (
                  <button
                    onClick={() => decide(r.request_id, "delivered")}
                    className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-lg hover:bg-emerald-50 shrink-0"
                  >
                    <PackageCheck size={13} /> Mark Delivered
                  </button>
                )}
                {isHardware && r.status === "delivered" && <StatusBadge status="delivered" />}
              </div>

              {isHardware && r.status !== "requested" && (
                <div className="mt-4 pl-16 space-y-3">
                  <OrderTracker status={r.status} />
                  {r.status !== "rejected" && (
                    <div className="bg-green-50/60 rounded-lg p-3 text-xs text-green-500 space-y-1 max-w-sm">
                      <div className="flex items-center gap-1.5 font-semibold text-green-700 mb-1">
                        <Receipt size={13} /> Invoice
                      </div>
                      <div className="flex justify-between"><span>Unit price × {r.details.quantity}</span><span>{fmtMoney(r.details.unitPrice * r.details.quantity)}</span></div>
                      <div className="flex justify-between"><span>GST (18%)</span><span>{fmtMoney(r.details.gst)}</span></div>
                      <div className="flex justify-between font-semibold text-green-700 pt-1 border-t border-green-100">
                        <span>Total{r.details.pricingOption === "rental" ? " / month" : ""}</span>
                        <span>{fmtMoney(r.details.invoiceTotal)}</span>
                      </div>
                      <p className="text-[11px] text-green-400 pt-1">Deliver to: {r.details.address}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {requests.length === 0 && <p className="text-sm text-green-300 text-center py-10 card">No service requests yet.</p>}
      </div>
    </div>
  );
}
