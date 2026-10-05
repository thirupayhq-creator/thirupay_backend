import { createContext, useContext, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Info, XCircle } from "lucide-react";

const ToastContext = createContext(null);

const ICONS = {
  success: CheckCircle2,
  info: Info,
  error: XCircle,
};

const COLORS = {
  success: { bg: "bg-emerald-50", text: "text-emerald-700", icon: "text-emerald-500" },
  info: { bg: "bg-white", text: "text-green-700", icon: "text-green-500" },
  error: { bg: "bg-rose-50", text: "text-rose-700", icon: "text-rose-500" },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback(({ title, subtitle, type = "success", duration = 3500 }) => {
    const id = `toast_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    setToasts((prev) => [...prev, { id, title, subtitle, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
    return id;
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}
      {/* Toast stack — top-center on desktop, safe-area top on mobile */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-2 w-[92%] max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => {
            const Icon = ICONS[toast.type] || CheckCircle2;
            const c = COLORS[toast.type] || COLORS.success;
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: -24, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -16, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
                onClick={() => dismissToast(toast.id)}
                className={`pointer-events-auto w-full ${c.bg} ${c.text} shadow-card rounded-xl px-4 py-3 flex items-start gap-3 border border-black/5 cursor-pointer`}
              >
                <Icon size={20} className={`${c.icon} shrink-0 mt-0.5`} />
                <div className="min-w-0">
                  <p className="text-sm font-semibold leading-tight">{toast.title}</p>
                  {toast.subtitle && <p className="text-xs opacity-80 mt-0.5 leading-tight">{toast.subtitle}</p>}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
