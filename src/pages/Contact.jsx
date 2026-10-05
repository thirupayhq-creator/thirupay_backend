import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Phone, MapPin, Clock, CheckCircle2, ChevronDown } from "lucide-react";
import PublicNavbar from "../components/PublicNavbar";
import PublicFooter from "../components/PublicFooter";
import { db, genId } from "../data/mockData";
import { FAQS } from "../data/landingContent";
import { useToast } from "../context/ToastContext";

export default function Contact() {
  const { showToast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [openFaq, setOpenFaq] = useState(null);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError("Please fill in your name, email, and message.");
      return;
    }
    setError("");
    db.addContactMessage({
      message_id: genId("msg"),
      ...form,
      created_at: new Date().toISOString(),
    });
    setSent(true);
    showToast({ title: "Message sent!", subtitle: "Our team will get back to you shortly.", type: "success" });
    setForm({ name: "", email: "", phone: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />

      {/* Header */}
      <section className="bg-soft relative overflow-hidden">
        <div className="grid-fade absolute inset-0" />
        <div className="relative z-10 max-w-3xl mx-auto px-6 pt-20 pb-16 text-center">
          <p className="inline-block bg-green-50 text-green-700 text-xs font-semibold uppercase tracking-wide mb-4 px-3 py-1.5 rounded-full">Contact</p>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-green-900 mb-4 tracking-tight">We're <span className="text-gradient">here to help</span></h1>
          <p className="text-green-600 text-sm sm:text-base leading-relaxed">
            Questions about onboarding, settlements, or anything else — reach out in Tamil or English, whichever is easier.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-12">
        {/* Contact details */}
        <div className="space-y-5">
          {[
            { icon: Mail, label: "Email", value: "support@thirupay.com" },
            { icon: Phone, label: "Phone", value: "+91 98765 43210" },
            { icon: MapPin, label: "Office", value: "Chennai, Tamil Nadu, India" },
            { icon: Clock, label: "Support hours", value: "Mon – Sat, 9:00 AM – 7:00 PM" },
          ].map((item) => (
            <div key={item.label} className="card p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-green-50 text-green-700 flex items-center justify-center shrink-0">
                <item.icon size={18} />
              </div>
              <div>
                <p className="text-xs text-green-600">{item.label}</p>
                <p className="text-sm font-semibold text-green-700">{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="card p-7">
          <AnimatePresence mode="wait">
            {sent ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-10"
              >
                <CheckCircle2 size={44} className="text-emerald-500 mx-auto mb-3" />
                <p className="font-display font-bold text-lg text-green-700">Message sent!</p>
                <p className="text-sm text-green-600 mt-1">We usually reply within one business day.</p>
                <button onClick={() => setSent(false)} className="mt-6 text-sm font-semibold text-green-600 hover:text-green-800">
                  Send another message
                </button>
              </motion.div>
            ) : (
              <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={handleSubmit} className="space-y-4">
                <h2 className="font-display font-bold text-lg text-green-700 mb-1">Send us a message</h2>
                {error && <p className="text-xs text-rose-600 bg-rose-50 px-3 py-2 rounded-lg">{error}</p>}
                <div>
                  <label className="text-xs font-semibold text-green-600 mb-1 block">Name</label>
                  <input
                    value={form.name}
                    onChange={update("name")}
                    placeholder="Your name"
                    className="w-full px-4 py-2.5 rounded-lg border border-green-100 focus:border-green-500 outline-none text-sm bg-white"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-green-600 mb-1 block">Email</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={update("email")}
                      placeholder="you@business.com"
                      className="w-full px-4 py-2.5 rounded-lg border border-green-100 focus:border-green-500 outline-none text-sm bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-green-600 mb-1 block">Phone (optional)</label>
                    <input
                      value={form.phone}
                      onChange={update("phone")}
                      placeholder="98765 43210"
                      className="w-full px-4 py-2.5 rounded-lg border border-green-100 focus:border-green-500 outline-none text-sm bg-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-green-600 mb-1 block">Message</label>
                  <textarea
                    value={form.message}
                    onChange={update("message")}
                    rows={4}
                    placeholder="How can we help?"
                    className="w-full px-4 py-2.5 rounded-lg border border-green-100 focus:border-green-500 outline-none text-sm bg-white resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-brand shadow-brand hover:opacity-95 text-white font-semibold py-3 rounded-xl text-sm transition-opacity"
                >
                  Send message
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-white border-t border-green-100">
        <div className="max-w-3xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <p className="text-green-600 text-xs font-semibold uppercase tracking-wide mb-2">FAQ</p>
            <h2 className="font-display font-bold text-3xl text-green-700">Frequently asked questions</h2>
          </div>
          <div className="space-y-3">
            {FAQS.map((f, i) => (
              <div key={f.q} className="card overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="text-sm font-semibold text-green-700">{f.q}</span>
                  <ChevronDown size={16} className={`text-green-400 shrink-0 transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <p className="text-sm text-green-600 leading-relaxed px-5 pb-4">{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
