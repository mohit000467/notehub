// src/services/adminService.js
import {
  collection, getDocs, doc, deleteDoc, getDoc, setDoc,
  query, orderBy, updateDoc, arrayRemove,
} from "firebase/firestore";
import { db } from "./firebase";

export const ADMIN_EMAIL = "mohitsingh97941111@gmail.com";
export const isAdminUser = (email) => email === ADMIN_EMAIL;

// ── Admin panel password — stored in Firestore ────────────────
const ADMIN_CONFIG_DOC = "admin_config";
const ADMIN_CONFIG_COL = "config";

export const getAdminPassword = async () => {
  try {
    const snap = await getDoc(doc(db, ADMIN_CONFIG_COL, ADMIN_CONFIG_DOC));
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
    await setDoc(doc(db, ADMIN_CONFIG_COL, ADMIN_CONFIG_DOC), {
      panelPassword: newPassword,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ── Platform data ─────────────────────────────────────────────
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

export const getAllNotes = async () => {
  try {
    const q = query(collection(db, "notes"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return { success: true, data: snapshot.docs.map(d => ({ id: d.id, ...d.data() })) };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const adminDeleteNote = async (noteId) => {
  try {
    const noteRef = doc(db, "notes", noteId);
    const noteSnap = await getDoc(noteRef);
    if (!noteSnap.exists()) return { success: false, error: "Note not found" };
    const noteData = noteSnap.data();
    await deleteDoc(noteRef);
    if (noteData.userId) {
      try {
        await updateDoc(doc(db, "users", noteData.userId), {
          uploadedNotes: arrayRemove(noteId),
        });
      } catch (e) {}
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

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
      data: { totalUsers: usersSnap.size, totalNotes: notesSnap.size, totalDownloads, totalRatings },
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};