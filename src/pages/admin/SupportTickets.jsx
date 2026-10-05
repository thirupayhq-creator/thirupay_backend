import { useState } from "react";
import { LifeBuoy, Send } from "lucide-react";
import { db } from "../../data/mockData";
import StatusBadge from "../../components/StatusBadge";

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export default function SupportTickets() {
  const [tick, setTick] = useState(0);
  const [replyDrafts, setReplyDrafts] = useState({});
  const tickets = db.getAllTickets();
  const merchants = db.getMerchants();
  const merchantName = (id) => merchants.find((m) => m.merchant_id === id)?.business_name || id;

  const setStatus = (ticketId, status) => {
    db.updateTicketStatus(ticketId, status, replyDrafts[ticketId] ?? undefined);
    setTick((t) => t + 1);
  };

  return (
    <div className="max-w-4xl">
      <h1 className="font-display font-bold text-2xl text-green-700 mb-1">Support Tickets</h1>
      <p className="text-sm text-green-300 mb-6">Help & Support requests raised by merchants.</p>

      <div className="space-y-3">
        {tickets.map((tk) => (
          <div key={tk.ticket_id} className="card p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="font-semibold text-green-700 text-sm">
                  {merchantName(tk.merchant_id)} · <span className="text-green-400 font-normal">{tk.subject}</span>
                </p>
                <p className="text-xs text-green-300 mt-0.5">{tk.category} · Raised by {tk.raised_by} · {fmtDate(tk.created_at)}</p>
                <p className="text-sm text-green-500 mt-2">{tk.description}</p>
              </div>
              <StatusBadge status={tk.status} />
            </div>

            {tk.admin_reply && (
              <div className="mt-3 bg-green-50/60 rounded-lg p-3 text-xs text-green-600 max-w-xl">
                <span className="font-semibold text-green-700">Your reply: </span>{tk.admin_reply}
              </div>
            )}

            {tk.status !== "resolved" && (
              <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <input
                  value={replyDrafts[tk.ticket_id] ?? tk.admin_reply ?? ""}
                  onChange={(e) => setReplyDrafts({ ...replyDrafts, [tk.ticket_id]: e.target.value })}
                  placeholder="Write a reply to the merchant..."
                  className="flex-1 w-full px-3 py-2 rounded-lg border border-green-100 text-sm outline-none focus:border-green-500"
                />
                <div className="flex gap-2 shrink-0">
                  {tk.status === "open" && (
                    <button
                      onClick={() => setStatus(tk.ticket_id, "in_progress")}
                      className="flex items-center gap-1.5 text-xs font-semibold text-sky-700 border border-sky-200 px-3 py-2 rounded-lg hover:bg-sky-50"
                    >
                      <Send size={13} /> Mark In Progress
                    </button>
                  )}
                  <button
                    onClick={() => setStatus(tk.ticket_id, "resolved")}
                    className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 border border-emerald-200 px-3 py-2 rounded-lg hover:bg-emerald-50"
                  >
                    <Send size={13} /> Reply & Resolve
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        {tickets.length === 0 && (
          <p className="text-sm text-green-300 text-center py-10 card flex items-center justify-center gap-2">
            <LifeBuoy size={16} /> No support tickets yet.
          </p>
        )}
      </div>
    </div>
  );
}
