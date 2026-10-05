import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Rocket, Users2, TrendingUp } from "lucide-react";
import PublicNavbar from "../components/PublicNavbar";
import PublicFooter from "../components/PublicFooter";
import { useToast } from "../context/ToastContext";

const PURPOSE_POINTS = [
  "Strengthen regulatory compliance and governance.",
  "Meet RBI licensing and capital requirements.",
  "Expand our payment technology platform.",
  "Enhance security and risk management systems.",
  "Scale merchant acquisition across India.",
  "Build a sustainable and compliant payment ecosystem.",
];

const WHY_INVEST = [
  {
    icon: TrendingUp,
    title: "Growing Digital Payments Market",
    desc: "India is one of the world's fastest-growing digital payment markets, with increasing adoption across businesses of every size.",
  },
  {
    icon: Users2,
    title: "Experienced Team",
    desc: "Our team combines expertise in fintech, payment processing, technology, and business operations.",
  },
  {
    icon: Rocket,
    title: "Scalable Business Model",
    desc: "Our platform is designed to support businesses ranging from startups and SMEs to large enterprises.",
  },
  {
    icon: ShieldCheck,
    title: "Long-Term Growth Vision",
    desc: "We are focused on building a compliant, technology-driven organization with sustainable growth rather than pursuing short-term gains.",
  },
];

const PARTNER_TYPES = [
  "Strategic Investors",
  "Venture Capital Funds",
  "Private Equity Funds",
  "Family Offices",
  "Financial Institutions",
  "Payment Industry Partners",
];

const INVESTOR_TYPES = ["Angel Investor", "Venture Capital Fund", "Private Equity Fund", "Family Office", "Financial Institution", "Payment Industry Partner", "Other"];
const INVESTMENT_RANGES = ["Under ₹25 Lakh", "₹25 Lakh – ₹1 Crore", "₹1 Crore – ₹10 Crore", "₹10 Crore – ₹50 Crore", "Above ₹50 Crore"];
const CONTACT_METHODS = ["Email", "Phone Call", "WhatsApp"];

const inputClass =
  "w-full px-4 py-2.5 rounded-lg border border-green-100 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none text-sm bg-white";

export default function InvestmentPartnership() {
  const { showToast } = useToast();
  const [form, setForm] = useState({ investorType: INVESTOR_TYPES[0], investmentRange: INVESTMENT_RANGES[0], contactMethod: CONTACT_METHODS[0] });

  const handleChange = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.fullName || !form.email || !form.mobile) {
      showToast({ title: "Please fill in your name, email and mobile number.", type: "error" });
      return;
    }
    showToast({ title: "Thanks for your interest!", subtitle: "Our team will reach out to you shortly." });
    setForm({ investorType: INVESTOR_TYPES[0], investmentRange: INVESTMENT_RANGES[0], contactMethod: CONTACT_METHODS[0] });
  };

  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />

      {/* Hero */}
      <section className="bg-soft relative overflow-hidden">
        <div className="grid-fade absolute inset-0" />
        <div className="relative z-10 max-w-6xl mx-auto px-6 pt-16 pb-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <p className="inline-block bg-green-50 text-green-700 text-xs font-semibold uppercase tracking-wide mb-4 px-3 py-1.5 rounded-full">
              Investment &amp; Partnership
            </p>
            <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-green-900 mb-5 tracking-tight leading-tight">
              Strategic <span className="text-gradient">Investment Proposal</span>
            </h1>
            <p className="text-green-600 text-sm sm:text-base leading-relaxed mb-8">
              ThiruPay is inviting visionary investors to partner with us as we pursue the Reserve Bank of India (RBI) Payment Aggregator &amp;
              Payment Gateway (PAPG) License. This strategic investment opportunity is designed for investors looking to participate in
              India's rapidly expanding digital payments ecosystem.
            </p>
            <div className="flex gap-10">
              <div>
                <p className="text-[11px] font-semibold text-green-500 uppercase tracking-wide mb-1">Seeking Investment</p>
                
              </div>
              <div>
                <p className="text-[11px] font-semibold text-green-500 uppercase tracking-wide mb-1">Equity Offered</p>
                
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="card p-7"
          >
            <h2 className="font-display font-bold text-xl text-green-800 text-center mb-5">Become a Strategic Investor</h2>
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <input className={inputClass} placeholder="Full Name" value={form.fullName || ""} onChange={(e) => handleChange("fullName", e.target.value)} />
                <input className={inputClass} placeholder="Business Name" value={form.businessName || ""} onChange={(e) => handleChange("businessName", e.target.value)} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <input type="email" className={inputClass} placeholder="Email Address" value={form.email || ""} onChange={(e) => handleChange("email", e.target.value)} />
                <input className={inputClass} placeholder="Mobile Number" value={form.mobile || ""} onChange={(e) => handleChange("mobile", e.target.value.replace(/\D/g, "").slice(0, 10))} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <input className={inputClass} placeholder="Country" value={form.country || ""} onChange={(e) => handleChange("country", e.target.value)} />
                <select className={inputClass} value={form.investorType} onChange={(e) => handleChange("investorType", e.target.value)}>
                  {INVESTOR_TYPES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
              <select className={inputClass} value={form.investmentRange} onChange={(e) => handleChange("investmentRange", e.target.value)}>
                {INVESTMENT_RANGES.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
              <textarea
                className={inputClass}
                rows={3}
                placeholder="Tell Us About Your Interest"
                value={form.message || ""}
                onChange={(e) => handleChange("message", e.target.value)}
              />
              <div>
                <p className="text-xs font-semibold text-green-700 mb-2">Preferred Contact Method</p>
                <div className="flex gap-4 flex-wrap">
                  {CONTACT_METHODS.map((m) => (
                    <label key={m} className="flex items-center gap-1.5 text-sm text-green-600">
                      <input
                        type="radio"
                        name="contactMethod"
                        checked={form.contactMethod === m}
                        onChange={() => handleChange("contactMethod", m)}
                        className="accent-orange-500"
                      />
                      {m}
                    </label>
                  ))}
                </div>
              </div>
              <button type="submit" className="w-full bg-brand shadow-brand hover:opacity-95 text-white text-sm font-semibold px-4 py-3 rounded-xl transition-opacity">
                Submit Interest
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="max-w-3xl mx-auto px-6 py-20 text-center">
        <h2 className="font-display font-bold text-2xl sm:text-3xl text-green-800 mb-6">Building the Future with Our Vision &amp; Mission</h2>
        <p className="text-green-600 text-sm sm:text-base leading-relaxed">
          ThiruPay is an Indian fintech company focused on providing secure and reliable payment solutions for businesses of all sizes.
          Our mission is to simplify digital transactions through innovative technology, strong compliance practices, and customer-centric
          services. Our solutions are designed to help businesses collect, process, and manage payments efficiently while adapting to the
          evolving needs of India's digital economy.
        </p>
      </section>

      {/* Purpose of the Investment */}
      <section className="bg-white border-y border-green-100">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-green-800 text-center mb-3">Purpose of the Investment</h2>
          <p className="text-green-600 text-sm text-center max-w-2xl mx-auto mb-10">
            Obtaining an RBI Payment Aggregator License is an important milestone in our growth roadmap. The investment will enable us to:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
            {PURPOSE_POINTS.map((point, i) => (
              <motion.div
                key={point}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.3, delay: i * 0.06 }}
                className="card p-5 flex items-start gap-3"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 shrink-0" />
                <p className="text-sm text-green-700 leading-relaxed">{point}</p>
              </motion.div>
            ))}
          </div>
          <p className="text-green-600 text-sm text-center max-w-2xl mx-auto">
            Our objective is to create long-term value by establishing a trusted payment infrastructure that supports businesses across
            multiple industries.
          </p>
        </div>
      </section>

      {/* Why Invest */}
      <section className="bg-brand relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-20">
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-white text-center mb-12">Why Invest in ThiruPay?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {WHY_INVEST.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.3, delay: i * 0.08 }}
                className="bg-white/5 border border-white/15 rounded-2xl p-7"
              >
                <div className="w-10 h-10 rounded-lg bg-white/10 text-orange-400 flex items-center justify-center mb-4">
                  <item.icon size={20} />
                </div>
                <p className="font-display font-semibold text-orange-400 text-lg mb-2">{item.title}</p>
                <p className="text-green-100 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Looking for Partners */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-green-800 mb-3">Looking for Long-Term Strategic Partners</h2>
          <p className="text-green-600 text-sm">We welcome discussions with investors who have experience in fintech, banking, and digital payments.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {PARTNER_TYPES.map((type, i) => (
            <motion.div
              key={type}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.3, delay: i * 0.06 }}
              className="border border-green-100 rounded-2xl py-8 px-5 text-center hover:border-orange-300 hover:shadow-card transition-all"
            >
              <p className="font-semibold text-green-800 text-sm">{type}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Contact CTA */}
      <section className="bg-soft relative overflow-hidden">
        <div className="grid-fade absolute inset-0" />
        <div className="relative z-10 max-w-3xl mx-auto px-6 py-20 text-center">
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-green-800 mb-4">Let's Build the Future Together</h2>
          <p className="text-green-600 text-sm mb-8">
            If you are interested in partnering with a fintech company focused on building compliant and scalable payment infrastructure in
            India, reach out to our investment team.
          </p>
          <p className="text-sm text-green-700 mb-1">
            Email:{" "}
            <a href="mailto:investors@thirupay.com" className="text-orange-500 font-medium hover:underline">
              investors@thirupay.com
            </a>
          </p>
          <p className="text-sm text-green-700 mb-8">
            Toll Free:{" "}
            <a href="tel:18005726367" className="text-orange-500 font-medium hover:underline">
              1800-XXX-XXXX
            </a>
          </p>
          <a
            href="mailto:investors@thirupay.com"
            className="inline-flex items-center gap-2 bg-brand shadow-brand hover:opacity-95 text-white font-semibold px-7 py-3 rounded-xl text-sm transition-opacity"
          >
            Contact Us Today <ArrowRight size={16} />
          </a>
        </div>
      </section>

      {/* Final CTA strip */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <h2 className="font-display font-bold text-2xl sm:text-3xl text-green-900 mb-3">
          Ready to take the <span className="text-gradient">next</span> step?
        </h2>
        <p className="text-green-600 text-sm mb-7">Manage all your payments, payouts, and transactions in one place.</p>
        <a
          href="mailto:investors@thirupay.com"
          className="inline-flex items-center gap-2 bg-brand shadow-brand hover:opacity-95 text-white font-semibold px-7 py-3 rounded-xl text-sm transition-opacity"
        >
          Reach out <ArrowRight size={16} />
        </a>
        <p className="text-green-500 text-xs mt-5">For expert solutions tailored to your needs.</p>
      </section>

      <PublicFooter />
    </div>
  );
}
