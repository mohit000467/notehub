// src/services/adminService.js
// Admin-only backend logic — Firestore + Cloudinary delete

import {
  collection, getDocs, doc, deleteDoc, getDoc,
  query, orderBy, updateDoc, arrayRemove,
} from "firebase/firestore";
import { db } from "./firebase";

// ── Your admin email — CHANGE THIS ───────────────────────────
export const ADMIN_EMAIL = "mohitsingh97941111@gmail.com";

export const isAdminUser = (email) => email === ADMIN_EMAIL;

// ── GET ALL USERS ─────────────────────────────────────────────
export const getAllUsers = async () => {
  try {
    const snapshot = await getDocs(collection(db, "users"));
    return {
      success: true,
      data: snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)),
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ── GET ALL NOTES ─────────────────────────────────────────────
export const getAllNotes = async () => {
  try {
    const q = query(collection(db, "notes"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return {
      success: true,
      data: snapshot.docs.map(d => ({ id: d.id, ...d.data() })),
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ── DELETE NOTE (Firestore + Cloudinary) ──────────────────────
export const adminDeleteNote = async (noteId, publicId) => {
  try {
    // 1. Get note data first
    const noteRef = doc(db, "notes", noteId);
    const noteSnap = await getDoc(noteRef);
    if (!noteSnap.exists()) return { success: false, error: "Note not found" };
    const noteData = noteSnap.data();

    // 2. Delete from Cloudinary via proxy (unsigned delete not supported,
    //    so we just remove from Firestore and mark as deleted)
    // Note: Full Cloudinary delete requires backend/server.
    // For now: remove from Firestore + update user's uploadedNotes array
    await deleteDoc(noteRef);

    // 3. Remove from user's uploadedNotes array
    if (noteData.userId) {
      try {
        await updateDoc(doc(db, "users", noteData.userId), {
          uploadedNotes: arrayRemove(noteId),
        });
      } catch (e) { /* ignore if field doesn't exist */ }
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ── GET NOTES BY USER ─────────────────────────────────────────
export const getNotesByUserId = async (userId) => {
  try {
    const q = query(collection(db, "notes"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    const notes = snapshot.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(n => n.userId === userId);
    return { success: true, data: notes };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ── PLATFORM STATS ────────────────────────────────────────────
export const getPlatformStats = async () => {
  try {
    const [usersSnap, notesSnap] = await Promise.all([
      getDocs(collection(db, "users")),
      getDocs(collection(db, "notes")),
    ]);
    const notes = notesSnap.docs.map(d => d.data());
    const totalDownloads = notes.reduce((s, n) => s + (n.downloadCount || 0), 0);
    const totalRatings = notes.filter(n => n.ratingCount > 0).length;
    return {
      success: true,
      data: {
        totalUsers: usersSnap.size,
        totalNotes: notesSnap.size,
        totalDownloads,
        totalRatings,
      },
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
