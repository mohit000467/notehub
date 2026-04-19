// src/components/layout/Navbar.jsx
import React, { useState } from "react";
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

  const isAdmin = isAuthenticated && isAdminUser(currentUser?.email);

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
          ? "bg-ink-500/20 text-ink-300"
          : "text-gray-400 hover:text-gray-200 hover:bg-surface-hover"
      }`}
    >
      <Icon size={16} />
      {label}
    </Link>
  );

  return (
    <nav className="sticky top-0 z-50 glass border-b border-surface-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-ink-500 flex items-center justify-center group-hover:bg-ink-400 transition-colors">
              <BookOpen size={16} className="text-white" />
            </div>
            <span className="font-display font-bold text-lg text-white hidden sm:block">
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

                {/* Admin link — only visible to admin */}
                {isAdmin && (
                  <NavLink to="/admin" icon={Shield} label="Admin" special />
                )}

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
                <Link to="/signup" className="px-4 py-2 text-sm font-semibold bg-ink-500 hover:bg-ink-400 text-white rounded-lg transition-colors">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <button className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-surface-hover"
            onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-surface-border bg-surface-card animate-fade-in">
          <div className="px-4 py-3 space-y-1">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-3 px-3 py-3 mb-2 border-b border-surface-border">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm overflow-hidden"
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

                {/* Admin link mobile */}
                {isAdmin && (
                  <NavLink to="/admin" icon={Shield} label="Admin Panel" special />
                )}

                <button onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-red-400/10 transition-all">
                  <LogOut size={16} /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-surface-hover">
                  Sign in
                </Link>
                <Link to="/signup" onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-semibold bg-ink-500 text-white text-center">
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