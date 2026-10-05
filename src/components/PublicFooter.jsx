import { Link } from "react-router-dom";

export default function PublicFooter() {
  return (
    <footer className="border-t border-green-100 bg-white">
      <div className="max-w-6xl mx-auto px-6 py-14 grid grid-cols-2 sm:grid-cols-4 gap-8">
        <div className="col-span-2 sm:col-span-1">
          <img src="/brand/logo-full.png" alt="ThiruPay" className="h-11 w-auto mb-3" />
          <p className="text-xs text-green-600 leading-relaxed max-w-[200px]">
            QR and payment-link collections for small businesses across Tamil Nadu.
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-3">Product</p>
          <ul className="space-y-2 text-xs text-green-600">
            <li><Link to="/product" className="hover:text-green-800">Features</Link></li>
            <li><Link to="/download" className="hover:text-green-800">Get the App</Link></li>
            <li><Link to="/register" className="hover:text-green-800">Get started</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-3">Support</p>
          <ul className="space-y-2 text-xs text-green-600">
            <li><Link to="/contact" className="hover:text-green-800">Contact us</Link></li>
            <li><Link to="/contact#faq" className="hover:text-green-800">FAQ</Link></li>
            <li><Link to="/login" className="hover:text-green-800">Login</Link></li>
            <li><Link to="/terms-and-conditions" className="hover:text-green-800">Terms & Conditions</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-3">Company</p>
          <ul className="space-y-2 text-xs text-green-600">
            <li><Link to="/about" className="hover:text-green-800">About us</Link></li>
            <li>Chennai, Tamil Nadu</li>
            <li>support@thirupay.com</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-green-100">
        <div className="max-w-6xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-green-600">© 2026 ThiruPay. Built for Indian small businesses.</p>
          <p className="text-[11px] text-green-500">Demo prototype — not a licensed payment aggregator.</p>
        </div>
      </div>
    </footer>
  );
}