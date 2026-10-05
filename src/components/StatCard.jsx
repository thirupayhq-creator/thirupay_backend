import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function StatCard({ icon: Icon, label, value, sub, accent = "green", trend }) {
  const accentBg = accent === "green" ? "bg-green-50 text-green-600" : "bg-green-50 text-green-700";
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="card p-5 flex items-start justify-between"
    >
      <div>
        <p className="text-xs font-semibold text-green-400 uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-display font-bold text-green-700 mt-1.5">{value}</p>
        <div className="flex items-center gap-1.5 mt-1">
          {sub && <p className="text-xs text-green-300">{sub}</p>}
          {trend != null && (
            <span className={`flex items-center gap-0.5 text-[11px] font-semibold ${trend >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
              {trend >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              {Math.abs(trend)}%
            </span>
          )}
        </div>
      </div>
      {Icon && (
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accentBg}`}>
          <Icon size={20} strokeWidth={2.2} />
        </div>
      )}
    </motion.div>
  );
}
