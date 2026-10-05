import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Check, Minus } from "lucide-react";
import PublicNavbar from "../components/PublicNavbar";
import PublicFooter from "../components/PublicFooter";
import { FEATURES, SERVICES, STEPS, COMPARE } from "../data/landingContent";

export default function Product() {
  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />

      {/* Header */}
      <section className="bg-soft relative overflow-hidden">
        <div className="grid-fade absolute inset-0" />
        <div className="relative z-10 max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
          <p className="inline-block bg-green-50 text-green-700 text-xs font-semibold uppercase tracking-wide mb-4 px-3 py-1.5 rounded-full">Product</p>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-green-900 mb-4 tracking-tight">
            Everything a merchant needs, <span className="text-gradient">on one dashboard</span>
          </h1>
          <p className="text-green-600 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            From collecting your first payment to tracking settlements and growing with loans or insurance — ThiruPay covers the full journey.
          </p>
        </div>
      </section>

      {/* Core features — detailed */}
      <section id="core-features" className="max-w-6xl mx-auto px-6 py-20 scroll-mt-20">
        <div className="text-center max-w-xl mx-auto mb-12">
          <p className="text-green-600 text-xs font-semibold uppercase tracking-wide mb-2">Core features</p>
          <h2 className="font-display font-bold text-3xl text-green-700">Collect, track, settle</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="card p-7"
            >
              <div className="w-12 h-12 rounded-xl bg-green-50 text-green-700 flex items-center justify-center mb-5">
                <f.icon size={22} />
              </div>
              <p className="font-display font-semibold text-green-700 text-base mb-2">{f.title}</p>
              <p className="text-sm text-green-600 leading-relaxed">{f.detail}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Beyond payments */}
      <section id="beyond-payments" className="bg-white border-y border-green-100 scroll-mt-20">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center max-w-xl mx-auto mb-12">
            <p className="text-green-600 text-xs font-semibold uppercase tracking-wide mb-2">Beyond payments</p>
            <h2 className="font-display font-bold text-3xl text-green-700">Everything to grow your business</h2>
            <p className="text-sm text-green-600 mt-3">Request a loan, insurance, or hardware — right from your merchant dashboard. Admin reviews and approves.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {SERVICES.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="card p-7 border border-green-50"
              >
                <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center mb-5">
                  <s.icon size={22} />
                </div>
                <p className="font-display font-semibold text-green-700 text-base mb-2">{s.title}</p>
                <p className="text-sm text-green-600 leading-relaxed">{s.detail}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center max-w-xl mx-auto mb-12">
          <p className="text-green-600 text-xs font-semibold uppercase tracking-wide mb-2">Why switch</p>
          <h2 className="font-display font-bold text-3xl text-green-700">Cash counting ends here</h2>
          <p className="text-sm text-green-600 mt-3">A side-by-side of how collections work today versus on ThiruPay.</p>
        </div>

        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[560px]">
              <thead>
                <tr className="bg-green-50">
                  <th className="text-left text-xs font-semibold text-green-500 uppercase tracking-wide py-4 px-5 w-[38%]"></th>
                  <th className="text-left text-xs font-semibold text-green-600 uppercase tracking-wide py-4 px-5">Cash / bank transfer</th>
                  <th className="text-left text-xs font-semibold text-green-600 uppercase tracking-wide py-4 px-5">ThiruPay</th>
                </tr>
              </thead>
              <tbody>
                {COMPARE.map((row, i) => (
                  <motion.tr
                    key={row.row}
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    className="border-t border-green-50"
                  >
                    <td className="py-4 px-5 text-sm font-semibold text-green-700">{row.row}</td>
                    <td className="py-4 px-5">
                      <span className="inline-flex items-center gap-1.5 text-xs text-green-600">
                        <Minus size={14} className="text-green-200 shrink-0" /> {row.cash}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700">
                        <Check size={14} className="text-emerald-500 shrink-0" /> {row.thirupay}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white border-y border-green-100">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center max-w-xl mx-auto mb-12">
            <p className="text-green-600 text-xs font-semibold uppercase tracking-wide mb-2">How it works</p>
            <h2 className="font-display font-bold text-3xl text-green-700">From sign-up to your first payment</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
                className="text-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center mx-auto mb-4">
                  <s.icon size={24} />
                </div>
                <p className="font-display font-bold text-green-700 mb-1.5">
                  <span className="text-green-500 mr-1.5">{i + 1}.</span>
                  {s.title}
                </p>
                <p className="text-xs text-green-600 max-w-[220px] mx-auto leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="bg-brand shadow-brand rounded-3xl px-8 py-14 text-center relative overflow-hidden">
          <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-white mb-3 relative z-10">Ready to start collecting?</h2>
          <p className="text-green-100 text-sm mb-8 relative z-10">Set up your merchant account in under 5 minutes.</p>
          <Link
            to="/register"
            className="relative z-10 inline-flex items-center gap-2 bg-white text-green-700 hover:bg-green-50 font-semibold px-7 py-3 rounded-xl text-sm transition-colors"
          >
            Get Started <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
