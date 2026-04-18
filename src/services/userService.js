// src/services/userService.js
// ============================================================
// Handles user profile operations and user search
// ============================================================

import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
} from "firebase/firestore";
import { db } from "./firebase";

// ── GET USER BY FIREBASE UID ──────────────────────────────────
export const getUserById = async (userId) => {
  try {
    const docSnap = await getDoc(doc(db, "users", userId));
    if (docSnap.exists()) {
      return { success: true, data: docSnap.data() };
    }
    return { success: false, error: "User not found" };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ── SEARCH USER BY UNIQUE ID ──────────────────────────────────
// This is the public-facing searchable ID (e.g., USR-A3X9K2)
export const getUserByUniqueId = async (uniqueId) => {
  try {
    const q = query(
      collection(db, "users"),
      where("uniqueId", "==", uniqueId.toUpperCase())
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return { success: false, error: "No user found with this ID" };
    }

    const userData = snapshot.docs[0].data();

    // Check visibility
    if (userData.profileVisibility === "private") {
      return {
        success: false,
        error: "This profile is private",
        isPrivate: true,
      };
    }

    return { success: true, data: userData };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ── UPDATE PROFILE VISIBILITY ─────────────────────────────────
export const updateProfileVisibility = async (userId, visibility) => {
  try {
    await updateDoc(doc(db, "users", userId), {
      profileVisibility: visibility,
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ── UPDATE BIO ────────────────────────────────────────────────
export const updateUserBio = async (userId, bio) => {
  try {
    await updateDoc(doc(db, "users", userId), { bio });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ── UPDATE TOTAL DOWNLOADS (called after someone downloads) ───
export const updateUserDownloads = async (noteOwnerId) => {
  try {
    const userRef = doc(db, "users", noteOwnerId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const current = userSnap.data().totalDownloads || 0;
      await updateDoc(userRef, { totalDownloads: current + 1 });
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
