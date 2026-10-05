import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LogIn, ShieldCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function AdminLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    const res = login(form.email, form.password);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    if (res.session.role !== "admin") {
      setError("This login is for admin accounts only.");
      return;
    }
    navigate("/admin");
  };

  return (
    <div className="min-h-screen bg-[#0B1220] flex items-center justify-center px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <img src="/brand/logo-full.png" alt="ThiruPay" className="h-16 w-auto mx-auto brightness-0 invert" />
          </Link>
          <p className="text-slate-400 text-sm mt-1">Admin Console</p>
        </div>

        <div className="bg-white rounded-2xl shadow-card p-8">
          <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center mb-4">
            <ShieldCheck size={20} />
          </div>
          <h1 className="font-display font-bold text-xl text-slate-800 mb-1">Admin Login</h1>
          <p className="text-sm text-slate-400 mb-5">Authorized personnel only.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Email</label>
              <input
                type="email"
                required
                autoFocus
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="admin@thirupay.in"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-slate-500 focus:ring-2 focus:ring-slate-100 outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Password</label>
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-slate-500 focus:ring-2 focus:ring-slate-100 outline-none text-sm"
              />
            </div>

            {error && <p className="text-rose-600 text-xs font-medium">{error}</p>}

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm"
            >
              <LogIn size={16} /> Login to Admin Console
            </button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-6">
            Not an admin?{" "}
            <Link to="/login" className="text-slate-700 font-semibold hover:underline">
              Merchant login
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}