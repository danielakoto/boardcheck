// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
   apiKey: "AIzaSyA4hLmQ8B43Q0dBZ_T8tdxmlEoBiakSLAI",
   authDomain: "boardcheck-5d311.firebaseapp.com",
   projectId: "boardcheck-5d311",
   storageBucket: "boardcheck-5d311.firebasestorage.app",
   messagingSenderId: "91837916881",
   appId: "1:91837916881:web:135fae28ec06114b6987f0",
   measurementId: "G-NES43QCLWB"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);