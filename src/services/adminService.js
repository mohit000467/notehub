// src/services/adminService.js
import {
  collection, getDocs, doc, deleteDoc, getDoc, setDoc,
  query, orderBy, updateDoc, arrayRemove, where,
} from "firebase/firestore";
import { db } from "./firebase";

export const ADMIN_EMAIL = "mohitsingh97941111@gmail.com";
export const isAdminUser = (email) => email === ADMIN_EMAIL;

// ── ADMIN PANEL PASSWORD (Firestore) ──────────────────────────
export const getAdminPassword = async () => {
  try {
    const snap = await getDoc(doc(db, "config", "admin_config"));
    if (snap.exists() && snap.data().panelPassword)
      return { success: true, password: snap.data().panelPassword };
    return { success: false, notSet: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const setAdminPassword = async (newPassword) => {
  try {
    await setDoc(
      doc(db, "config", "admin_config"),
      { panelPassword: newPassword, updatedAt: new Date().toISOString() },
      { merge: true }
    );
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ── GET ALL USERS (admin sees ALL — public + private + blocked) 
export const getAllUsers = async () => {
  try {
    const snapshot = await getDocs(collection(db, "users"));
    return {
      success: true,
      data: snapshot.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort(
          (a, b) =>
            (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
        ),
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
      data: snapshot.docs.map((d) => ({ id: d.id, ...d.data() })),
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ── GET NOTES BY USER ID ──────────────────────────────────────
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
      data: snapshot.docs.map((d) => ({ id: d.id, ...d.data() })),
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ── ADMIN DELETE NOTE ─────────────────────────────────────────
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

// ── ADMIN DELETE ALL NOTES OF A USER ─────────────────────────
export const adminDeleteAllUserNotes = async (userId) => {
  try {
    const q = query(
      collection(db, "notes"),
      where("userId", "==", userId)
    );
    const snapshot = await getDocs(q);
    const deletePromises = snapshot.docs.map((d) => deleteDoc(d.ref));
    await Promise.all(deletePromises);
    // Clear uploadedNotes array on user
    await updateDoc(doc(db, "users", userId), { uploadedNotes: [] });
    return { success: true, count: snapshot.size };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ── ADMIN BLOCK USER ──────────────────────────────────────────
// Blocked user: cannot login effectively, notes hidden from platform
export const adminBlockUser = async (userId) => {
  try {
    await updateDoc(doc(db, "users", userId), {
      isBlocked: true,
      blockedAt: new Date().toISOString(),
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ── ADMIN UNBLOCK USER ────────────────────────────────────────
export const adminUnblockUser = async (userId) => {
  try {
    await updateDoc(doc(db, "users", userId), {
      isBlocked: false,
      blockedAt: null,
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ── ADMIN DELETE USER (Firestore doc + all their notes) ───────
// Note: Firebase Auth user deletion requires Admin SDK (server-side)
// This removes all user data from Firestore — user cannot login usefully
export const adminDeleteUser = async (userId) => {
  try {
    // 1. Delete all notes by this user
    const q = query(collection(db, "notes"), where("userId", "==", userId));
    const notesSnap = await getDocs(q);
    const deleteNotePromises = notesSnap.docs.map((d) => deleteDoc(d.ref));
    await Promise.all(deleteNotePromises);

    // 2. Delete user Firestore document
    await deleteDoc(doc(db, "users", userId));

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
    const notes = notesSnap.docs.map((d) => d.data());
    const totalDownloads = notes.reduce(
      (s, n) => s + (n.downloadCount || 0),
      0
    );
    const totalRatings = notes.filter((n) => n.ratingCount > 0).length;
    const blockedUsers = usersSnap.docs.filter(
      (d) => d.data().isBlocked
    ).length;
    return {
      success: true,
      data: {
        totalUsers: usersSnap.size,
        totalNotes: notesSnap.size,
        totalDownloads,
        totalRatings,
        blockedUsers,
      },
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};