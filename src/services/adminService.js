// src/services/adminService.js
import {
  collection, getDocs, doc, deleteDoc, getDoc, setDoc,
  query, orderBy, updateDoc, arrayRemove, where,
} from "firebase/firestore";
import { db } from "./firebase";

export const ADMIN_EMAIL = "mohitsingh97941111@gmail.com";
export const isAdminUser = (email) => email === ADMIN_EMAIL;

// ── Admin panel password (Firestore) ─────────────────────────
export const getAdminPassword = async () => {
  try {
    const snap = await getDoc(doc(db, "config", "admin_config"));
    if (snap.exists() && snap.data().panelPassword) {
      return { success: true, password: snap.data().panelPassword };
    }
    return { success: false, notSet: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const setAdminPassword = async (newPassword) => {
  try {
    await setDoc(doc(db, "config", "admin_config"), {
      panelPassword: newPassword,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ── GET ALL USERS (admin sees ALL — public + private) ─────────
export const getAllUsers = async () => {
  try {
    const snapshot = await getDocs(collection(db, "users"));
    return {
      success: true,
      data: snapshot.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)),
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ── GET ALL NOTES (admin sees ALL notes) ──────────────────────
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

// ── GET NOTES BY USER (for expanded user view) ────────────────
export const getNotesByUserId = async (userId) => {
  try {
    const q = query(
      collection(db, "notes"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    return {
      success: true,
      data: snapshot.docs.map(d => ({ id: d.id, ...d.data() })),
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ── ADMIN DELETE NOTE ─────────────────────────────────────────
// Removes from Firestore + updates user's uploadedNotes array
export const adminDeleteNote = async (noteId) => {
  try {
    const noteRef = doc(db, "notes", noteId);
    const noteSnap = await getDoc(noteRef);
    if (!noteSnap.exists()) return { success: false, error: "Note not found" };
    const noteData = noteSnap.data();

    // Delete note document
    await deleteDoc(noteRef);

    // Remove from user's uploadedNotes array
    if (noteData.userId) {
      try {
        await updateDoc(doc(db, "users", noteData.userId), {
          uploadedNotes: arrayRemove(noteId),
        });
      } catch (e) { /* ignore if field missing */ }
    }

    return { success: true };
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