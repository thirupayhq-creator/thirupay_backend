import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { to: "/product", label: "Product" },
  { to: "/download", label: "Get the App" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-green-100">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="shrink-0">
          <img src="/brand/logo-full.png" alt="ThiruPay" className="h-14 w-auto" />
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-green-500">
          {NAV_LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) => `transition-colors hover:text-green-700 ${isActive ? "text-green-700 font-semibold" : ""}`}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Link to="/login" className="text-sm font-semibold text-green-600 hover:text-green-800 px-3 py-2">
            Login
          </Link>
          <Link to="/register" className="bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
            Get Started
          </Link>
        </div>

        <button className="md:hidden text-green-600" onClick={() => setMenuOpen((o) => !o)} aria-label="Toggle menu">
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-green-100 px-6 py-4 flex flex-col gap-3 bg-white">
          {NAV_LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} onClick={() => setMenuOpen(false)} className="text-sm font-medium text-green-600">
              {l.label}
            </NavLink>
          ))}
          <Link to="/login" onClick={() => setMenuOpen(false)} className="text-sm font-semibold text-green-600">
            Login
          </Link>
          <Link to="/register" onClick={() => setMenuOpen(false)} className="bg-green-500 text-white text-sm font-semibold px-4 py-2 rounded-lg text-center">
            Get Started
          </Link>
        </div>
      )}
    </header>
  );
}
