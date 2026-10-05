import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, X, ChevronDown, ArrowRight } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { NAV_PRODUCT_GROUPS } from "../data/landingContent";

const NAV_LINKS = [
  { to: "/", label: "Home", end: true },
  { to: "/about", label: "About" },
  { to: "/investment-partnership", label: "Investment & Partnership" },
  { to: "/download", label: "Get the App" },
  { to: "/contact", label: "Contact" },
];

export default function PublicNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [productOpen, setProductOpen] = useState(false);
  const [mobileProductOpen, setMobileProductOpen] = useState(false);
  const closeTimer = useRef(null);
  const navigate = useNavigate();

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  const openProduct = () => {
    clearTimeout(closeTimer.current);
    setProductOpen(true);
  };
  const scheduleCloseProduct = () => {
    closeTimer.current = setTimeout(() => setProductOpen(false), 150);
  };

  const goTo = (to) => {
    setProductOpen(false);
    setMenuOpen(false);
    if (to.includes("#")) {
      const [path, hash] = to.split("#");
      navigate(path);
      setTimeout(() => document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" }), 80);
    } else {
      navigate(to);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-green-100">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/">
          <img src="/brand/logo-full.png" alt="ThiruPay" className="h-14 w-auto" />
        </Link>

        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-green-600">
          <NavLink to="/" end className={({ isActive }) => `transition-colors ${isActive ? "text-green-800 font-semibold" : "hover:text-green-800"}`}>
            Home
          </NavLink>

          {/* Product mega-menu */}
          <div className="relative" onMouseEnter={openProduct} onMouseLeave={scheduleCloseProduct}>
            <button
              onClick={() => setProductOpen((o) => !o)}
              className={`flex items-center gap-1 transition-colors ${productOpen ? "text-green-800 font-semibold" : "hover:text-green-800"}`}
            >
              Product <ChevronDown size={14} className={`transition-transform ${productOpen ? "rotate-180" : ""}`} />
            </button>

            {productOpen && (
              <div className="absolute left-1/2 -translate-x-1/2 top-full pt-3 w-[520px]">
                <div className="bg-white rounded-2xl shadow-2xl border border-green-100 p-6 grid grid-cols-2 gap-6">
                  {NAV_PRODUCT_GROUPS.map((group) => (
                    <div key={group.title}>
                      <p className="text-[11px] font-semibold text-green-400 uppercase tracking-wide mb-3">{group.title}</p>
                      <div className="space-y-1">
                        {group.items.map((item) => (
                          <button
                            key={item.name}
                            onClick={() => goTo(item.to)}
                            className="w-full flex items-start gap-3 text-left px-2.5 py-2 rounded-lg hover:bg-green-50 transition-colors"
                          >
                            <div className="w-8 h-8 rounded-lg bg-green-50 text-green-700 flex items-center justify-center shrink-0 mt-0.5">
                              <item.icon size={15} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-green-800 leading-tight">{item.name}</p>
                              <p className="text-xs text-green-500 leading-tight mt-0.5">{item.desc}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => goTo("/product")}
                    className="col-span-2 flex items-center justify-between border-t border-green-100 pt-4 text-sm font-semibold text-green-700 hover:text-green-800"
                  >
                    See the full product page <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {NAV_LINKS.filter((l) => l.to !== "/").map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) => `transition-colors ${isActive ? "text-green-800 font-semibold" : "hover:text-green-800"}`}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Link to="/login" className="text-sm font-semibold text-green-700 hover:text-green-900 px-3 py-2">
            Login
          </Link>
          <Link to="/register" className="bg-brand shadow-brand hover:opacity-95 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-opacity">
            Get Started
          </Link>
        </div>

        <button className="md:hidden text-green-700" onClick={() => setMenuOpen((o) => !o)}>
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-green-100 px-6 py-4 flex flex-col gap-1 bg-white max-h-[75vh] overflow-y-auto">
          <NavLink to="/" end onClick={() => setMenuOpen(false)} className={({ isActive }) => `py-2 text-sm font-medium ${isActive ? "text-green-800 font-semibold" : "text-green-600"}`}>
            Home
          </NavLink>

          <button
            onClick={() => setMobileProductOpen((o) => !o)}
            className="flex items-center justify-between py-2 text-sm font-medium text-green-600"
          >
            Product <ChevronDown size={14} className={`transition-transform ${mobileProductOpen ? "rotate-180" : ""}`} />
          </button>
          {mobileProductOpen && (
            <div className="pl-3 pb-2 space-y-3">
              {NAV_PRODUCT_GROUPS.map((group) => (
                <div key={group.title}>
                  <p className="text-[10px] font-semibold text-green-300 uppercase tracking-wide mb-1.5">{group.title}</p>
                  {group.items.map((item) => (
                    <button key={item.name} onClick={() => goTo(item.to)} className="flex items-center gap-2 py-1.5 text-sm text-green-700">
                      <item.icon size={14} className="text-green-500 shrink-0" /> {item.name}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          )}

          {NAV_LINKS.filter((l) => l.to !== "/").map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) => `py-2 text-sm font-medium ${isActive ? "text-green-800 font-semibold" : "text-green-600"}`}
            >
              {l.label}
            </NavLink>
          ))}
          <Link to="/login" onClick={() => setMenuOpen(false)} className="py-2 text-sm font-semibold text-green-700">
            Login
          </Link>
          <Link to="/register" onClick={() => setMenuOpen(false)} className="mt-2 bg-brand shadow-brand text-white text-sm font-semibold px-4 py-2.5 rounded-xl text-center">
            Get Started
          </Link>
        </div>
      )}
    </header>
  );
}
