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

export const signUp = async (email, password, username) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update display name immediately
    await updateProfile(user, { displayName: username });

    const uniqueId = generateUniqueId();

    await setDoc(doc(db, "users", user.uid), {
      userId: user.uid,
      username: username,          // ✅ Sahi username store ho raha hai
      email: email,
      uniqueId: uniqueId,
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