// src/components/auth/AuthForm.jsx — White/Black/Blue High-Visibility
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, ArrowLeft, CheckCircle, ShieldAlert, Clock } from "lucide-react";
import { signIn, signUp } from "../../services/authService";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth, db } from "../../services/firebase";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import toast from "react-hot-toast";

const MAX_ATTEMPTS = 5;
const BLOCK_DURATION_MS = 36 * 60 * 60 * 1000; // 36 hours

// ── Helper: format remaining time ────────────────────────────
const formatTimeLeft = (ms) => {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
};

// ── Firestore: get login attempt doc ─────────────────────────
const getAttemptDoc = async (email) => {
  const key = email.toLowerCase().replace(/[^a-z0-9]/g, "_");
  const ref = doc(db, "loginAttempts", key);
  const snap = await getDoc(ref);
  return { ref, data: snap.exists() ? snap.data() : null };
};

const AuthForm = ({ mode = "login" }) => {
  const isLogin = mode === "login";
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "", username: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // ── Attempt tracking state ────────────────────────────────
  const [attemptsLeft, setAttemptsLeft] = useState(MAX_ATTEMPTS);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showAttemptWarning, setShowAttemptWarning] = useState(false);

  // Forgot password states
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotError, setForgotError] = useState("");

  // ── Countdown timer for lockout ───────────────────────────
  useEffect(() => {
    if (!isLockedOut || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1000) {
          setIsLockedOut(false);
          setAttemptsLeft(MAX_ATTEMPTS);
          setShowAttemptWarning(false);
          clearInterval(interval);
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isLockedOut, timeLeft]);

  // ── Check lockout on email change ────────────────────────
  useEffect(() => {
    if (!isLogin || !formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      setIsLockedOut(false);
      setAttemptsLeft(MAX_ATTEMPTS);
      setShowAttemptWarning(false);
      return;
    }

    const checkLockout = async () => {
      try {
        const { data } = await getAttemptDoc(formData.email);
        if (!data) { setAttemptsLeft(MAX_ATTEMPTS); setIsLockedOut(false); return; }

        if (data.lockedUntil) {
          const lockedUntil = data.lockedUntil.toMillis?.() || data.lockedUntil;
          const remaining = lockedUntil - Date.now();
          if (remaining > 0) {
            setIsLockedOut(true);
            setTimeLeft(remaining);
            return;
          }
        }
        const attempts = data.attempts || 0;
        const left = Math.max(MAX_ATTEMPTS - attempts, 0);
        setAttemptsLeft(left);
        setShowAttemptWarning(left < MAX_ATTEMPTS && left > 0);
        setIsLockedOut(false);
      } catch (e) {
        // silent
      }
    };

    const timeout = setTimeout(checkLockout, 600);
    return () => clearTimeout(timeout);
  }, [formData.email, isLogin]);

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

  // ── Record failed attempt ─────────────────────────────────
  const recordFailedAttempt = async (email) => {
    const { ref, data } = await getAttemptDoc(email);
    const currentAttempts = (data?.attempts || 0) + 1;

    if (currentAttempts >= MAX_ATTEMPTS) {
      // Lock karo 36 hours ke liye
      const lockedUntil = Date.now() + BLOCK_DURATION_MS;
      await setDoc(ref, {
        attempts: currentAttempts,
        lockedUntil,
        lastAttempt: Date.now(),
      });
      setIsLockedOut(true);
      setTimeLeft(BLOCK_DURATION_MS);
      setAttemptsLeft(0);
      toast.error("Account locked for 36 hours due to too many failed attempts! 🔒");
    } else {
      await setDoc(ref, {
        attempts: currentAttempts,
        lockedUntil: null,
        lastAttempt: Date.now(),
      });
      const left = MAX_ATTEMPTS - currentAttempts;
      setAttemptsLeft(left);
      setShowAttemptWarning(true);
    }
  };

  // ── Clear attempts on success ─────────────────────────────
  const clearAttempts = async (email) => {
    try {
      const { ref } = await getAttemptDoc(email);
      await setDoc(ref, { attempts: 0, lockedUntil: null, lastAttempt: null });
    } catch (e) { /* silent */ }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    if (isLockedOut) return;

    setLoading(true);
    try {
      const result = isLogin
        ? await signIn(formData.email, formData.password)
        : await signUp(formData.email, formData.password, formData.username);

      if (result.success) {
        if (isLogin) await clearAttempts(formData.email);
        toast.success(isLogin ? "Welcome back! 👋" : "Account created! 🎉");
        navigate("/dashboard");
      } else {
        let errorMsg = result.error;
        if (errorMsg.includes("user-not-found")) errorMsg = "No account with this email.";
        if (errorMsg.includes("wrong-password") || errorMsg.includes("invalid-credential")) {
          if (isLogin) await recordFailedAttempt(formData.email);
          errorMsg = "Wrong password.";
        }
        if (errorMsg.includes("email-already-in-use")) errorMsg = "This email is already registered.";
        if (errorMsg.includes("weak-password")) errorMsg = "Choose a stronger password.";
        if (!isLockedOut) toast.error(errorMsg);
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

  // ── Forgot Password UI (restyled to white/black/blue) ──
  if (showForgot) {
    return (
      <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <button
          onClick={() => { setShowForgot(false); setForgotSent(false); setForgotEmail(""); setForgotError(""); }}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 mb-6 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Sign in
        </button>

        {forgotSent ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Email Sent!</h2>
            <p className="text-sm text-gray-600 mb-2">Password reset link sent to:</p>
            <p className="text-sm font-mono text-gray-700 bg-gray-100 px-3 py-1 rounded inline-block mb-4">{forgotEmail}</p>
            <p className="text-xs text-gray-500 mb-6">
              Check your inbox and click the link to reset your password. Link expires in 1 hour.
            </p>
            <button
              onClick={() => { setShowForgot(false); setForgotSent(false); setForgotEmail(""); }}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors text-sm"
            >
              Back to Sign In
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Forgot Password?</h1>
              <p className="text-sm text-gray-500">Enter your email — we'll send a reset link instantly.</p>
            </div>
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <div>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => { setForgotEmail(e.target.value); setForgotError(""); }}
                    placeholder="Your email address"
                    autoFocus
                    className={`w-full bg-white border border-gray-300 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all ${forgotError ? "border-red-400 focus:border-red-500" : ""}`}
                  />
                </div>
                {forgotError && (
                  <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
                    <AlertCircle size={12} /> {forgotError}
                  </p>
                )}
              </div>
              <button
                type="submit"
                disabled={forgotLoading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all disabled:opacity-60 text-sm"
              >
                {forgotLoading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
          </>
        )}
      </div>
    );
  }

  // ── Normal Login/Signup UI (white background, black text, blue accents) ──
  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          {isLogin ? "Welcome back" : "Create your account"}
        </h1>
        <p className="text-sm text-gray-500">
          {isLogin ? "Sign in to access your notes and dashboard." : "Join thousands of students sharing knowledge."}
        </p>
      </div>

      {/* ── Lockout Banner (red for danger, but high contrast) ── */}
      {isLockedOut && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <ShieldAlert size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-700 mb-0.5">Account Temporarily Locked 🔒</p>
            <p className="text-xs text-red-600">Too many failed attempts. Try again in:</p>
            <p className="text-lg font-mono font-bold text-red-700 mt-1 flex items-center gap-1">
              <Clock size={16} /> {formatTimeLeft(timeLeft)}
            </p>
          </div>
        </div>
      )}

      {/* ── Attempt Warning (amber/yellow) ── */}
      {!isLockedOut && showAttemptWarning && attemptsLeft > 0 && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2">
          <AlertCircle size={15} className="text-amber-600 flex-shrink-0" />
          <p className="text-xs text-amber-700">
            <span className="font-bold">{attemptsLeft} attempt{attemptsLeft !== 1 ? "s" : ""} left</span>
            {" "}before your account is locked for 36 hours.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <div>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                placeholder="Username"
                autoComplete="username"
                className={`w-full bg-white border border-gray-300 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all ${errors.username ? "border-red-400 focus:border-red-500" : ""}`}
              />
            </div>
            {errors.username && <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1"><AlertCircle size={12} /> {errors.username}</p>}
          </div>
        )}

        <div>
          <div className="relative">
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email address"
              autoComplete="email"
              disabled={isLockedOut}
              className={`w-full bg-white border border-gray-300 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed ${errors.email ? "border-red-400 focus:border-red-500" : ""}`}
            />
          </div>
          {errors.email && <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1"><AlertCircle size={12} /> {errors.email}</p>}
        </div>

        <div>
          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              autoComplete={isLogin ? "current-password" : "new-password"}
              disabled={isLockedOut}
              className={`w-full bg-white border border-gray-300 rounded-xl pl-10 pr-10 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all disabled:bg-gray-100 ${errors.password ? "border-red-400 focus:border-red-500" : ""}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1"><AlertCircle size={12} /> {errors.password}</p>}
        </div>

        {!isLogin && (
          <div>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm password"
                autoComplete="new-password"
                className={`w-full bg-white border border-gray-300 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all ${errors.confirmPassword ? "border-red-400 focus:border-red-500" : ""}`}
              />
            </div>
            {errors.confirmPassword && <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1"><AlertCircle size={12} /> {errors.confirmPassword}</p>}
          </div>
        )}

        {isLogin && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setShowForgot(true)}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              Forgot password?
            </button>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || isLockedOut}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2 text-sm"
        >
          {loading
            ? isLogin ? "Signing in..." : "Creating account..."
            : isLockedOut ? "Account Locked 🔒"
            : isLogin ? "Sign in" : "Create account"}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <Link to={isLogin ? "/signup" : "/login"} className="text-blue-600 hover:text-blue-700 font-medium">
          {isLogin ? "Sign up" : "Sign in"}
        </Link>
      </p>
    </div>
  );
};

export default AuthForm;