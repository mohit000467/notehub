// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../services/firebase";
import { getUserById } from "../services/userService";

const AuthContext = createContext(null);

// ⏱️ 30 minute inactivity ke baad logout
const TIMEOUT_DURATION = 30 * 60 * 1000;

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef(null);

  // Timer reset karo jab bhi user kuch kare
  const resetTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      await signOut(auth);
    }, TIMEOUT_DURATION);
  };

  // User activity track karo
  useEffect(() => {
    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    events.forEach((e) => window.addEventListener(e, resetTimer));
    return () => {
      events.forEach((e) => window.removeEventListener(e, resetTimer));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const result = await getUserById(user.uid);
        if (result.success) setUserProfile(result.data);
        resetTimer(); // Login hote hi timer start
      } else {
        setUserProfile(null);
        if (timerRef.current) clearTimeout(timerRef.current);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};