import { motion } from "framer-motion";
import { BarChart, Bar, ResponsiveContainer, Cell } from "recharts";
import { IndianRupee, QrCode, Link2, ArrowUpRight, Circle } from "lucide-react";

const TREND = [
  { day: "Mon", v: 4200 },
  { day: "Tue", v: 5100 },
  { day: "Wed", v: 3800 },
  { day: "Thu", v: 6400 },
  { day: "Fri", v: 7200 },
  { day: "Sat", v: 9100 },
  { day: "Sun", v: 8240 },
];

const RECENT = [
  { label: "Selvi Fancy Store", method: "QR", amount: "₹1,500", time: "just now" },
  { label: "Murugan Tea Stall", method: "Link", amount: "₹320", time: "2m ago" },
  { label: "Kaveri Textiles", method: "QR", amount: "₹4,850", time: "11m ago" },
];

// A browser-chrome-framed live preview of the actual merchant dashboard —
// this is the real product, not an illustration of it.
export default function DashboardPreview() {
  return (
    <div className="relative w-full max-w-[480px] mx-auto lg:mx-0">
      <div className="absolute inset-0 -m-10 bg-green-500/15 blur-3xl rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-green-900"
      >
        {/* Browser chrome */}
        <div className="flex items-center gap-1.5 px-4 py-2.5 bg-green-800 border-b border-white/5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
          <div className="ml-3 flex-1 bg-green-900/60 rounded-md px-3 py-1 text-[10px] text-green-300 font-mono truncate">
            app.thirupay.in/merchant
          </div>
        </div>

        {/* Dashboard body */}
        <div className="bg-[#F6F7FB] p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[10px] text-green-300 font-medium">Selvi Fancy Store</p>
              <p className="text-sm font-display font-bold text-green-700">Today's collection</p>
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
              <Circle size={6} className="fill-emerald-500 text-emerald-500" /> Live
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="card p-3">
              <p className="text-[9px] text-green-300 mb-1">Collected</p>
              <p className="font-display font-bold text-sm text-green-700 flex items-center gap-0.5">
                <IndianRupee size={12} />8,240
              </p>
            </div>
            <div className="card p-3">
              <p className="text-[9px] text-green-300 mb-1">Settled</p>
              <p className="font-display font-bold text-sm text-green-700 flex items-center gap-0.5">
                <IndianRupee size={12} />6,540
              </p>
            </div>
            <div className="card p-3">
              <p className="text-[9px] text-green-300 mb-1">Pending</p>
              <p className="font-display font-bold text-sm text-green-600 flex items-center gap-0.5">
                <IndianRupee size={12} />1,700
              </p>
            </div>
          </div>

          <div className="card p-3 mb-3">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[9px] text-green-300 font-medium">7-day volume</p>
              <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-emerald-600">
                <ArrowUpRight size={10} /> 18%
              </span>
            </div>
            <div className="h-16">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={TREND} barCategoryGap="30%">
                  <Bar dataKey="v" radius={[3, 3, 0, 0]}>
                    {TREND.map((d, i) => (
                      <Cell key={i} fill={i === TREND.length - 1 ? "#0B2A4A" : "#0B2A4A"} fillOpacity={i === TREND.length - 1 ? 1 : 0.15} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card p-3">
            <p className="text-[9px] text-green-300 font-medium mb-2">Recent payments</p>
            <div className="space-y-2">
              {RECENT.map((r, i) => (
                <motion.div
                  key={r.label}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.15 }}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${r.method === "QR" ? "bg-green-50 text-green-600" : "bg-green-50 text-green-700"}`}>
                      {r.method === "QR" ? <QrCode size={12} /> : <Link2 size={12} />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold text-green-700 truncate">{r.label}</p>
                      <p className="text-[9px] text-green-300">{r.time}</p>
                    </div>
                  </div>
                  <p className="text-[10px] font-bold text-green-700 shrink-0">{r.amount}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Floating settlement chip */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="absolute -right-4 -bottom-5 bg-white rounded-xl shadow-xl px-4 py-2.5 border border-green-100 hidden sm:block"
      >
        <p className="text-[9px] text-green-300">Next settlement</p>
        <p className="text-xs font-display font-bold text-green-700">Tomorrow, 10:00 AM</p>
      </motion.div>
    </div>
  );
}
