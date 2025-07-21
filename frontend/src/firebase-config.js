// src/firebase-config.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

//  Your Firebase config object
const firebaseConfig = {
  apiKey: "AIzaSyAENqNuTZXTzoSbEHnLo7XDLzZYlcdmVeo",
  authDomain: "expense-ai-auth.firebaseapp.com",
  projectId: "expense-ai-auth",
  storageBucket: "expense-ai-auth.firebasestorage.app",
  messagingSenderId: "944048823302",
  appId: "1:944048823302:web:ce05b6aaf91bd87f957787",
  measurementId: "G-S8P03F5W2V"
};


const app = initializeApp(firebaseConfig);


export const auth = getAuth(app);