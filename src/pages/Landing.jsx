import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Star, Check } from "lucide-react";
import PublicNavbar from "../components/PublicNavbar";
import PublicFooter from "../components/PublicFooter";
import Hero3D from "../components/Hero3D";
import { FEATURES, SERVICES, STAT_HIGHLIGHTS, CITIES, USE_CASES, TESTIMONIALS } from "../data/landingContent";

const TRUST_POINTS = ["Encrypted payments", "T+1 settlement", "KYC-verified merchants", "Tamil & English support"];

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-soft">
        <div className="grid-fade absolute inset-0" />

        <div className="relative z-10 max-w-6xl mx-auto px-6 pt-16 sm:pt-20 pb-10 lg:pb-16 grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-8 lg:gap-12 items-center">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 text-[11px] font-semibold uppercase tracking-wide px-3 py-1.5 rounded-full mb-6">
              QR &amp; Payment Links for merchants
            </div>
            <h1 className="font-display font-extrabold text-4xl sm:text-[2.9rem] leading-[1.06] text-green-900 mb-5 tracking-tight">
              Show a QR.
              <br />
              <span className="text-gradient">Get paid instantly.</span>
            </h1>
            <p className="text-green-600 text-base leading-relaxed max-w-md mb-8">
              Generate a QR or share a payment link — every rupee is tracked from collection to settlement, automatically, on the same dashboard your business runs on.
            </p>
            <div className="flex flex-wrap gap-3 mb-8">
              <Link
                to="/register"
                className="flex items-center gap-2 bg-brand shadow-brand hover:opacity-95 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-opacity"
              >
                Get Started <ArrowRight size={16} />
              </Link>
              <Link
                to="/product"
                className="flex items-center gap-2 border-2 border-green-200 hover:bg-green-50 text-green-700 font-semibold px-6 py-3 rounded-xl text-sm transition-colors"
              >
                See how it works
              </Link>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {TRUST_POINTS.map((p) => (
                <span key={p} className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700">
                  <Check size={14} className="text-orange-500" /> {p}
                </span>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }} className="mb-6 lg:mb-0">
            <Hero3D />
          </motion.div>
        </div>

        {/* Trust strip inside hero band */}
        <div className="relative z-10 border-t border-green-100 mt-4 lg:mt-0">
          <div className="max-w-6xl mx-auto px-6 py-4 flex flex-wrap items-center gap-x-8 gap-y-2 justify-center sm:justify-between">
            <p className="text-[11px] text-green-600 font-medium shrink-0">
              Trusted by merchants across Tamil Nadu
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {CITIES.map((c) => (
                <span key={c} className="text-[11px] text-green-700 bg-green-50 px-2.5 py-1 rounded-full">
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Quick highlights — full detail lives on /product */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center max-w-xl mx-auto mb-12">
          <p className="text-green-600 text-xs font-semibold uppercase tracking-wide mb-2">Why merchants switch</p>
          <h2 className="font-display font-bold text-3xl text-green-700">Everything a merchant needs, one dashboard</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map((f) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.3 }}
              className="card p-6"
            >
              <div className="w-11 h-11 rounded-xl bg-green-50 text-green-700 flex items-center justify-center mb-4">
                <f.icon size={20} />
              </div>
              <p className="font-semibold text-green-700 text-sm mb-1.5">{f.title}</p>
              <p className="text-xs text-green-600 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link to="/product" className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-600 hover:text-green-800">
            See full product details <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      {/* Numbers that matter */}
      <section className="bg-brand relative overflow-hidden">
        <div className="absolute -bottom-24 -left-16 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {STAT_HIGHLIGHTS.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.3, delay: i * 0.06 }}
                className="text-center"
              >
                <div className="w-11 h-11 rounded-xl bg-white/10 text-white flex items-center justify-center mx-auto mb-3">
                  <s.icon size={20} />
                </div>
                <p className="font-display font-extrabold text-2xl text-white">{s.value}</p>
                <p className="text-xs text-green-100 mt-1">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center max-w-xl mx-auto mb-12">
          <p className="text-green-600 text-xs font-semibold uppercase tracking-wide mb-2">Built for every counter</p>
          <h2 className="font-display font-bold text-3xl text-green-700">Whatever you sell, one QR is enough</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {USE_CASES.map((u, i) => (
            <motion.div
              key={u.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.3, delay: i * 0.06 }}
              className="card p-6"
            >
              <div className="w-11 h-11 rounded-xl bg-green-50 text-green-700 flex items-center justify-center mb-4">
                <u.icon size={20} />
              </div>
              <p className="font-semibold text-green-700 text-sm mb-1.5">{u.title}</p>
              <p className="text-xs text-green-600 leading-relaxed">{u.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Beyond payments preview */}
      <section className="bg-white border-y border-green-100">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center max-w-xl mx-auto mb-12">
            <p className="text-green-600 text-xs font-semibold uppercase tracking-wide mb-2">Beyond payments</p>
            <h2 className="font-display font-bold text-3xl text-green-700">Grow with loans, insurance & devices</h2>
            <p className="text-sm text-green-600 mt-3">Request from your dashboard, admin-reviewed — no branch visits.</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {SERVICES.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.3, delay: i * 0.06 }}
                className="card p-6 text-center"
              >
                <div className="w-11 h-11 rounded-xl bg-green-50 text-green-600 flex items-center justify-center mx-auto mb-4">
                  <s.icon size={20} />
                </div>
                <p className="font-semibold text-green-700 text-sm mb-1.5">{s.title}</p>
                <p className="text-xs text-green-600 leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/product#beyond-payments" className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-600 hover:text-green-800">
              Explore all business services <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-white border-y border-green-100">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center max-w-xl mx-auto mb-12">
            <p className="text-green-600 text-xs font-semibold uppercase tracking-wide mb-2">Merchant stories</p>
            <h2 className="font-display font-bold text-3xl text-green-700">What merchants are saying</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
                className="card p-6 flex flex-col"
              >
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} size={13} className="fill-orange-500 text-orange-500" />
                  ))}
                </div>
                <p className="text-sm text-green-600 leading-relaxed mb-5 flex-1">"{t.quote}"</p>
                <div className="flex items-center gap-3 border-t border-green-100 pt-4">
                  <div className="w-9 h-9 rounded-full bg-green-50 text-green-700 font-display font-bold text-xs flex items-center justify-center shrink-0">
                    {t.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-green-700 truncate">{t.name}</p>
                    <p className="text-[11px] text-green-600 truncate">{t.business} · {t.city}</p>
                  </div>
                </div>
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
          <div className="relative z-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 bg-white text-green-700 hover:bg-green-50 font-semibold px-7 py-3 rounded-xl text-sm transition-colors"
            >
              Get Started <ArrowRight size={16} />
            </Link>
            <Link
              to="/download"
              className="inline-flex items-center gap-2 border-2 border-white/30 hover:bg-white/10 text-white font-semibold px-7 py-3 rounded-xl text-sm transition-colors"
            >
              Get the app
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
