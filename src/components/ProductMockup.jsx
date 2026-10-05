import { motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { Wifi, Signal, BatteryFull } from "lucide-react";

export default function ProductMockup() {
  return (
    <div className="relative w-[260px] mx-auto lg:mx-0">
      {/* Ambient glow behind phone */}
      <div className="absolute inset-0 -m-8 bg-green-500/20 blur-3xl rounded-full" />

      {/* Phone frame */}
      <div className="relative bg-green-900 rounded-[2.2rem] p-2.5 shadow-2xl border border-white/10">
        <div className="bg-[#F6F7FB] rounded-[1.7rem] overflow-hidden">
          {/* Status bar */}
          <div className="flex items-center justify-between px-5 pt-3 pb-1 text-green-700">
            <span className="text-[10px] font-semibold">9:41</span>
            <div className="flex items-center gap-1">
              <Signal size={10} />
              <Wifi size={10} />
              <BatteryFull size={11} />
            </div>
          </div>

          {/* App header */}
          <div className="px-5 pt-2 pb-3">
            <p className="text-[10px] text-green-300 font-medium">Selvi Fancy Store</p>
            <p className="text-sm font-display font-bold text-green-700">Show QR to collect</p>
          </div>

          {/* QR block */}
          <div className="mx-5 mb-4 bg-white rounded-2xl p-4 flex flex-col items-center shadow-card border border-green-100">
            <QRCodeSVG value="thirupay://pay?merchant=demo" size={128} fgColor="#0B2A4A" level="M" />
            <p className="text-[10px] text-green-300 mt-2">Scan with any UPI app</p>
          </div>

          {/* Bottom nav hint */}
          <div className="flex justify-around px-4 pb-4">
            {["Home", "QR", "Links", "History"].map((label, i) => (
              <div key={label} className="flex flex-col items-center gap-1">
                <div className={`w-1.5 h-1.5 rounded-full ${i === 1 ? "bg-green-500" : "bg-green-100"}`} />
                <span className={`text-[8px] ${i === 1 ? "text-green-600 font-semibold" : "text-green-300"}`}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating payment toast — the signature animated moment */}
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.6, duration: 0.5, repeat: Infinity, repeatDelay: 3, repeatType: "reverse" }}
        className="absolute -right-8 top-16 bg-white rounded-xl shadow-2xl px-4 py-3 border border-green-100 w-44"
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs font-bold shrink-0">
            ₹
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-green-700 leading-tight">₹1,500 received</p>
            <p className="text-[9px] text-green-300 leading-tight">via UPI · just now</p>
          </div>
        </div>
      </motion.div>

      {/* Small settlement chip */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="absolute -left-6 bottom-24 bg-green-700 rounded-xl shadow-xl px-3 py-2 border border-white/10"
      >
        <p className="text-[9px] text-green-300">Today's collection</p>
        <p className="text-xs font-display font-bold text-white">₹8,240</p>
      </motion.div>
    </div>
  );
}
