// src/services/authService.js
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./firebase";
import { generateUniqueId } from "../utils/helpers";

// ── Helper: get loginAttempts doc key ────────────────────────
const getAttemptKey = (email) => email.toLowerCase().replace(/[^a-z0-9]/g, "_");

// ── Check if email is locked out ─────────────────────────────
const checkLockout = async (email) => {
  try {
    const key = getAttemptKey(email);
    const snap = await getDoc(doc(db, "loginAttempts", key));
    if (!snap.exists()) return { locked: false };
    const data = snap.data();
    if (data.lockedUntil) {
      const lockedUntil = typeof data.lockedUntil === "number"
        ? data.lockedUntil
        : data.lockedUntil?.toMillis?.() || 0;
      const remaining = lockedUntil - Date.now();
      if (remaining > 0) {
        return { locked: true, remaining, lockedUntil };
      }
    }
    return { locked: false, attempts: data.attempts || 0 };
  } catch (e) {
    return { locked: false };
  }
};

export const signUp = async (email, password, username) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    await updateProfile(user, { displayName: username });
    const uniqueId = generateUniqueId();
    await setDoc(doc(db, "users", user.uid), {
      userId: user.uid,
      username,
      email,
      uniqueId,
      profileVisibility: "public",
      bio: "",
      avatarColor: getRandomColor(),
      uploadedNotes: [],
      totalDownloads: 0,
      createdAt: serverTimestamp(),
    });
    return { success: true, user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const signIn = async (email, password) => {
  try {
    // ── STEP 1: Check loginAttempts lockout BEFORE Firebase Auth ──
    const lockStatus = await checkLockout(email);
    if (lockStatus.locked) {
      // Strictly blocked — don't even try Firebase Auth
      return {
        success: false,
        locked: true,
        remaining: lockStatus.remaining,
        error: "auth/account-locked",
      };
    }

    // ── STEP 2: Try Firebase Auth ──────────────────────────────
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };

  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const logOut = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getUserProfile = async (userId) => {
  try {
    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) return { success: true, data: docSnap.data() };
    return { success: false, error: "User not found" };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const getRandomColor = () => {
  const colors = ["#3a5aff","#00d4ff","#00ff88","#ffb800","#ff4466","#a855f7","#f97316","#14b8a6"];
  return colors[Math.floor(Math.random() * colors.length)];
};