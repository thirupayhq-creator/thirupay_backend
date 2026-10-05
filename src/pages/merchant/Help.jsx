import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { QrCode, Wallet, ShieldCheck, Sparkles, Users, ChevronDown, LifeBuoy, Phone, Mail, MessageCircle, Send } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { db, genId } from "../../data/mockData";
import { FAQ_CATEGORIES, TICKET_CATEGORIES } from "../../data/helpData";
import StatusBadge from "../../components/StatusBadge";

const ICONS = { QrCode, Wallet, ShieldCheck, Sparkles, Users };

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export default function Help() {
  const { session } = useAuth();
  const [searchParams] = useSearchParams();
  const reportedTxnId = searchParams.get("report");
  const [activeCategory, setActiveCategory] = useState(FAQ_CATEGORIES[0].key);
  const [openFaq, setOpenFaq] = useState(null);
  const [tickets, setTickets] = useState(db.getTicketsByMerchant(session.merchantId));
  const [form, setForm] = useState(
    reportedTxnId
      ? { category: "Report a problem", subject: `Issue with transaction ${reportedTxnId}`, description: `Transaction ID: ${reportedTxnId}\n\nDescribe what went wrong: ` }
      : { category: TICKET_CATEGORIES[0], subject: "", description: "" }
  );
  const [submitted, setSubmitted] = useState(false);

  const category = FAQ_CATEGORIES.find((c) => c.key === activeCategory);

  const handleSubmit = (e) => {
    e.preventDefault();
    db.addTicket({
      ticket_id: genId("tkt"),
      merchant_id: session.merchantId,
      raised_by: session.name,
      category: form.category,
      subject: form.subject,
      description: form.description,
      status: "open",
      admin_reply: "",
      created_at: new Date().toISOString(),
    });
    setForm({ category: TICKET_CATEGORIES[0], subject: "", description: "" });
    setTickets(db.getTicketsByMerchant(session.merchantId));
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="max-w-4xl">
      <h1 className="font-display font-bold text-2xl text-green-700 mb-1">Help & Support</h1>
      <p className="text-sm text-green-300 mb-6">Find answers, raise a ticket, or reach us directly.</p>

      {/* Contact strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        <div className="card p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-green-50 text-green-600 flex items-center justify-center shrink-0"><Phone size={16} /></div>
          <div>
            <p className="text-xs text-green-300">Merchant Helpline</p>
            <p className="text-sm font-semibold text-green-700">1800-266-4787</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-green-50 text-green-600 flex items-center justify-center shrink-0"><Mail size={16} /></div>
          <div>
            <p className="text-xs text-green-300">Email Support</p>
            <p className="text-sm font-semibold text-green-700">merchants@thirupay.in</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-green-50 text-green-600 flex items-center justify-center shrink-0"><MessageCircle size={16} /></div>
          <div>
            <p className="text-xs text-green-300">Support Hours</p>
            <p className="text-sm font-semibold text-green-700">24×7, every day</p>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="mb-8">
        <h2 className="font-display font-semibold text-green-700 mb-3">Frequently Asked Questions</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {FAQ_CATEGORIES.map((c) => {
            const Icon = ICONS[c.icon];
            return (
              <button
                key={c.key}
                onClick={() => { setActiveCategory(c.key); setOpenFaq(null); }}
                className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border transition-colors ${
                  activeCategory === c.key ? "bg-green-700 text-white border-green-700" : "border-green-100 text-green-500 hover:bg-green-50"
                }`}
              >
                <Icon size={14} /> {c.label}
              </button>
            );
          })}
        </div>

        <div className="card divide-y divide-green-50">
          {category.faqs.map((f, i) => (
            <div key={f.q}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
              >
                <span className="text-sm font-medium text-green-700">{f.q}</span>
                <ChevronDown size={16} className={`text-green-300 shrink-0 transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
              </button>
              {openFaq === i && <p className="px-5 pb-4 text-sm text-green-400 leading-relaxed -mt-1">{f.a}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* Raise a ticket */}
      <div className="card p-6 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <LifeBuoy size={16} className="text-green-600" />
          <h2 className="font-display font-semibold text-green-700">Raise a Ticket</h2>
        </div>
        {reportedTxnId && (
          <div className="flex items-center gap-2 bg-rose-50 text-rose-700 text-xs font-medium px-3 py-2 rounded-lg mb-4">
            Reporting a problem for transaction <span className="font-mono">{reportedTxnId}</span>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-green-500 mb-1.5">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg border border-green-100 text-sm bg-white outline-none focus:border-green-500"
              >
                {TICKET_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-green-500 mb-1.5">Subject</label>
              <input
                required
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                placeholder="Short summary of the issue"
                className="w-full px-3 py-2.5 rounded-lg border border-green-100 text-sm outline-none focus:border-green-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-green-500 mb-1.5">Description</label>
            <textarea
              required
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe what happened, including any transaction/settlement ID if relevant"
              className="w-full px-3 py-2.5 rounded-lg border border-green-100 text-sm outline-none focus:border-green-500 resize-none"
            />
          </div>
          {submitted && <p className="text-xs font-medium text-emerald-600">Ticket raised — our team will get back to you soon.</p>}
          <button
            type="submit"
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
          >
            <Send size={14} /> Submit Ticket
          </button>
        </form>
      </div>

      {/* My tickets */}
      <div className="card p-6">
        <h2 className="font-display font-semibold text-green-700 mb-4">My Tickets</h2>
        {tickets.length === 0 ? (
          <p className="text-sm text-green-300 text-center py-6">No tickets raised yet.</p>
        ) : (
          <div className="divide-y divide-green-50">
            {tickets.map((tk) => (
              <div key={tk.ticket_id} className="py-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-green-700">{tk.subject}</p>
                    <p className="text-xs text-green-300">{tk.category} · {fmtDate(tk.created_at)}</p>
                  </div>
                  <StatusBadge status={tk.status} />
                </div>
                <p className="text-sm text-green-500 mt-2">{tk.description}</p>
                {tk.admin_reply && (
                  <div className="mt-2 bg-green-50/60 rounded-lg p-3 text-xs text-green-600">
                    <span className="font-semibold text-green-700">Support team: </span>{tk.admin_reply}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
