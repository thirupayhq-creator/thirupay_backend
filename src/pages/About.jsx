import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  QrCode,
  Link2,
  Wallet,
  Zap,
  ShieldCheck,
  Headset,
  Sparkles,
  Store,
  Lock,
  Landmark,
  MapPin,
  CheckCircle2,
  Eye,
  Target,
} from "lucide-react";
import PublicNavbar from "../components/PublicNavbar";
import PublicFooter from "../components/PublicFooter";
import { CITIES, TRUST_BADGES } from "../data/landingContent";
import sirPhoto from "../assets/sir.jpg";

const HERO_INDICATORS = [
  { icon: Zap, label: "Fast Onboarding" },
  { icon: ShieldCheck, label: "Secure Payments" },
  { icon: Headset, label: "Local Support" },
];

const PRINCIPLES = [
  { n: "01", icon: Sparkles, title: "Simple by Design", desc: "Easy tools that merchants can understand and use every day." },
  { n: "02", icon: ShieldCheck, title: "Built for Trust", desc: "Secure transactions and transparent settlement tracking." },
  { n: "03", icon: Store, title: "Merchant First", desc: "Products designed around the real needs of growing businesses." },
  { n: "04", icon: Headset, title: "Local Support", desc: "Support that understands Tamil Nadu businesses and their customers." },
];

const NUMBER_STATS = [
  { value: "< 5 min", label: "Merchant onboarding" },
  { value: "0%", label: "Setup fee" },
  { value: "24/7", label: "QR & payment links" },
  { value: "100%", label: "Verified settlements" },
];

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 0.4, ease: "easeOut" },
};

export default function About() {
  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />

      {/* 1. HERO */}
      <section className="relative overflow-hidden border-b border-green-100">
        <div className="max-w-6xl mx-auto px-6 pt-16 pb-14 grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          <motion.div {...fadeUp}>
            <p className="text-orange-500 text-xs font-semibold tracking-wide mb-4">About ThiruPay</p>
            <h1 className="font-display font-extrabold text-4xl sm:text-[2.75rem] text-green-800 mb-5 leading-[1.1] tracking-tight max-w-md">
              Powering simple payments for growing businesses
            </h1>
            <p className="text-green-500 text-[15px] leading-relaxed mb-8 max-w-[34rem]">
              ThiruPay helps small and growing businesses accept digital payments, manage collections and access essential financial
              services through one simple platform.
            </p>
            <div className="flex flex-wrap items-center gap-3 mb-10">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-brand shadow-brand hover:opacity-95 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-opacity"
              >
                Get Started <ArrowRight size={16} />
              </Link>
              <Link
                to="/product"
                className="inline-flex items-center gap-2 border border-green-200 hover:border-green-400 text-green-700 font-semibold px-6 py-3 rounded-xl text-sm transition-colors"
              >
                Explore Products
              </Link>
            </div>
            <div className="flex flex-wrap gap-x-8 gap-y-3">
              {HERO_INDICATORS.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2">
                  <Icon size={15} className="text-orange-500" />
                  <span className="text-xs font-medium text-green-600">{label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }} className="relative h-[380px] hidden sm:block">
            <div className="absolute inset-0 bg-soft rounded-[28px]" />
            <div className="absolute top-8 left-6 right-16 bg-white rounded-2xl shadow-card p-5 border border-green-100">
              <p className="text-[10px] font-semibold text-green-400 uppercase tracking-wide mb-1">Today's collection</p>
              <p className="font-display font-extrabold text-2xl text-green-800 mb-3">₹48,250</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-green-50 rounded-lg px-3 py-2 flex items-center gap-2">
                  <QrCode size={14} className="text-green-600" />
                  <span className="text-[11px] font-medium text-green-700">QR UPI</span>
                </div>
                <div className="bg-green-50 rounded-lg px-3 py-2 flex items-center gap-2">
                  <Link2 size={14} className="text-green-600" />
                  <span className="text-[11px] font-medium text-green-700">Pay Links</span>
                </div>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.35 }}
              className="absolute top-4 right-0 bg-white rounded-xl shadow-float px-4 py-3 border border-green-100 flex items-center gap-2.5"
            >
              <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center">
                <Wallet size={15} />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-green-800">UPI received</p>
                <p className="text-[10px] text-green-400">Settled next day</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.5 }}
              className="absolute bottom-10 left-14 bg-white rounded-xl shadow-float px-4 py-3 border border-green-100 flex items-center gap-2.5"
            >
              <div className="w-8 h-8 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
                <CheckCircle2 size={15} />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-green-800">Payment link</p>
                <p className="text-[10px] text-green-400">Success</p>
              </div>
            </motion.div>

            <div className="absolute -bottom-6 -right-4 w-28 h-28 rounded-full bg-orange-50/70 blur-2xl" />
          </motion.div>
        </div>
      </section>

      {/* 2. OUR STORY */}
      <section className="max-w-6xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
        <motion.div {...fadeUp}>
          <p className="text-orange-500 text-xs font-semibold tracking-wide mb-3">Our story</p>
          <h2 className="font-display font-bold text-[1.75rem] text-green-800 mb-5 leading-tight max-w-md">
            Built for the businesses that keep Tamil Nadu moving
          </h2>
          <div className="space-y-4 text-[15px] text-green-500 leading-relaxed max-w-[36rem]">
            <p>
              Most digital payment tools in India are built for large retail chains — heavy setup, sales calls, hardware contracts.
              Meanwhile the tea stall around the corner and the fancy store on the main road are still counting notes by hand every evening.
            </p>
            <p>
              ThiruPay flips that: a merchant can register, get verified, and generate their first QR code in under five minutes, with no
              hardware required to get started. Every rupee collected is tracked from the moment a customer scans, right through to the day
              it settles in the merchant's bank account.
            </p>
            <p>
              As merchants grow, the same dashboard opens the door to more: business loans, insurance, SoundBox devices, and POS terminals,
              all requested with a tap and reviewed by a real admin team, not a call center.
            </p>
          </div>
        </motion.div>

        <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }} className="relative">
          <div className="rounded-[24px] bg-green-800 aspect-[4/3] flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 grid-fade opacity-40" />
            <div className="relative bg-white/10 border border-white/15 rounded-2xl px-8 py-7 flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-xl bg-white flex items-center justify-center">
                <QrCode size={34} className="text-green-800" />
              </div>
              <p className="text-white text-sm font-medium">Scan to pay</p>
            </div>
          </div>
          <div className="absolute -bottom-5 left-6 bg-white rounded-xl shadow-float px-4 py-3 border border-green-100 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
              <CheckCircle2 size={15} />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-green-800">Merchant onboarded</p>
              <p className="text-[10px] text-green-400">Under 5 minutes</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 3. FOUNDER + VISION + MISSION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <motion.div
          {...fadeUp}
          className="bg-green-900 rounded-[28px] px-8 py-14 sm:px-14 sm:py-16 grid grid-cols-1 lg:grid-cols-[1.15fr_1px_1fr] gap-10 lg:gap-0 items-center"
        >
          {/* Founder */}
          <div className="flex flex-col sm:flex-row gap-8 sm:gap-9 items-center sm:items-center lg:pr-12">
            <div className="w-32 h-32 sm:w-[168px] sm:h-[168px] rounded-full overflow-hidden border-4 border-white/10 mx-auto sm:mx-0 shrink-0">
              <img
                src={sirPhoto}
                alt="Jayakrishnan J"
                className="w-full h-full object-cover object-[50%_30%] scale-[1.15]"
              />
            </div>
            <div className="text-center sm:text-left">
              <p className="text-orange-400 text-xs font-semibold tracking-wide mb-3">Meet the founder</p>
              <h2 className="font-display font-bold text-2xl sm:text-[1.85rem] text-white mb-4 leading-[1.2] max-w-[420px]">
                Building financial tools with merchants at the center
              </h2>
              <p className="text-green-100 text-sm leading-relaxed max-w-[400px] mb-5">
                ThiruPay was built to simplify financial technology for merchants and businesses, making payments and financial
                services more accessible, reliable, and easy to use.
              </p>
              <p className="font-display font-semibold text-white text-base">Jayakrishnan J</p>
              <p className="text-xs text-blue-400 mt-0.5">Founder &amp; CEO, ThiruPay</p>
              <a
                href="mailto:jayakrishnan@hrify.co.in"
                className="text-xs text-green-300 hover:text-green-200 transition-colors mt-1 inline-block"
              >
                jayakrishnan@hrify.co.in
              </a>
            </div>
          </div>

          {/* Divider */}
          <div className="hidden lg:block bg-white/10 w-px self-stretch" />
          <div className="lg:hidden h-px bg-white/10 w-full" />

          {/* Vision + Mission */}
          <div className="flex flex-col gap-4 lg:pl-12 w-full">
            <div className="bg-white/5 rounded-2xl p-5 sm:p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                <Eye size={20} />
              </div>
              <div>
                <p className="font-display font-semibold text-blue-400 text-sm mb-1">Our Vision</p>
                <p className="text-green-100 text-[13px] leading-relaxed">
                  To empower every merchant in India with easy, trusted, and innovative financial solutions that drive growth and
                  financial freedom.
                </p>
              </div>
            </div>

            <div className="bg-white/5 rounded-2xl p-5 sm:p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-600 text-white flex items-center justify-center shrink-0">
                <Target size={20} />
              </div>
              <div>
                <p className="font-display font-semibold text-green-400 text-sm mb-1">Our Mission</p>
                <p className="text-green-100 text-[13px] leading-relaxed">
                  To build simple and smart financial tools that help merchants collect payments, access credit, manage business,
                  and grow with confidence.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 4. OUR PRINCIPLES */}
      <section className="bg-white border-y border-green-100">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <motion.div {...fadeUp} className="max-w-lg mb-12">
            <p className="text-orange-500 text-xs font-semibold tracking-wide mb-3">What we believe</p>
            <h2 className="font-display font-bold text-[1.75rem] text-green-800 leading-tight">Technology should make business simpler</h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {PRINCIPLES.map(({ n, icon: Icon, title, desc }) => (
              <div
                key={n}
                className="border border-green-100 rounded-2xl p-6 hover:border-orange-200 hover:shadow-card transition-all"
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="w-10 h-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
                    <Icon size={18} />
                  </div>
                  <span className="font-display text-xs font-semibold text-green-200">{n}</span>
                </div>
                <p className="font-semibold text-green-800 text-sm mb-1.5">{title}</p>
                <p className="text-xs text-green-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. BY THE NUMBERS */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-6">
          {NUMBER_STATS.map((s, i) => (
            <motion.div
              key={s.label}
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: i * 0.06 }}
              className={`text-center sm:text-left ${i > 0 ? "sm:border-l sm:border-green-100 sm:pl-6" : ""}`}
            >
              <p className="font-display font-extrabold text-3xl sm:text-4xl text-green-800">{s.value}</p>
              <p className="text-xs text-green-500 mt-1.5">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 6. WHERE WE OPERATE */}
      <section className="bg-white border-y border-green-100">
        <div className="max-w-6xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          <motion.div {...fadeUp} className="relative order-2 lg:order-1">
            <div className="bg-soft rounded-[24px] aspect-square max-w-sm mx-auto relative overflow-hidden">
              <div className="absolute inset-0 grid-fade" />
              {[
                { top: "22%", left: "38%" },
                { top: "40%", left: "58%" },
                { top: "55%", left: "32%" },
                { top: "62%", left: "50%" },
                { top: "35%", left: "22%" },
                { top: "70%", left: "65%" },
                { top: "48%", left: "44%", big: true },
              ].map((p, i) => (
                <span
                  key={i}
                  className={`absolute rounded-full ${p.big ? "w-3.5 h-3.5 bg-orange-500" : "w-2.5 h-2.5 bg-green-400"}`}
                  style={{ top: p.top, left: p.left }}
                />
              ))}
            </div>
          </motion.div>

          <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }} className="order-1 lg:order-2">
            <p className="text-orange-500 text-xs font-semibold tracking-wide mb-3">Where we operate</p>
            <h2 className="font-display font-bold text-[1.75rem] text-green-800 mb-6 leading-tight max-w-md">
              Growing with businesses across Tamil Nadu
            </h2>
            <div className="flex flex-wrap gap-2.5 mb-4">
              {CITIES.map((c) => (
                <span
                  key={c}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 px-3.5 py-2 rounded-full"
                >
                  <MapPin size={12} className="text-orange-500" />
                  {c}
                </span>
              ))}
            </div>
            <p className="text-xs font-medium text-green-500">and growing across Tamil Nadu</p>
          </motion.div>
        </div>
      </section>

      {/* 7. WHY MERCHANTS TRUST US */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <motion.div {...fadeUp} className="text-center max-w-lg mx-auto mb-12">
          <p className="text-orange-500 text-xs font-semibold tracking-wide mb-3">Why merchants trust us</p>
          <h2 className="font-display font-bold text-[1.75rem] text-green-800 leading-tight">Built to be trustworthy, not just fast</h2>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {TRUST_BADGES.map((b) => {
            const Icon = b.icon || (b.title.toLowerCase().includes("encrypt") ? Lock : b.title.toLowerCase().includes("settle") ? Landmark : Headset);
            return (
              <div
                key={b.title}
                className="border border-green-100 rounded-2xl p-8 hover:border-orange-200 hover:shadow-card transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center mb-5">
                  <Icon size={22} />
                </div>
                <p className="font-semibold text-green-800 text-[15px] mb-2">{b.title}</p>
                <p className="text-sm text-green-500 leading-relaxed">{b.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 8. FINAL CTA */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <motion.div {...fadeUp} className="bg-brand shadow-brand rounded-[28px] px-8 py-16 sm:py-20 text-center relative overflow-hidden">
          <div className="absolute inset-0 grid-fade opacity-20" />
          <h2 className="relative z-10 font-display font-bold text-2xl sm:text-3xl text-white mb-3">
            Ready to grow your business with ThiruPay?
          </h2>
          <p className="relative z-10 text-green-100 text-sm mb-8 max-w-md mx-auto">
            Set up your merchant account and start accepting digital payments in minutes.
          </p>
          <Link
            to="/register"
            className="relative z-10 inline-flex items-center gap-2 bg-white text-green-700 hover:bg-green-50 font-semibold px-7 py-3 rounded-xl text-sm transition-colors"
          >
            Get Started <ArrowRight size={16} />
          </Link>
        </motion.div>
      </section>

      <PublicFooter />
    </div>
  );
}