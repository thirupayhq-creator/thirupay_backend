import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LogIn, Zap, X, KeyRound, CheckCircle2, ShieldCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../data/mockData";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [showForgot, setShowForgot] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    const res = login(form.email, form.password);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    navigate(res.session.role === "admin" ? "/admin" : "/merchant");
  };

  const fillDemo = () => {
    setForm({ email: "selvi@shop.com", password: "merchant123" });
  };

  return (
    <div className="min-h-screen bg-[#F6F7FB] flex items-center justify-center px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <img src="/brand/logo-full.png" alt="ThiruPay" className="h-20 w-auto mx-auto" />
          </Link>
          <p className="text-green-300 text-sm mt-1">QR & Link payments for every business</p>
        </div>

        <div className="card p-8">
          <h1 className="font-display font-bold text-xl text-green-700 mb-1">Welcome back</h1>
          <p className="text-sm text-green-300 mb-5">Login to your merchant account</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-green-500 mb-1.5">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@business.com"
                className="w-full px-4 py-2.5 rounded-lg border border-green-100 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-green-500 mb-1.5">Password</label>
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-lg border border-green-100 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none text-sm"
              />
              <button
                type="button"
                onClick={() => setShowForgot(true)}
                className="text-xs font-semibold text-green-600 hover:underline mt-1.5"
              >
                Forgot password?
              </button>
            </div>

            {error && <p className="text-rose-600 text-xs font-medium">{error}</p>}

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm"
            >
              <LogIn size={16} /> Login
            </button>
          </form>

          <div className="flex items-center gap-2 my-5">
            <div className="h-px bg-green-100 flex-1" />
            <span className="text-[11px] text-green-300 font-medium">DEMO ACCESS</span>
            <div className="h-px bg-green-100 flex-1" />
          </div>

          <button
            onClick={fillDemo}
            className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-lg border border-green-100 text-green-600 hover:bg-green-50 transition-colors"
          >
            <Zap size={13} /> Merchant demo
          </button>

          <p className="text-center text-sm text-green-400 mt-6">
            New merchant?{" "}
            <Link to="/register" className="text-green-600 font-semibold hover:underline">
              Create an account
            </Link>
          </p>

          <p className="text-center text-xs text-green-300 mt-3 flex items-center justify-center gap-1.5">
            <ShieldCheck size={13} />
            Admin?{" "}
            <Link to="/admin/login" className="text-green-600 font-semibold hover:underline">
              Login here
            </Link>
          </p>
        </div>
      </motion.div>

      <AnimatePresence>
        {showForgot && <ForgotPasswordModal onClose={() => setShowForgot(false)} />}
      </AnimatePresence>
    </div>
  );
}

function ForgotPasswordModal({ onClose }) {
  const { resetPassword } = useAuth();
  const [step, setStep] = useState("email"); // email | reset | done
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    setError("");
    const user = db.findUserByEmail(email);
    if (!user) {
      setError("No account found for this email. Please check and try again.");
      return;
    }
    setStep("reset");
  };

  const handleResetSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    const res = resetPassword(email, newPassword);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setStep("done");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-green-900/50 flex items-center justify-center z-50 px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-card w-full max-w-sm p-6"
      >
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-display font-bold text-lg text-green-700 flex items-center gap-2">
            <KeyRound size={18} className="text-green-500" /> Reset password
          </h3>
          <button onClick={onClose} className="text-green-300 hover:text-green-600">
            <X size={18} />
          </button>
        </div>

        {step === "email" && (
          <>
            <p className="text-xs text-green-300 mb-5">Enter your login email to reset your password.</p>
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-green-500 mb-1.5">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@business.com"
                  className="w-full px-4 py-2.5 rounded-lg border border-green-100 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none text-sm"
                />
              </div>
              {error && <p className="text-rose-600 text-xs font-medium">{error}</p>}
              <button
                type="submit"
                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
              >
                Continue
              </button>
            </form>
          </>
        )}

        {step === "reset" && (
          <>
            <p className="text-xs text-green-300 mb-5">Set a new password for <span className="font-semibold text-green-500">{email}</span></p>
            <form onSubmit={handleResetSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-green-500 mb-1.5">New password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-lg border border-green-100 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-green-500 mb-1.5">Confirm password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-lg border border-green-100 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none text-sm"
                />
              </div>
              {error && <p className="text-rose-600 text-xs font-medium">{error}</p>}
              <button
                type="submit"
                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
              >
                Update password
              </button>
            </form>
          </>
        )}

        {step === "done" && (
          <div className="text-center py-4">
            <CheckCircle2 size={40} className="text-emerald-500 mx-auto mb-3" />
            <p className="text-sm font-semibold text-green-700 mb-1">Password reset successful!</p>
            <p className="text-xs text-green-300 mb-5">You can now log in with your new password.</p>
            <button
              onClick={onClose}
              className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
            >
              Back to login
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}