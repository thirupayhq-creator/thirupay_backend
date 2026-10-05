const STYLES = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  settled: "bg-emerald-50 text-emerald-700 border-emerald-200",
  paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
  delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  resolved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  verified: "bg-emerald-50 text-emerald-700 border-emerald-200",

  dispatched: "bg-sky-50 text-sky-700 border-sky-200",
  in_progress: "bg-sky-50 text-sky-700 border-sky-200",
  processing: "bg-sky-50 text-sky-700 border-sky-200",

  pending: "bg-amber-50 text-amber-700 border-amber-200",
  open: "bg-amber-50 text-amber-700 border-amber-200",

  rejected: "bg-rose-50 text-rose-700 border-rose-200",
  suspended: "bg-rose-50 text-rose-700 border-rose-200",
  expired: "bg-slate-100 text-slate-500 border-slate-200",
  failed: "bg-rose-50 text-rose-700 border-rose-200",

  refunded: "bg-violet-50 text-violet-700 border-violet-200",
};

export default function StatusBadge({ status }) {
  const style = STYLES[status] || "bg-slate-100 text-slate-600 border-slate-200";
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border capitalize ${style}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {String(status).replace(/_/g, " ")}
    </span>
  );
}
