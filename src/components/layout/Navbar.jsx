// src/components/layout/Navbar.jsx — Glassmorphism Edition
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { BookOpen, Upload, LayoutDashboard, LogOut, Menu, X, User, Shield } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { logOut } from "../../services/authService";
import { isAdminUser } from "../../services/adminService";
import toast from "react-hot-toast";

const Navbar = () => {
  const { isAuthenticated, userProfile, currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isAdmin = isAuthenticated && isAdminUser(currentUser?.email);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const handleLogout = async () => {
    await logOut();
    toast.success("Logged out");
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav
        className="sticky top-0 z-50 transition-all duration-300"
        style={{
          background: scrolled
            ? "rgba(5, 6, 10, 0.88)"
            : "rgba(5, 6, 10, 0.55)",
          backdropFilter: "blur(32px) saturate(200%)",
          WebkitBackdropFilter: "blur(32px) saturate(200%)",
          borderBottom: scrolled
            ? "1px solid rgba(108,138,255,0.14)"
            : "1px solid rgba(108,138,255,0.07)",
          boxShadow: scrolled
            ? "0 4px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.03)"
            : "none",
        }}
      >
        {/* Top gradient line */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background: "linear-gradient(90deg, transparent 0%, rgba(108,138,255,0.4) 30%, rgba(167,139,250,0.3) 60%, transparent 100%)",
            opacity: scrolled ? 1 : 0.4,
            transition: "opacity 0.3s ease",
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                style={{
                  background: "linear-gradient(135deg, #6c8aff 0%, #5570f0 100%)",
                  boxShadow: "0 4px 16px rgba(108,138,255,0.35)",
                }}
              >
                <BookOpen size={16} className="text-white" />
              </div>
              <span className="font-display font-bold text-lg text-white hidden sm:block group-hover:text-blue-300 transition-colors">
                NoteHub
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {isAuthenticated ? (
                <>
                  {[
                    { to: "/upload",    icon: Upload,          label: "Upload" },
                    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
                    { to: `/profile/${userProfile?.userId}`, icon: User, label: userProfile?.username || "Profile" },
                  ].map(({ to, icon: Icon, label }) => (
                    <Link
                      key={to}
                      to={to}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200"
                      style={{
                        background: isActive(to)
                          ? "rgba(108,138,255,0.14)"
                          : "transparent",
                        color: isActive(to)
                          ? "rgba(108,138,255,0.95)"
                          : "rgba(107,116,153,0.9)",
                        border: isActive(to)
                          ? "1px solid rgba(108,138,255,0.2)"
                          : "1px solid transparent",
                      }}
                      onMouseEnter={e => {
                        if (!isActive(to)) {
                          e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                          e.currentTarget.style.color = "rgba(238,240,255,0.9)";
                        }
                      }}
                      onMouseLeave={e => {
                        if (!isActive(to)) {
                          e.currentTarget.style.background = "transparent";
                          e.currentTarget.style.color = "rgba(107,116,153,0.9)";
                        }
                      }}
                    >
                      <Icon size={15} />
                      {label}
                    </Link>
                  ))}

                  {/* Admin */}
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all"
                      style={{
                        background: "rgba(251,113,133,0.08)",
                        border: "1px solid rgba(251,113,133,0.2)",
                        color: "rgba(251,113,133,0.9)",
                      }}
                    >
                      <Shield size={15} />
                      Admin
                    </Link>
                  )}

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium ml-1 transition-all"
                    style={{ color: "rgba(107,116,153,0.8)" }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = "rgba(251,113,133,0.08)";
                      e.currentTarget.style.color = "rgba(251,113,133,0.9)";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "rgba(107,116,153,0.8)";
                    }}
                  >
                    <LogOut size={15} />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-medium transition-colors"
                    style={{ color: "rgba(107,116,153,0.9)" }}
                    onMouseEnter={e => e.currentTarget.style.color = "white"}
                    onMouseLeave={e => e.currentTarget.style.color = "rgba(107,116,153,0.9)"}
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/signup"
                    className="btn-primary px-5 py-2 text-sm rounded-xl"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Toggle */}
            <button
              className="md:hidden p-2 rounded-xl transition-all"
              style={{
                background: mobileOpen ? "rgba(108,138,255,0.12)" : "transparent",
                border: mobileOpen ? "1px solid rgba(108,138,255,0.2)" : "1px solid transparent",
                color: "rgba(107,116,153,0.9)",
              }}
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <div style={{ transition: "transform 0.2s ease", transform: mobileOpen ? "rotate(90deg)" : "none" }}>
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div
          className="fixed inset-x-0 top-16 z-40 animate-slide-up mx-3 mt-2 rounded-2xl overflow-hidden"
          style={{
            background: "rgba(8, 10, 18, 0.92)",
            backdropFilter: "blur(32px) saturate(180%)",
            WebkitBackdropFilter: "blur(32px) saturate(180%)",
            border: "1px solid rgba(108,138,255,0.12)",
            boxShadow: "0 16px 48px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)",
          }}
        >
          {/* Shine line */}
          <div className="h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(108,138,255,0.4), transparent)" }} />

          <div className="p-4 space-y-1">
            {isAuthenticated ? (
              <>
                {/* User badge */}
                <div
                  className="flex items-center gap-3 px-3 py-3 mb-3 rounded-xl"
                  style={{ background: "rgba(108,138,255,0.07)", border: "1px solid rgba(108,138,255,0.12)" }}
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                    style={{ backgroundColor: userProfile?.avatarColor || "#6c8aff", boxShadow: "0 0 12px rgba(108,138,255,0.4)" }}
                  >
                    {userProfile?.username?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{userProfile?.username}</p>
                    <p className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>{userProfile?.uniqueId}</p>
                  </div>
                </div>

                {[
                  { to: "/upload", icon: Upload, label: "Upload Notes" },
                  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
                  { to: `/profile/${userProfile?.userId}`, icon: User, label: "My Profile" },
                ].map(({ to, icon: Icon, label }) => (
                  <Link
                    key={to}
                    to={to}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
                    style={{ color: isActive(to) ? "rgba(108,138,255,0.95)" : "rgba(168,178,207,0.8)" }}
                  >
                    <Icon size={16} />
                    {label}
                  </Link>
                ))}

                {isAdmin && (
                  <Link to="/admin" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium"
                    style={{ color: "rgba(251,113,133,0.9)" }}>
                    <Shield size={16} /> Admin Panel
                  </Link>
                )}

                <div className="gradient-divider my-2" />

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
                  style={{ color: "rgba(251,113,133,0.8)" }}
                >
                  <LogOut size={16} /> Logout
                </button>
              </>
            ) : (
              <div className="space-y-2">
                <Link to="/login" className="block px-4 py-2.5 rounded-xl text-sm font-medium text-center"
                  style={{ color: "rgba(168,178,207,0.8)" }}>
                  Sign in
                </Link>
                <Link to="/signup" className="btn-primary block px-4 py-2.5 rounded-xl text-sm text-center">
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 md:hidden"
          style={{ background: "rgba(0,0,0,0.3)", backdropFilter: "blur(2px)" }}
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  );
};

export default Navbar;
