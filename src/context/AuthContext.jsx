// src/context/AuthContext.jsx
// ============================================================
// Global authentication state using React Context
// Wraps the entire app to provide user state everywhere
// ============================================================

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../services/firebase";
import { getUserById } from "../services/userService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);   // Firebase Auth user
  const [userProfile, setUserProfile] = useState(null);   // Firestore user data
  const [loading, setLoading] = useState(true);           // Initial auth check

  useEffect(() => {
    // Listen for auth state changes (login, logout, page refresh)
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        // Fetch full profile from Firestore
        const result = await getUserById(user.uid);
        if (result.success) {
          setUserProfile(result.data);
        }
      } else {
        setUserProfile(null);
      }

      setLoading(false);
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, []);

  // Refresh profile (call this after updating profile data)
  const refreshProfile = async () => {
    if (currentUser) {
      const result = await getUserById(currentUser.uid);
      if (result.success) setUserProfile(result.data);
    }
  };

  const value = {
    currentUser,
    userProfile,
    loading,
    refreshProfile,
    isAuthenticated: !!currentUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Custom hook for easy access
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
