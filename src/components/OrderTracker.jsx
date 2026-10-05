import { Check, Clock } from "lucide-react";
import { ORDER_STAGES } from "../data/devicePricing";

const LABELS = {
  requested: "Requested",
  approved: "Approved",
  dispatched: "Dispatched",
  delivered: "Delivered",
};

export default function OrderTracker({ status }) {
  if (status === "rejected") {
    return <p className="text-xs font-medium text-rose-600">This request was rejected.</p>;
  }

  const currentIndex = ORDER_STAGES.indexOf(status);

  return (
    <div className="flex items-center">
      {ORDER_STAGES.map((stage, i) => {
        const done = i <= currentIndex;
        const isLast = i === ORDER_STAGES.length - 1;
        return (
          <div key={stage} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1 shrink-0">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                  done ? "bg-teal-600 text-white" : "bg-green-50 text-green-300"
                }`}
              >
                {done ? <Check size={12} /> : <Clock size={11} />}
              </div>
              <span className={`text-[10px] font-medium whitespace-nowrap ${done ? "text-green-700" : "text-green-300"}`}>
                {LABELS[stage]}
              </span>
            </div>
            {!isLast && (
              <div className={`h-0.5 flex-1 mx-1 mb-4 ${i < currentIndex ? "bg-teal-600" : "bg-green-100"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
