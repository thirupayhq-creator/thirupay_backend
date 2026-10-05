import { motion } from "framer-motion";
import { QrCode, Link2, Wallet, ShieldCheck } from "lucide-react";

const GRID_ITEMS = [
  { icon: QrCode, label: "QR UPI" },
  { icon: Link2, label: "Pay Links" },
  { icon: Wallet, label: "Settle" },
  { icon: ShieldCheck, label: "Insurance" },
];

const ROWS = ["QR collection", "Payment link", "Settlement"];

export default function Hero3D() {
  return (
    // Square at every breakpoint, and uses flexbox (not top/left + translate)
    // to center the phone — robust regardless of breakpoint/transform quirks.
    <div
      className="relative mx-auto flex items-center justify-center w-[220px] h-[220px] sm:w-[300px] sm:h-[300px] lg:w-[360px] lg:h-[360px]"
      style={{ perspective: "1200px", transformStyle: "preserve-3d" }}
    >
      {/* soft glow + rotating dashed ring — centered on the container */}
      <div className="absolute inset-6 rounded-full bg-orange-400/15 blur-3xl" />
      <div className="animate-spin-slow absolute inset-4 rounded-full border border-dashed border-orange-400/40" />

      {/* phone — centered via flexbox on the parent, not absolute+translate */}
      <motion.div
        className="relative h-[160px] w-[91px] sm:h-[220px] sm:w-[125px] lg:h-[290px] lg:w-[164px] rounded-[16px] sm:rounded-[22px] lg:rounded-[28px] border border-orange-200 bg-white p-1.5 sm:p-2.5 lg:p-3 shadow-float"
        initial={{ opacity: 0, y: 40, rotateY: -18 }}
        animate={{ opacity: 1, y: 0, rotateY: -12, rotateX: 6 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        whileHover={{ rotateY: 0, rotateX: 0, scale: 1.03 }}
        style={{ transformStyle: "preserve-3d" }}
      >
        <div className="bg-brand flex h-full flex-col rounded-[12px] sm:rounded-[17px] lg:rounded-[21px] p-1.5 sm:p-2.5 lg:p-3.5 text-white">
          <p className="text-[5px] sm:text-[8px] lg:text-[10px] tracking-widest opacity-80 uppercase">ThiruPay</p>
          <p className="mt-0.5 font-display text-[10px] sm:text-sm lg:text-lg font-extrabold">₹48,250</p>
          <p className="text-[5px] sm:text-[8px] lg:text-[10px] opacity-75">Today's collection</p>

          <div className="mt-1 sm:mt-2.5 lg:mt-3.5 grid grid-cols-2 gap-0.5 sm:gap-1.5">
            {GRID_ITEMS.map(({ icon: Icon, label }) => (
              <div key={label} className="rounded sm:rounded-lg bg-white/15 p-0.5 sm:p-1.5 text-center backdrop-blur-sm">
                <Icon className="mx-auto h-1.5 w-1.5 sm:h-3 sm:w-3 lg:h-3.5 lg:w-3.5" />
                <p className="mt-0.5 text-[4px] sm:text-[7px] lg:text-[8px] font-medium leading-tight hidden sm:block">{label}</p>
              </div>
            ))}
          </div>

          <div className="mt-auto space-y-0.5 sm:space-y-1 hidden sm:block">
            {ROWS.map((row) => (
              <div key={row} className="flex items-center justify-between rounded sm:rounded-md bg-white/12 px-1 sm:px-1.5 py-0.5 sm:py-1 text-[7px] lg:text-[8px]">
                <span>{row}</span>
                <span className="opacity-80">Success</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* floating card — left. Sits outside the phone, near the circle's edge */}
      <motion.div
        className="hidden sm:block absolute top-[6%] left-[-14%] w-32 lg:w-36 rounded-xl lg:rounded-2xl border border-orange-100 bg-white p-2.5 shadow-soft"
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        whileHover={{ y: -6, rotate: -2 }}
        style={{ transform: "perspective(700px) rotateY(14deg)" }}
      >
        <div className="flex items-center gap-2">
          <span className="bg-brand flex h-6 w-6 items-center justify-center rounded-md text-[10px] text-white shrink-0">₹</span>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold text-orange-800 leading-tight">UPI received</p>
            <p className="text-[9px] text-orange-500 leading-tight">Settled next day</p>
          </div>
        </div>
      </motion.div>

      {/* floating card — right. Sits outside the phone, near the circle's edge */}
      <motion.div
        className="hidden sm:block absolute right-[-14%] bottom-[6%] w-36 lg:w-40 rounded-xl lg:rounded-2xl border border-orange-100 bg-white p-2.5 shadow-soft"
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        whileHover={{ y: -6, rotate: 2 }}
        style={{ transform: "perspective(700px) rotateY(-14deg)" }}
      >
        <p className="text-[10px] font-semibold text-orange-800 leading-tight">SoundBox alert</p>
        <p className="mt-0.5 text-[9px] text-orange-500 leading-tight">"₹500 received"</p>
        <div className="mt-1.5 flex gap-0.5 items-end h-3.5">
          {[6, 12, 9, 16, 7, 13].map((h, i) => (
            <motion.span
              key={i}
              className="w-1 rounded-full bg-orange-500"
              animate={{ height: [h * 0.6, h * 1.1, h * 0.6] }}
              transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.1 }}
              style={{ height: h * 0.6 }}
            />
          ))}
        </div>
      </motion.div>

      {/* floating badge */}
      <motion.div
        className="animate-float absolute -top-2 right-2 sm:top-0 sm:right-2 rounded-full border border-orange-100 bg-white px-1.5 sm:px-2.5 py-0.5 sm:py-1 text-[7px] sm:text-[10px] font-semibold text-orange-700 shadow-soft"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.7 }}
      >
        7+ services
      </motion.div>
    </div>
  );
}