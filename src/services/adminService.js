// src/services/adminService.js
import {
  collection, getDocs, doc, deleteDoc, getDoc, setDoc,
  query, orderBy, updateDoc, arrayRemove, where,
} from "firebase/firestore";
import { db } from "./firebase";

export const ADMIN_EMAIL = "mohitsingh97941111@gmail.com";
export const isAdminUser = (email) => email === ADMIN_EMAIL;

// ── ADMIN PANEL PASSWORD ──────────────────────────────────────
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

// ── GET ALL USERS ─────────────────────────────────────────────
export const getAllUsers = async () => {
  try {
    const snapshot = await getDocs(collection(db, "users"));
    return {
      success: true,
      data: snapshot.docs
        .map((d) => ({ id: d.id, ...d.data() }))
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
    const q = query(collection(db, "notes"), where("userId", "==", userId));
    const snapshot = await getDocs(q);
    await Promise.all(snapshot.docs.map((d) => deleteDoc(d.ref)));
    await updateDoc(doc(db, "users", userId), { uploadedNotes: [] });
    return { success: true, count: snapshot.size };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ── ADMIN BLOCK USER ──────────────────────────────────────────
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

// ── ADMIN DELETE USER ─────────────────────────────────────────
export const adminDeleteUser = async (userId) => {
  try {
    const q = query(collection(db, "notes"), where("userId", "==", userId));
    const notesSnap = await getDocs(q);
    await Promise.all(notesSnap.docs.map((d) => deleteDoc(d.ref)));
    await deleteDoc(doc(db, "users", userId));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ── GET ALL LOGIN-LOCKED USERS ────────────────────────────────
export const getLockedUsers = async () => {
  try {
    const snapshot = await getDocs(collection(db, "loginAttempts"));
    const now = Date.now();
    const locked = [];
    snapshot.docs.forEach((d) => {
      const data = d.data();
      if (data.lockedUntil) {
        const lockedUntil = typeof data.lockedUntil === "number"
          ? data.lockedUntil
          : data.lockedUntil?.toMillis?.() || 0;
        if (lockedUntil > now) {
          locked.push({
            id: d.id, // email key
            email: d.id.replace(/_/g, "."), // approximate
            attempts: data.attempts || 0,
            lockedUntil,
            remaining: lockedUntil - now,
            lastAttempt: data.lastAttempt,
          });
        }
      }
    });
    return { success: true, data: locked };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ── ADMIN UNLOCK LOGIN-LOCKED USER ────────────────────────────
export const adminUnlockLoginUser = async (docId) => {
  try {
    const ref = doc(db, "loginAttempts", docId);
    await setDoc(ref, { attempts: 0, lockedUntil: null, lastAttempt: null });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ── PLATFORM STATS ────────────────────────────────────────────
export const getPlatformStats = async () => {
  try {
    const [usersSnap, notesSnap, attemptsSnap] = await Promise.all([
      getDocs(collection(db, "users")),
      getDocs(collection(db, "notes")),
      getDocs(collection(db, "loginAttempts")),
    ]);
    const notes = notesSnap.docs.map((d) => d.data());
    const totalDownloads = notes.reduce((s, n) => s + (n.downloadCount || 0), 0);
    const totalRatings = notes.filter((n) => n.ratingCount > 0).length;
    const blockedUsers = usersSnap.docs.filter((d) => d.data().isBlocked).length;
    const now = Date.now();
    const loginLockedUsers = attemptsSnap.docs.filter((d) => {
      const data = d.data();
      if (!data.lockedUntil) return false;
      const lockedUntil = typeof data.lockedUntil === "number"
        ? data.lockedUntil : data.lockedUntil?.toMillis?.() || 0;
      return lockedUntil > now;
    }).length;

    return {
      success: true,
      data: {
        totalUsers: usersSnap.size,
        totalNotes: notesSnap.size,
        totalDownloads,
        totalRatings,
        blockedUsers,
        loginLockedUsers,
      },
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};