// src/components/layout/Navbar.jsx
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

  // Add shadow on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = async () => {
    await logOut();
    toast.success("Logged out successfully");
    navigate("/");
    setMobileOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const NavLink = ({ to, icon: Icon, label, special }) => (
    <Link
      to={to}
      onClick={() => setMobileOpen(false)}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
        special
          ? "text-red-400 hover:text-red-300 hover:bg-red-400/10 border border-red-500/20"
          : isActive(to)
          ? "bg-ink-500/20 text-ink-300 shadow-sm"
          : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
      }`}
    >
      <Icon size={16} />
      {label}
    </Link>
  );

  return (
    <nav
      className="sticky top-0 z-50 border-b transition-all duration-300"
      style={{
        background: scrolled
          ? "rgba(8, 9, 12, 0.92)"
          : "rgba(8, 9, 12, 0.6)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        borderColor: scrolled
          ? "rgba(108,138,255,0.12)"
          : "rgba(31, 35, 54, 0.6)",
        boxShadow: scrolled
          ? "0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)"
          : "none",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-ink-500 flex items-center justify-center group-hover:bg-ink-400 transition-all group-hover:scale-105 group-hover:shadow-glow">
              <BookOpen size={16} className="text-white" />
            </div>
            <span className="font-display font-bold text-lg text-white hidden sm:block group-hover:text-ink-200 transition-colors">
              NoteHub
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {isAuthenticated ? (
              <>
                <NavLink to="/upload"    icon={Upload}          label="Upload" />
                <NavLink to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
                <NavLink to={`/profile/${userProfile?.userId}`} icon={User} label={userProfile?.username || "Profile"} />
                {isAdmin && <NavLink to="/admin" icon={Shield} label="Admin" special />}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-all ml-1"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors">
                  Sign in
                </Link>
                <Link to="/signup"
                  className="px-4 py-2 text-sm font-semibold bg-ink-500 hover:bg-ink-400 text-white rounded-lg transition-all hover:shadow-glow hover:-translate-y-px">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white transition-all"
            style={{ background: mobileOpen ? "rgba(108,138,255,0.1)" : "transparent" }}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <div className="transition-all duration-200" style={{ transform: mobileOpen ? "rotate(90deg)" : "rotate(0)" }}>
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div
          className="md:hidden border-t animate-fade-in"
          style={{
            background: "rgba(8, 9, 12, 0.95)",
            backdropFilter: "blur(20px)",
            borderColor: "rgba(108,138,255,0.1)",
          }}
        >
          <div className="px-4 py-3 space-y-1">
            {isAuthenticated ? (
              <>
                {/* User badge */}
                <div className="flex items-center gap-3 px-3 py-3 mb-2 rounded-xl"
                  style={{ background: "rgba(108,138,255,0.06)", border: "1px solid rgba(108,138,255,0.1)" }}>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm overflow-hidden flex-shrink-0"
                    style={{ backgroundColor: userProfile?.avatarColor || "#3a5aff" }}>
                    {userProfile?.photoURL
                      ? <img src={userProfile.photoURL} alt="" className="w-full h-full object-cover" />
                      : userProfile?.username?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{userProfile?.username}</p>
                    <p className="text-xs text-gray-500 font-mono">{userProfile?.uniqueId}</p>
                  </div>
                </div>
                <NavLink to="/upload"    icon={Upload}          label="Upload Notes" />
                <NavLink to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
                <NavLink to={`/profile/${userProfile?.userId}`} icon={User} label="My Profile" />
                {isAdmin && <NavLink to="/admin" icon={Shield} label="Admin Panel" special />}
                <button onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-red-400/10 transition-all">
                  <LogOut size={16} /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-white/5">
                  Sign in
                </Link>
                <Link to="/signup" onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-semibold bg-ink-500 text-white text-center hover:bg-ink-400 transition-all">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;