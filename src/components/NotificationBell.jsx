import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import { db } from "../data/mockData";

// items: [{ id, title, subtitle, to }]
export default function NotificationBell({ userId, items, emptyText = "No new notifications right now." }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [readIds, setReadIds] = useState(() => db.getReadNotificationIds(userId));
  const ref = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const unreadCount = items.filter((i) => !readIds.includes(i.id)).length;

  const markAllRead = (e) => {
    e.stopPropagation();
    const merged = db.markNotificationsRead(userId, items.map((i) => i.id));
    setReadIds(merged);
  };

  const handleItemClick = (item) => {
    const merged = db.markNotificationsRead(userId, [item.id]);
    setReadIds(merged);
    setOpen(false);
    if (item.to) navigate(item.to);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative w-9 h-9 rounded-lg border border-green-100 flex items-center justify-center text-green-500 hover:bg-green-50"
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-4 h-4 px-0.5 rounded-full bg-green-500 text-white text-[9px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-card border border-green-100 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-green-50">
            <p className="text-sm font-semibold text-green-700">Notifications</p>
            {items.length > 0 && (
              <button onClick={markAllRead} className="text-[11px] font-semibold text-green-600 hover:underline">
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto divide-y divide-green-50">
            {items.length === 0 ? (
              <p className="text-xs text-green-300 text-center py-8">{emptyText}</p>
            ) : (
              items.map((item) => {
                const isUnread = !readIds.includes(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className={`w-full text-left px-4 py-3 hover:bg-green-50 flex items-start gap-3 transition-colors ${isUnread ? "bg-green-50/50" : ""}`}
                  >
                    <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${isUnread ? "bg-green-500" : "bg-green-100"}`} />
                    <span className="min-w-0">
                      <span className="block text-xs font-semibold text-green-700 truncate">{item.title}</span>
                      <span className="block text-[11px] text-green-400 mt-0.5">{item.subtitle}</span>
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
