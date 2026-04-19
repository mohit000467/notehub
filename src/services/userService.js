// src/services/userService.js
import {
  collection, doc, getDoc, getDocs, updateDoc, query, where,
} from "firebase/firestore";
import { db } from "./firebase";

const CLOUDINARY_CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;

// ── GET USER BY FIREBASE UID ──────────────────────────────────
export const getUserById = async (userId) => {
  try {
    const docSnap = await getDoc(doc(db, "users", userId));
    if (docSnap.exists()) return { success: true, data: docSnap.data() };
    return { success: false, error: "User not found" };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ── SEARCH USER BY UNIQUE ID ──────────────────────────────────
export const getUserByUniqueId = async (uniqueId) => {
  try {
    const q = query(collection(db, "users"), where("uniqueId", "==", uniqueId.toUpperCase()));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return { success: false, error: "No user found with this ID" };
    const userData = snapshot.docs[0].data();
    if (userData.profileVisibility === "private") {
      return { success: false, error: "This profile is private", isPrivate: true };
    }
    return { success: true, data: userData };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ── UPDATE PROFILE VISIBILITY ─────────────────────────────────
export const updateProfileVisibility = async (userId, visibility) => {
  try {
    await updateDoc(doc(db, "users", userId), { profileVisibility: visibility });
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

// ── UPDATE TOTAL DOWNLOADS ────────────────────────────────────
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

// ── UPLOAD PROFILE PHOTO TO CLOUDINARY ───────────────────────
export const uploadProfilePhoto = async (userId, file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    formData.append("folder", "notehub_avatars");

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: "POST", body: formData }
    );
    const data = await res.json();
    if (!data.secure_url) throw new Error("Upload failed");

    // Save photo URL in Firestore
    await updateDoc(doc(db, "users", userId), {
      photoURL: data.secure_url,
      avatarColor: null, // remove color when photo set
    });

    return { success: true, photoURL: data.secure_url };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ── UPDATE AVATAR COLOR ───────────────────────────────────────
export const updateAvatarColor = async (userId, color) => {
  try {
    await updateDoc(doc(db, "users", userId), {
      avatarColor: color,
      photoURL: null, // remove photo when color set
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};