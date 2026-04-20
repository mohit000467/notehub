// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../services/firebase";
import { getUserById } from "../services/userService";

const AuthContext = createContext(null);

// ⏱️ 30 minute inactivity ke baad logout
const TIMEOUT_DURATION = 30 * 60 * 1000;

// 🔄 Blocked status check interval — har 10 second mein check karo
const BLOCK_CHECK_INTERVAL = 10 * 1000;

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef(null);
  const blockCheckRef = useRef(null);

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

  // ── Blocked user check loop ──────────────────────────────────
  // Har 10 second mein Firestore se check karo — agar blocked hai to logout
  const startBlockCheck = (uid) => {
    // Pehle clear karo agar already chal raha ho
    if (blockCheckRef.current) clearInterval(blockCheckRef.current);

    blockCheckRef.current = setInterval(async () => {
      try {
        const result = await getUserById(uid);
        if (result.success && result.data?.isBlocked) {
          // Blocked hai — turant logout karo
          clearInterval(blockCheckRef.current);
          await signOut(auth);
        } else if (result.success) {
          // Profile update karo (unblock bhi reflect hoga)
          setUserProfile(result.data);
        }
      } catch (e) {
        // Silent fail — network issue etc
      }
    }, BLOCK_CHECK_INTERVAL);
  };

  const stopBlockCheck = () => {
    if (blockCheckRef.current) {
      clearInterval(blockCheckRef.current);
      blockCheckRef.current = null;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Pehle check karo — blocked to nahi hai
        const result = await getUserById(user.uid);

        if (result.success && result.data?.isBlocked) {
          // Blocked user — login hone hi mat dena
          await signOut(auth);
          setCurrentUser(null);
          setUserProfile(null);
          setLoading(false);
          return;
        }

        setCurrentUser(user);
        if (result.success) setUserProfile(result.data);
        resetTimer();
        startBlockCheck(user.uid); // Block check loop start karo
      } else {
        setCurrentUser(null);
        setUserProfile(null);
        stopBlockCheck();
        if (timerRef.current) clearTimeout(timerRef.current);
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
      stopBlockCheck();
    };
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