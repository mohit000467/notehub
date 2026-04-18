# 🎓 NoteHub — Student Notes Sharing Platform

A GitHub-like platform for students to upload, share and discover academic notes — built with React + Firebase.

---

## 📁 Project Structure

```
student-notes-platform/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   └── AuthForm.jsx          ← Login/Signup form
│   │   ├── layout/
│   │   │   └── Navbar.jsx            ← Top navigation
│   │   ├── notes/
│   │   │   ├── NoteCard.jsx          ← Single note display card
│   │   │   ├── UploadForm.jsx        ← Drag & drop upload form
│   │   │   └── SortFilter.jsx        ← Sort controls
│   │   └── ui/
│   │       └── LoadingSkeleton.jsx   ← Loading states
│   ├── context/
│   │   └── AuthContext.jsx           ← Global auth state
│   ├── pages/
│   │   ├── HomePage.jsx              ← Landing + dual search
│   │   ├── LoginPage.jsx
│   │   ├── SignupPage.jsx
│   │   ├── UploadPage.jsx
│   │   ├── SubjectPage.jsx           ← Notes by subject
│   │   ├── ProfilePage.jsx           ← User profile
│   │   ├── DashboardPage.jsx         ← Personal dashboard
│   │   ├── SearchResultsPage.jsx
│   │   └── NotFoundPage.jsx
│   ├── services/
│   │   ├── firebase.js               ← Firebase init
│   │   ├── authService.js            ← Auth operations
│   │   ├── notesService.js           ← Notes CRUD
│   │   └── userService.js            ← User profile ops
│   ├── utils/
│   │   └── helpers.js                ← Utility functions
│   ├── App.jsx                       ← Router setup
│   ├── index.js                      ← React entry point
│   └── index.css                     ← Global styles
├── firestore.rules                   ← Security rules
├── firestore.indexes.json            ← Composite indexes
├── storage.rules                     ← Storage security
├── firebase.json                     ← Hosting config
├── tailwind.config.js
├── postcss.config.js
├── .env.example
└── package.json
```

---

## ⚡ Step-by-Step Setup Guide

### STEP 1 — Clone / Download the Project

```bash
# If using git
git clone <your-repo-url>
cd student-notes-platform

# Install all dependencies
npm install
```

---

### STEP 2 — Firebase Project Setup

1. Go to **[https://console.firebase.google.com](https://console.firebase.google.com)**
2. Click **"Add project"** → Give it a name (e.g., `notehub-app`) → Continue
3. Disable Google Analytics (optional) → **Create project**

#### Enable Authentication
1. Left sidebar → **Build → Authentication**
2. Click **"Get started"**
3. Click **Email/Password** → Enable it → Save

#### Enable Firestore
1. Left sidebar → **Build → Firestore Database**
2. Click **"Create database"**
3. Choose **"Start in test mode"** (we'll add rules later) → Next
4. Choose your region (e.g., `asia-south1` for India) → Enable

#### Enable Storage
1. Left sidebar → **Build → Storage**
2. Click **"Get started"**
3. Choose **"Start in test mode"** → Next → Done

#### Get Config Keys
1. Left sidebar → **Project Settings** (gear icon) → **General** tab
2. Scroll to **"Your apps"** → Click **"<>"** (web app) icon
3. Register app (any nickname) → Copy the `firebaseConfig` object

---

### STEP 3 — Configure Environment Variables

```bash
# Copy the example file
cp .env.example .env
```

Open `.env` and fill in your values:

```env
REACT_APP_FIREBASE_API_KEY=AIza...
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123:web:abc
```

Then update `src/services/firebase.js` to use env vars:

```js
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};
```

---

### STEP 4 — Deploy Security Rules & Indexes

```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize (select Firestore, Storage, Hosting)
firebase init

# Deploy rules and indexes
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
firebase deploy --only storage
```

> ⚠️ **Important:** The Firestore indexes take 1-5 minutes to build after first deploy. Until then, some sorted queries may fail.

---

### STEP 5 — Run Locally

```bash
npm start
```

App runs at **http://localhost:3000** 🚀

---

## 🚀 Deployment to Firebase Hosting

```bash
# Build the production app
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

Your app will be live at: `https://your-project-id.web.app`

---

## 🗄️ Firestore Database Structure

### `users` collection
```
users/
  {userId}/                        ← Firebase Auth UID
    userId: string                 ← Same as doc ID
    username: string               ← Display name (can duplicate)
    email: string
    uniqueId: string               ← "USR-A3X9K2" (searchable, unique)
    profileVisibility: "public" | "private"
    bio: string
    avatarColor: string            ← Hex color for avatar
    uploadedNotes: string[]        ← Array of noteIds
    totalDownloads: number
    createdAt: Timestamp
```

### `notes` collection
```
notes/
  {noteId}/                        ← Auto-generated ID
    userId: string                 ← Uploader's UID
    username: string               ← Uploader's display name
    subject: string                ← Normalized lowercase (for search)
    subjectDisplay: string         ← Original casing (for display)
    title: string
    description: string
    fileURL: string                ← Firebase Storage download URL
    fileName: string
    fileType: string               ← "pdf", "docx", "jpg", etc.
    fileSize: number               ← Bytes
    tags: string[]                 ← ["DSA", "OS", ...]
    rating: number                 ← Average (0-5)
    ratingSum: number              ← Sum of all ratings
    ratingCount: number            ← How many people rated
    ratedBy: string[]              ← UIDs of users who rated
    downloadCount: number
    createdAt: Timestamp
```

---

## 🔐 How Features Work

### Unique ID System
- On signup, `generateUniqueId()` creates a unique `USR-XXXXXX` string
- This is stored in Firestore and is the public-facing search ID
- Searching by ID → queries Firestore `where("uniqueId", "==", ...)`

### Subject Search
- Subject is stored in **two formats**:
  - `subject` → lowercase normalized → used for Firestore `where()` queries
  - `subjectDisplay` → original case → shown in UI
- This ensures "Data Structures" and "data structures" match the same notes

### Rating System
- Each note stores `ratingSum` and `ratingCount` separately
- Average = `ratingSum / ratingCount` (calculated server-side on update)
- `ratedBy` array prevents double-rating
- Users cannot rate their own notes

### Download Tracking
- Every download click increments `downloadCount` on the note
- Also increments `totalDownloads` on the note owner's user profile

### Profile Visibility
- `profileVisibility: "public"` → profile accessible via Unique ID search
- `profileVisibility: "private"` → only owner can view
- Security rules enforce this at the database level too

---

## 🧰 Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + React Router v6 |
| Styling | Tailwind CSS v3 |
| Auth | Firebase Authentication |
| Database | Firebase Firestore |
| File Storage | Firebase Storage |
| Hosting | Firebase Hosting |
| Notifications | react-hot-toast |
| File Upload | react-dropzone |
| Icons | lucide-react |

---

## 🐛 Common Issues & Fixes

**"Missing or insufficient permissions"**
→ Deploy Firestore security rules: `firebase deploy --only firestore:rules`

**"The query requires an index"**
→ Deploy indexes: `firebase deploy --only firestore:indexes` then wait 2-3 min

**Uploads failing**
→ Check Storage rules are deployed and file size is < 25MB

**Auth not persisting on refresh**
→ Firebase Auth persists by default. If not working, check `onAuthStateChanged` in AuthContext

**CORS errors on file download**
→ Firebase Storage handles CORS by default. If issues, configure CORS via Firebase CLI

---

## 🛣️ Future Improvements (Roadmap)

- [ ] Google OAuth login
- [ ] Full-text search using Algolia
- [ ] Note preview in-browser (PDF viewer)
- [ ] Comment system on notes
- [ ] Follow/unfollow users
- [ ] Email notifications
- [ ] Admin dashboard for moderation
- [ ] PWA support (offline access)
