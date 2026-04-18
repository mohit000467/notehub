// src/services/notesService.js
// Uses Cloudinary for file storage instead of Firebase Storage

import {
  collection, doc, addDoc, getDoc, getDocs, updateDoc, deleteDoc,
  query, where, orderBy, increment, serverTimestamp, arrayUnion, limit,
} from "firebase/firestore";
import { db } from "./firebase";

const CLOUDINARY_CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;

const uploadToCloudinary = async (file, onProgress) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  formData.append("folder", "notehub_notes");

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });
    xhr.addEventListener("load", () => {
      if (xhr.status === 200) {
        const res = JSON.parse(xhr.responseText);
        resolve({ fileURL: res.secure_url, publicId: res.public_id });
      } else {
        reject(new Error("Cloudinary upload failed"));
      }
    });
    xhr.addEventListener("error", () => reject(new Error("Upload failed")));
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/raw/upload`);
    xhr.send(formData);
  });
};

export const uploadNote = async (noteData, file, userId, username, onProgress) => {
  try {
    const { fileURL, publicId } = await uploadToCloudinary(file, onProgress);
    const fileExtension = file.name.split(".").pop();

    const noteDoc = await addDoc(collection(db, "notes"), {
      userId, username,
      subject: noteData.subject.trim().toLowerCase(),
      subjectDisplay: noteData.subject.trim(),
      title: noteData.title.trim(),
      description: noteData.description.trim(),
      fileURL, publicId,
      fileName: file.name,
      fileType: fileExtension.toLowerCase(),
      fileSize: file.size,
      tags: noteData.tags || [],
      rating: 0, ratingCount: 0, ratingSum: 0,
      downloadCount: 0, ratedBy: [],
      createdAt: serverTimestamp(),
    });

    await updateDoc(doc(db, "users", userId), {
      uploadedNotes: arrayUnion(noteDoc.id),
    });

    return { success: true, noteId: noteDoc.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getNotesBySubject = async (subject, sortBy = "createdAt") => {
  try {
    const validSort = ["createdAt", "downloadCount", "rating"];
    const sortField = validSort.includes(sortBy) ? sortBy : "createdAt";
    const q = query(
      collection(db, "notes"),
      where("subject", "==", subject.trim().toLowerCase()),
      orderBy(sortField, "desc")
    );
    const snapshot = await getDocs(q);
    return { success: true, data: snapshot.docs.map(d => ({ id: d.id, ...d.data() })) };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getNotesByUser = async (userId) => {
  try {
    const q = query(collection(db, "notes"), where("userId", "==", userId), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return { success: true, data: snapshot.docs.map(d => ({ id: d.id, ...d.data() })) };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getAllSubjects = async () => {
  try {
    const snapshot = await getDocs(collection(db, "notes"));
    const map = {};
    snapshot.docs.forEach(d => {
      const data = d.data();
      if (!map[data.subject]) map[data.subject] = { subject: data.subject, subjectDisplay: data.subjectDisplay, count: 0, tags: new Set() };
      map[data.subject].count++;
      (data.tags || []).forEach(t => map[data.subject].tags.add(t));
    });
    return { success: true, data: Object.values(map).map(s => ({ ...s, tags: Array.from(s.tags) })) };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const incrementDownload = async (noteId) => {
  try {
    await updateDoc(doc(db, "notes", noteId), { downloadCount: increment(1) });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const rateNote = async (noteId, userId, rating) => {
  try {
    const noteRef = doc(db, "notes", noteId);
    const noteSnap = await getDoc(noteRef);
    if (!noteSnap.exists()) return { success: false, error: "Note not found" };
    const data = noteSnap.data();
    if (data.ratedBy?.includes(userId)) return { success: false, error: "Already rated" };
    const newSum = (data.ratingSum || 0) + rating;
    const newCount = (data.ratingCount || 0) + 1;
    const newAvg = parseFloat((newSum / newCount).toFixed(1));
    await updateDoc(noteRef, { ratingSum: newSum, ratingCount: newCount, rating: newAvg, ratedBy: arrayUnion(userId) });
    return { success: true, newRating: newAvg };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const deleteNote = async (noteId, noteData, userId) => {
  try {
    if (noteData.userId !== userId) return { success: false, error: "Unauthorized" };
    await deleteDoc(doc(db, "notes", noteId));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getNoteById = async (noteId) => {
  try {
    const docSnap = await getDoc(doc(db, "notes", noteId));
    if (docSnap.exists()) return { success: true, data: { id: docSnap.id, ...docSnap.data() } };
    return { success: false, error: "Note not found" };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getRecentNotes = async (limitCount = 12) => {
  try {
    const q = query(collection(db, "notes"), orderBy("createdAt", "desc"), limit(limitCount));
    const snapshot = await getDocs(q);
    return { success: true, data: snapshot.docs.map(d => ({ id: d.id, ...d.data() })) };
  } catch (error) {
    return { success: false, error: error.message };
  }
};