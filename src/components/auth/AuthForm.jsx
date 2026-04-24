// src/components/auth/AuthForm.jsx — NoteHub Premium: White · Black · Blue
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye, EyeOff, Mail, Lock, User, AlertCircle,
  ArrowLeft, CheckCircle, ShieldAlert, Clock, ArrowRight,
} from "lucide-react";
import { signIn, signUp } from "../../services/authService";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth, db } from "../../services/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import toast from "react-hot-toast";

const MAX_ATTEMPTS = 5;
const BLOCK_DURATION_MS = 36 * 60 * 60 * 1000;

const formatTimeLeft = (ms) => {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${m}m ${sec}s`;
  if (m > 0) return `${m}m ${sec}s`;
  return `${sec}s`;
};

const getAttemptDoc = async (email) => {
  const key = email.toLowerCase().replace(/[^a-z0-9]/g, "_");
  const ref = doc(db, "loginAttempts", key);
  const snap = await getDoc(ref);
  return { ref, data: snap.exists() ? snap.data() : null };
};

// ── Input Field Component ─────────────────────────────────
const InputField = ({ icon: Icon, label, error, rightElement, ...props }) => (
  <div>
    {label && (
      <label className="block text-xs font-semibold mb-1.5"
        style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
        {label}
      </label>
    )}
    <div className="relative">
      <Icon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{ color: error ? "#f87171" : "var(--text-muted)" }} />
      <input
        {...props}
        className={`w-full rounded-xl pl-10 pr-${rightElement ? "10" : "4"} py-3 text-sm transition-all`}
        style={{
          background: error ? "rgba(239,68,68,0.05)" : "rgba(255,255,255,0.04)",
          border: `1px solid ${error ? "rgba(239,68,68,0.4)" : "rgba(255,255,255,0.08)"}`,
          color: "var(--text-primary)",
          fontFamily: "var(--font-body)",
          outline: "none",
        }}
        onFocus={e => {
          e.target.style.background = "rgba(26,109,255,0.06)";
          e.target.style.borderColor = "rgba(26,109,255,0.4)";
          e.target.style.boxShadow = "0 0 0 3px rgba(26,109,255,0.1)";
        }}
        onBlur={e => {
          e.target.style.background = error ? "rgba(239,68,68,0.05)" : "rgba(255,255,255,0.04)";
          e.target.style.borderColor = error ? "rgba(239,68,68,0.4)" : "rgba(255,255,255,0.08)";
          e.target.style.boxShadow = "none";
        }}
      />
      {rightElement && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightElement}</div>
      )}
    </div>
    {error && (
      <p className="flex items-center gap-1.5 mt-1.5 text-xs" style={{ color: "#f87171" }}>
        <AlertCircle size={11} /> {error}
      </p>
    )}
  </div>
);

const AuthForm = ({ mode = "login" }) => {
  const isLogin = mode === "login";
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "", username: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [attemptsLeft, setAttemptsLeft] = useState(MAX_ATTEMPTS);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showAttemptWarning, setShowAttemptWarning] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotError, setForgotError] = useState("");

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

  useEffect(() => {
    if (!isLogin || !formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      setIsLockedOut(false); setAttemptsLeft(MAX_ATTEMPTS); setShowAttemptWarning(false); return;
    }
    const check = async () => {
      try {
        const { data } = await getAttemptDoc(formData.email);
        if (!data) { setAttemptsLeft(MAX_ATTEMPTS); setIsLockedOut(false); return; }
        if (data.lockedUntil) {
          const lu = data.lockedUntil.toMillis?.() || data.lockedUntil;
          const remaining = lu - Date.now();
          if (remaining > 0) { setIsLockedOut(true); setTimeLeft(remaining); return; }
        }
        const left = Math.max(MAX_ATTEMPTS - (data.attempts || 0), 0);
        setAttemptsLeft(left);
        setShowAttemptWarning(left < MAX_ATTEMPTS && left > 0);
        setIsLockedOut(false);
      } catch {}
    };
    const t = setTimeout(check, 600);
    return () => clearTimeout(t);
  }, [formData.email, isLogin]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!formData.email) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) e.email = "Enter a valid email";
    if (!formData.password) e.password = "Password is required";
    else if (formData.password.length < 6) e.password = "Min 6 characters";
    if (!isLogin) {
      if (!formData.username.trim()) e.username = "Username is required";
      else if (formData.username.trim().length < 3) e.username = "Min 3 characters";
      if (formData.password !== formData.confirmPassword) e.confirmPassword = "Passwords don't match";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const recordFailedAttempt = async (email) => {
    const { ref, data } = await getAttemptDoc(email);
    const current = (data?.attempts || 0) + 1;
    if (current >= MAX_ATTEMPTS) {
      const lockedUntil = Date.now() + BLOCK_DURATION_MS;
      await setDoc(ref, { attempts: current, lockedUntil, lastAttempt: Date.now() });
      setIsLockedOut(true); setTimeLeft(BLOCK_DURATION_MS); setAttemptsLeft(0);
      toast.error("Account locked for 36 hours 🔒");
    } else {
      await setDoc(ref, { attempts: current, lockedUntil: null, lastAttempt: Date.now() });
      setAttemptsLeft(MAX_ATTEMPTS - current);
      setShowAttemptWarning(true);
    }
  };

  const clearAttempts = async (email) => {
    try {
      const { ref } = await getAttemptDoc(email);
      await setDoc(ref, { attempts: 0, lockedUntil: null, lastAttempt: null });
    } catch {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate() || isLockedOut) return;
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
        let msg = result.error;
        if (msg.includes("user-not-found")) msg = "No account with this email.";
        if (msg.includes("wrong-password") || msg.includes("invalid-credential")) {
          if (isLogin) await recordFailedAttempt(formData.email);
          msg = "Incorrect password.";
        }
        if (msg.includes("email-already-in-use")) msg = "Email already registered.";
        if (msg.includes("weak-password")) msg = "Choose a stronger password.";
        if (!isLockedOut) toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (!forgotEmail || !/\S+@\S+\.\S+/.test(forgotEmail)) {
      setForgotError("Enter a valid email"); return;
    }
    setForgotLoading(true); setForgotError("");
    try {
      await sendPasswordResetEmail(auth, forgotEmail);
      setForgotSent(true);
    } catch (err) {
      setForgotError(err.code === "auth/user-not-found" ? "No account with this email." : "Something went wrong.");
    } finally { setForgotLoading(false); }
  };

  // ── Forgot Password UI ────────────────────────────────────
  if (showForgot) {
    return (
      <div className="w-full">
        <button onClick={() => { setShowForgot(false); setForgotSent(false); setForgotEmail(""); setForgotError(""); }}
          className="flex items-center gap-2 text-sm mb-8 transition-colors"
          style={{ color: "var(--text-muted)" }}
          onMouseEnter={e => e.currentTarget.style.color = "white"}
          onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}>
          <ArrowLeft size={15} /> Back to Sign In
        </button>

        {forgotSent ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
              style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)" }}>
              <CheckCircle size={30} style={{ color: "#4ade80" }} />
            </div>
            <h2 className="text-xl font-bold text-white mb-2" style={{ fontFamily: "var(--font-display)" }}>Email Sent!</h2>
            <p className="text-sm mb-1" style={{ color: "var(--text-muted)" }}>Reset link sent to:</p>
            <p className="text-sm font-mono mb-4" style={{ color: "#6aaeff" }}>{forgotEmail}</p>
            <p className="text-xs mb-6" style={{ color: "var(--text-dim)" }}>Link expires in 1 hour.</p>
            <button onClick={() => { setShowForgot(false); setForgotSent(false); setForgotEmail(""); }}
              className="btn-primary w-full py-3 rounded-xl text-sm">
              Back to Sign In
            </button>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "var(--font-display)" }}>Forgot Password?</h1>
            <p className="text-sm mb-8" style={{ color: "var(--text-muted)" }}>We'll send a reset link to your email instantly.</p>
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <InputField
                icon={Mail} label="Email Address" type="email"
                value={forgotEmail} onChange={(e) => { setForgotEmail(e.target.value); setForgotError(""); }}
                placeholder="you@university.edu" autoFocus error={forgotError}
              />
              <button type="submit" disabled={forgotLoading}
                className="btn-primary w-full py-3 rounded-xl text-sm flex items-center justify-center gap-2">
                {forgotLoading ? "Sending..." : <><span>Send Reset Link</span> <ArrowRight size={15} /></>}
              </button>
            </form>
          </>
        )}
      </div>
    );
  }

  // ── Main Form ─────────────────────────────────────────────
  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-white mb-1.5" style={{ fontFamily: "var(--font-display)" }}>
          {isLogin ? "Welcome back" : "Create account"}
        </h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          {isLogin
            ? "Sign in to access your notes and dashboard."
            : "Join students sharing academic knowledge."}
        </p>
      </div>

      {/* Lockout Banner */}
      {isLockedOut && (
        <div className="mb-5 p-4 rounded-xl flex items-start gap-3"
          style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
          <ShieldAlert size={18} style={{ color: "#f87171", flexShrink: 0, marginTop: 2 }} />
          <div>
            <p className="text-sm font-semibold mb-0.5" style={{ color: "#f87171" }}>Account Temporarily Locked</p>
            <p className="text-xs mb-1" style={{ color: "rgba(248,113,113,0.7)" }}>Too many failed attempts. Try again in:</p>
            <p className="text-lg font-mono font-bold flex items-center gap-1.5" style={{ color: "#f87171" }}>
              <Clock size={16} /> {formatTimeLeft(timeLeft)}
            </p>
          </div>
        </div>
      )}

      {/* Attempt Warning */}
      {!isLockedOut && showAttemptWarning && attemptsLeft > 0 && (
        <div className="mb-4 p-3 rounded-xl flex items-center gap-2.5"
          style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)" }}>
          <AlertCircle size={15} style={{ color: "#fbbf24", flexShrink: 0 }} />
          <p className="text-xs" style={{ color: "#fbbf24" }}>
            <strong>{attemptsLeft} attempt{attemptsLeft !== 1 ? "s" : ""} left</strong> before 36-hour lockout.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <InputField
            icon={User} label="Username" name="username" type="text"
            value={formData.username} onChange={handleChange}
            placeholder="johndoe" autoComplete="username"
            error={errors.username} disabled={isLockedOut}
          />
        )}

        <InputField
          icon={Mail} label="Email" name="email" type="email"
          value={formData.email} onChange={handleChange}
          placeholder="you@university.edu" autoComplete="email"
          error={errors.email} disabled={isLockedOut}
        />

        <InputField
          icon={Lock} label="Password" name="password"
          type={showPassword ? "text" : "password"}
          value={formData.password} onChange={handleChange}
          placeholder="••••••••"
          autoComplete={isLogin ? "current-password" : "new-password"}
          error={errors.password} disabled={isLockedOut}
          rightElement={
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="p-1 rounded transition-colors"
              style={{ color: "var(--text-muted)" }}
              onMouseEnter={e => e.currentTarget.style.color = "white"}
              onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}>
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          }
        />

        {!isLogin && (
          <InputField
            icon={Lock} label="Confirm Password" name="confirmPassword"
            type={showPassword ? "text" : "password"}
            value={formData.confirmPassword} onChange={handleChange}
            placeholder="••••••••" autoComplete="new-password"
            error={errors.confirmPassword}
          />
        )}

        {isLogin && (
          <div className="flex justify-end">
            <button type="button" onClick={() => setShowForgot(true)}
              className="text-xs transition-colors"
              style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}
              onMouseEnter={e => e.currentTarget.style.color = "#6aaeff"}
              onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}>
              Forgot password?
            </button>
          </div>
        )}

        {/* Submit */}
        <button type="submit" disabled={loading || isLockedOut}
          className="w-full py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 mt-2"
          style={{
            background: isLockedOut
              ? "rgba(255,255,255,0.05)"
              : "linear-gradient(135deg, #1a6dff 0%, #0d47d9 100%)",
            color: isLockedOut ? "var(--text-muted)" : "white",
            border: isLockedOut ? "1px solid rgba(255,255,255,0.08)" : "none",
            boxShadow: isLockedOut ? "none" : "0 4px 20px rgba(26,109,255,0.3)",
            fontFamily: "var(--font-display)",
            cursor: isLockedOut ? "not-allowed" : "pointer",
            opacity: loading ? 0.8 : 1,
            transition: "all 0.2s ease",
          }}
          onMouseEnter={e => {
            if (!isLockedOut && !loading) {
              e.currentTarget.style.boxShadow = "0 8px 30px rgba(26,109,255,0.45)";
              e.currentTarget.style.transform = "translateY(-1px)";
            }
          }}
          onMouseLeave={e => {
            e.currentTarget.style.boxShadow = isLockedOut ? "none" : "0 4px 20px rgba(26,109,255,0.3)";
            e.currentTarget.style.transform = "translateY(0)";
          }}>
          {loading
            ? <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />{isLogin ? "Signing in..." : "Creating..."}</>
            : isLockedOut ? "Account Locked 🔒"
            : <><span>{isLogin ? "Sign In" : "Create Account"}</span><ArrowRight size={15} /></>
          }
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
        <span className="text-xs font-mono" style={{ color: "var(--text-dim)" }}>or</span>
        <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
      </div>

      {/* Switch mode */}
      <p className="text-center text-sm" style={{ color: "var(--text-muted)" }}>
        {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
        <Link to={isLogin ? "/signup" : "/login"}
          className="font-semibold transition-colors"
          style={{ color: "#6aaeff" }}
          onMouseEnter={e => e.currentTarget.style.color = "white"}
          onMouseLeave={e => e.currentTarget.style.color = "#6aaeff"}>
          {isLogin ? "Sign up →" : "Sign in →"}
        </Link>
      </p>
    </div>
  );
};

export default AuthForm;
