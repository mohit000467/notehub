// src/components/auth/AuthForm.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, ArrowLeft, CheckCircle } from "lucide-react";
import { signIn, signUp } from "../../services/authService";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../services/firebase";
import toast from "react-hot-toast";

const AuthForm = ({ mode = "login" }) => {
  const isLogin = mode === "login";
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "", username: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Forgot password states
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotError, setForgotError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Enter a valid email";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";
    if (!isLogin) {
      if (!formData.username.trim()) newErrors.username = "Username is required";
      if (formData.username.trim().length < 3) newErrors.username = "Username must be at least 3 characters";
      if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords don't match";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const result = isLogin
        ? await signIn(formData.email, formData.password)
        : await signUp(formData.email, formData.password, formData.username);
      if (result.success) {
        toast.success(isLogin ? "Welcome back! 👋" : "Account created! 🎉");
        navigate("/dashboard");
      } else {
        let errorMsg = result.error;
        if (errorMsg.includes("user-not-found")) errorMsg = "No account with this email.";
        if (errorMsg.includes("wrong-password")) errorMsg = "Wrong password.";
        if (errorMsg.includes("email-already-in-use")) errorMsg = "This email is already registered.";
        if (errorMsg.includes("weak-password")) errorMsg = "Choose a stronger password.";
        toast.error(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Forgot Password Handler ───────────────────────────────
  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (!forgotEmail || !/\S+@\S+\.\S+/.test(forgotEmail)) {
      setForgotError("Enter a valid email address");
      return;
    }
    setForgotLoading(true);
    setForgotError("");
    try {
      await sendPasswordResetEmail(auth, forgotEmail);
      setForgotSent(true);
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        setForgotError("No account found with this email.");
      } else {
        setForgotError("Something went wrong. Try again.");
      }
    } finally {
      setForgotLoading(false);
    }
  };

  // ── Forgot Password UI ────────────────────────────────────
  if (showForgot) {
    return (
      <div className="w-full max-w-md">
        <button onClick={() => { setShowForgot(false); setForgotSent(false); setForgotEmail(""); setForgotError(""); }}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-white mb-8 transition-colors">
          <ArrowLeft size={16} /> Back to Sign in
        </button>

        {forgotSent ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-accent-green/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-accent-green" />
            </div>
            <h2 className="text-xl font-display font-bold text-white mb-2">Email Sent!</h2>
            <p className="text-sm text-gray-500 mb-2">
              Password reset link sent to:
            </p>
            <p className="text-sm font-mono text-ink-300 mb-6">{forgotEmail}</p>
            <p className="text-xs text-gray-600 mb-6">
              Check your inbox and click the link to reset your password. Link expires in 1 hour.
            </p>
            <button onClick={() => { setShowForgot(false); setForgotSent(false); setForgotEmail(""); }}
              className="w-full py-3 bg-ink-500 hover:bg-ink-400 text-white font-semibold rounded-xl transition-colors text-sm">
              Back to Sign In
            </button>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-2xl font-display font-bold text-white mb-1">Forgot Password?</h1>
              <p className="text-sm text-gray-500">
                Enter your email — we'll send a reset link instantly.
              </p>
            </div>

            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <div>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" />
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => { setForgotEmail(e.target.value); setForgotError(""); }}
                    placeholder="Your email address"
                    autoFocus
                    className={`w-full bg-surface-elevated border rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-ink-500 focus:ring-1 focus:ring-ink-500/30 transition-all ${
                      forgotError ? "border-red-400/50" : "border-surface-border"
                    }`}
                  />
                </div>
                {forgotError && (
                  <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                    <AlertCircle size={12} /> {forgotError}
                  </p>
                )}
              </div>

              <button type="submit" disabled={forgotLoading}
                className="w-full py-3 bg-ink-500 hover:bg-ink-400 text-white font-semibold rounded-xl transition-all disabled:opacity-60 text-sm">
                {forgotLoading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
          </>
        )}
      </div>
    );
  }

  // ── Normal Login/Signup UI ────────────────────────────────
  return (
    <div className="w-full max-w-md">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-white mb-1">
          {isLogin ? "Welcome back" : "Create your account"}
        </h1>
        <p className="text-sm text-gray-500">
          {isLogin ? "Sign in to access your notes and dashboard." : "Join thousands of students sharing knowledge."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <div>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" />
              <input name="username" type="text" value={formData.username} onChange={handleChange}
                placeholder="Username" autoComplete="username"
                className={`w-full bg-surface-elevated border rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-ink-500 focus:ring-1 focus:ring-ink-500/30 transition-all ${errors.username ? "border-red-400/50" : "border-surface-border"}`} />
            </div>
            {errors.username && <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1"><AlertCircle size={12} /> {errors.username}</p>}
          </div>
        )}

        <div>
          <div className="relative">
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" />
            <input name="email" type="email" value={formData.email} onChange={handleChange}
              placeholder="Email address" autoComplete="email"
              className={`w-full bg-surface-elevated border rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-ink-500 focus:ring-1 focus:ring-ink-500/30 transition-all ${errors.email ? "border-red-400/50" : "border-surface-border"}`} />
          </div>
          {errors.email && <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1"><AlertCircle size={12} /> {errors.email}</p>}
        </div>

        <div>
          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" />
            <input name="password" type={showPassword ? "text" : "password"} value={formData.password}
              onChange={handleChange} placeholder="Password"
              autoComplete={isLogin ? "current-password" : "new-password"}
              className={`w-full bg-surface-elevated border rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-ink-500 focus:ring-1 focus:ring-ink-500/30 transition-all ${errors.password ? "border-red-400/50" : "border-surface-border"}`} />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400">
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1"><AlertCircle size={12} /> {errors.password}</p>}
        </div>

        {!isLogin && (
          <div>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" />
              <input name="confirmPassword" type={showPassword ? "text" : "password"}
                value={formData.confirmPassword} onChange={handleChange}
                placeholder="Confirm password" autoComplete="new-password"
                className={`w-full bg-surface-elevated border rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-ink-500 focus:ring-1 focus:ring-ink-500/30 transition-all ${errors.confirmPassword ? "border-red-400/50" : "border-surface-border"}`} />
            </div>
            {errors.confirmPassword && <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1"><AlertCircle size={12} /> {errors.confirmPassword}</p>}
          </div>
        )}

        {/* Forgot password link — only on login */}
        {isLogin && (
          <div className="flex justify-end">
            <button type="button" onClick={() => setShowForgot(true)}
              className="text-xs text-gray-500 hover:text-ink-400 transition-colors">
              Forgot password?
            </button>
          </div>
        )}

        <button type="submit" disabled={loading}
          className="w-full py-3 bg-ink-500 hover:bg-ink-400 text-white font-semibold rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2 text-sm">
          {loading
            ? isLogin ? "Signing in..." : "Creating account..."
            : isLogin ? "Sign in" : "Create account"}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <Link to={isLogin ? "/signup" : "/login"} className="text-ink-400 hover:text-ink-300 font-medium">
          {isLogin ? "Sign up" : "Sign in"}
        </Link>
      </p>
    </div>
  );
};

export default AuthForm;