import { useState, useEffect, useRef } from "react";
import { Link as RouterLink } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ShieldCheck,
  X,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  HeartPulse,
  UserRound,
  ShieldAlert,
  Car,
  Volume2,
  BatteryCharging,
  Wifi,
  Zap,
  Percent,
  FileCheck2,
} from "lucide-react";
import { db } from "../data/mockData";

const CATEGORY_ICONS = {
  HeartPulse, UserRound, ShieldAlert, Car, Volume2, BatteryCharging, Wifi, Zap, Percent, FileCheck2,
};

const THEME = {
  blue: {
    wrapper: "bg-gradient-to-br from-[#EAF3FF] via-[#F1F8FF] to-[#EAFBF6]",
    badgeText: "text-blue-600",
    cta: "bg-blue-600 hover:bg-blue-700 shadow-blue-200",
    chip: "bg-white/80 text-slate-600",
    chipIcon: "text-blue-500",
    blobA: "#BFDBFE",
    blobB: "#A7F3D0",
    iconColor: "#2563EB",
  },
  amber: {
    wrapper: "bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50",
    badgeText: "text-amber-600",
    cta: "bg-amber-500 hover:bg-amber-600 shadow-amber-200",
    chip: "bg-white/80 text-slate-600",
    chipIcon: "text-amber-500",
    blobA: "#FDE68A",
    blobB: "#FED7AA",
    iconColor: "#D97706",
  },
  violet: {
    wrapper: "bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50",
    badgeText: "text-violet-600",
    cta: "bg-violet-600 hover:bg-violet-700 shadow-violet-200",
    chip: "bg-white/80 text-slate-600",
    chipIcon: "text-violet-500",
    blobA: "#DDD6FE",
    blobB: "#FBCFE8",
    iconColor: "#7C3AED",
  },
  green: {
    wrapper: "bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50",
    badgeText: "text-green-600",
    cta: "bg-green-600 hover:bg-green-700 shadow-green-200",
    chip: "bg-white/80 text-slate-600",
    chipIcon: "text-green-500",
    blobA: "#A7F3D0",
    blobB: "#BAE6FD",
    iconColor: "#059669",
  },
};

function ShieldIllustration({ theme }) {
  return (
    <svg viewBox="0 0 220 210" className="w-full h-full">
      <circle cx="150" cy="70" r="70" fill={theme.blobA} opacity="0.55" />
      <circle cx="70" cy="150" r="55" fill={theme.blobB} opacity="0.5" />
      <g transform="translate(60 40)">
        <path d="M50 0 L95 16 V60 C95 92 74 112 50 120 C26 112 5 92 5 60 V16 Z" fill="white" stroke={theme.iconColor} strokeWidth="3" />
        <path d="M32 58 L45 72 L70 42" fill="none" stroke={theme.iconColor} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <g transform="translate(178 165)">
        <circle cx="0" cy="0" r="18" fill="white" stroke={theme.iconColor} strokeWidth="2" />
        <path d="M0 5.5 C-6 -1.5 -12 1.5 -12 -3.5 C-12 -9 -5.5 -10.5 0 -4.5 C5.5 -10.5 12 -9 12 -3.5 C12 1.5 6 -1.5 0 5.5 Z" fill={theme.iconColor} />
      </g>
      <circle cx="22" cy="30" r="4" fill={theme.iconColor} opacity="0.4" />
      <circle cx="198" cy="45" r="5" fill={theme.iconColor} opacity="0.3" />
      <circle cx="30" cy="190" r="4" fill={theme.iconColor} opacity="0.35" />
    </svg>
  );
}

function DeviceIllustration({ theme }) {
  return (
    <svg viewBox="0 0 220 210" className="w-full h-full">
      <circle cx="140" cy="60" r="65" fill={theme.blobA} opacity="0.55" />
      <circle cx="65" cy="150" r="50" fill={theme.blobB} opacity="0.5" />
      <g transform="translate(65 50)">
        <rect x="0" y="0" width="90" height="90" rx="14" fill="white" stroke={theme.iconColor} strokeWidth="3" />
        <circle cx="45" cy="40" r="26" fill="none" stroke={theme.iconColor} strokeWidth="3" />
        <circle cx="45" cy="40" r="14" fill={theme.iconColor} opacity="0.15" />
        <circle cx="45" cy="40" r="5" fill={theme.iconColor} />
        <rect x="30" y="76" width="30" height="4" rx="2" fill={theme.iconColor} opacity="0.5" />
      </g>
      <path d="M175 55 q10 15 0 30" fill="none" stroke={theme.iconColor} strokeWidth="3" strokeLinecap="round" />
      <path d="M188 48 q18 22 0 44" fill="none" stroke={theme.iconColor} strokeWidth="3" strokeLinecap="round" opacity="0.6" />
      <circle cx="30" cy="175" r="4" fill={theme.iconColor} opacity="0.4" />
      <circle cx="195" cy="150" r="5" fill={theme.iconColor} opacity="0.3" />
    </svg>
  );
}

function LoanIllustration({ theme }) {
  return (
    <svg viewBox="0 0 220 210" className="w-full h-full">
      <circle cx="145" cy="65" r="68" fill={theme.blobA} opacity="0.55" />
      <circle cx="65" cy="155" r="52" fill={theme.blobB} opacity="0.5" />
      <g transform="translate(55 90)">
        <ellipse cx="45" cy="46" rx="46" ry="14" fill="white" stroke={theme.iconColor} strokeWidth="3" />
        <ellipse cx="45" cy="30" rx="46" ry="14" fill="white" stroke={theme.iconColor} strokeWidth="3" />
        <ellipse cx="45" cy="14" rx="46" ry="14" fill="white" stroke={theme.iconColor} strokeWidth="3" />
        <text x="45" y="19" textAnchor="middle" fontSize="14" fontWeight="bold" fill={theme.iconColor}>₹</text>
      </g>
      <path d="M150 130 L170 100 L190 115 L205 70" fill="none" stroke={theme.iconColor} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M192 68 L205 70 L203 84" fill="none" stroke={theme.iconColor} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="25" cy="45" r="4" fill={theme.iconColor} opacity="0.4" />
      <circle cx="30" cy="180" r="4" fill={theme.iconColor} opacity="0.35" />
    </svg>
  );
}

const ILLUSTRATIONS = { shield: ShieldIllustration, device: DeviceIllustration, loan: LoanIllustration };
const AUTO_ROTATE_MS = 6000;

// Builds the final href for an external banner, appending merchant identity
// params when the admin has opted in (appendMerchantParams).
function buildExternalHref(banner, merchant) {
  if (!banner.appendMerchantParams) return banner.link;
  const sep = banner.link.includes("?") ? "&" : "?";
  return `${banner.link}${sep}merchant_id=${encodeURIComponent(merchant?.merchant_id || "")}&business_name=${encodeURIComponent(merchant?.business_name || "")}`;
}

export default function PromoBanner({ merchant }) {
  const [banners, setBanners] = useState(() => db.getActivePromoBanners());
  const [dismissedIds, setDismissedIds] = useState(() => new Set());
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [direction, setDirection] = useState(1);
  const timerRef = useRef(null);

  // Re-read banners on mount in case admin changed them since last load (no
  // live socket here — this is a localStorage-backed prototype).
  useEffect(() => {
    setBanners(db.getActivePromoBanners());
  }, []);

  const visibleBanners = banners.filter((b) => !dismissedIds.has(b.banner_id));
  const safeIndex = visibleBanners.length ? index % visibleBanners.length : 0;
  const banner = visibleBanners[safeIndex];
  const hasMultiple = visibleBanners.length > 1;

  useEffect(() => {
    if (!hasMultiple || paused) return;
    timerRef.current = setInterval(() => {
      setDirection(1);
      setIndex((i) => (i + 1) % visibleBanners.length);
    }, AUTO_ROTATE_MS);
    return () => clearInterval(timerRef.current);
  }, [hasMultiple, paused, visibleBanners.length]);

  if (!banner) return null;

  const theme = THEME[banner.theme] || THEME.blue;
  const Illustration = ILLUSTRATIONS[banner.illustration] || ShieldIllustration;

  const goPrev = () => {
    setDirection(-1);
    setIndex((i) => (i - 1 + visibleBanners.length) % visibleBanners.length);
  };
  const goNext = () => {
    setDirection(1);
    setIndex((i) => (i + 1) % visibleBanners.length);
  };
  const goTo = (i) => {
    setDirection(i > safeIndex ? 1 : -1);
    setIndex(i);
  };
  const dismiss = () => {
    setDismissedIds((prev) => new Set(prev).add(banner.banner_id));
    setIndex(0);
  };

  const CtaButton = ({ children, className }) =>
    banner.external ? (
      <a href={buildExternalHref(banner, merchant)} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </a>
    ) : (
      <RouterLink to={banner.link} className={className}>
        {children}
      </RouterLink>
    );

  return (
    <div
      className="relative rounded-2xl overflow-hidden mb-6 shadow-md ring-1 ring-black/5"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <button
        onClick={dismiss}
        className="absolute top-3.5 right-3.5 z-20 text-slate-500 hover:text-slate-700 bg-white/90 hover:bg-white rounded-full p-1.5 shadow-sm transition-colors"
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={banner.banner_id}
          initial={{ opacity: 0, x: direction * 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction * -24 }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
          className={`flex flex-col md:flex-row items-stretch min-h-[210px] ${theme.wrapper}`}
        >
          <div className="flex-1 px-7 py-7 flex flex-col justify-center">
            <div className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide mb-3 ${theme.badgeText}`}>
              <ShieldCheck size={15} />
              {banner.badge}
            </div>

            <h2 className="font-display font-extrabold text-2xl sm:text-[28px] text-slate-800 leading-[1.15]">
              {banner.headline.map((line, i) => (
                <span key={i} className="block">
                  {line}
                </span>
              ))}
            </h2>

            <p className="text-sm text-slate-500 mt-2.5 max-w-md leading-relaxed">{banner.subtitle}</p>

            <div className="flex flex-wrap gap-2 mt-4">
              {banner.categories.map((c) => {
                const Icon = CATEGORY_ICONS[c.icon] || ShieldCheck;
                return (
                  <span key={c.label} className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-full shadow-sm ${theme.chip}`}>
                    <Icon size={13} className={theme.chipIcon} />
                    {c.label}
                  </span>
                );
              })}
            </div>

            <CtaButton
              className={`inline-flex items-center gap-2 text-white text-sm font-semibold px-5 py-2.5 rounded-xl mt-5 w-fit shadow-lg transition-all hover:-translate-y-0.5 ${theme.cta}`}
            >
              {banner.ctaLabel} <ArrowRight size={14} />
            </CtaButton>
          </div>

          <div className="hidden sm:block w-48 md:w-60 shrink-0 pl-2 pr-6 py-6">
            <Illustration theme={theme} />
          </div>
        </motion.div>
      </AnimatePresence>

      {hasMultiple && (
        <>
          <button
            onClick={goPrev}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white rounded-full p-1.5 shadow-md text-slate-600 transition-transform hover:scale-105"
            aria-label="Previous"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={goNext}
            className="absolute right-11 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white rounded-full p-1.5 shadow-md text-slate-600 transition-transform hover:scale-105"
            aria-label="Next"
          >
            <ChevronRight size={16} />
          </button>

          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex gap-1.5">
            {visibleBanners.map((b, i) => (
              <button
                key={b.banner_id}
                onClick={() => goTo(i)}
                className="relative h-1.5 w-7 rounded-full bg-black/15 overflow-hidden"
                aria-label={`Go to slide ${i + 1}`}
              >
                {i === safeIndex && !paused && (
                  <motion.span
                    key={`${banner.banner_id}-progress`}
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: AUTO_ROTATE_MS / 1000, ease: "linear" }}
                    className="absolute inset-y-0 left-0 bg-slate-700 rounded-full"
                  />
                )}
                {i === safeIndex && paused && <span className="absolute inset-0 bg-slate-700 rounded-full" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}