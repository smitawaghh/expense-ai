import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAENqNuTZXTzoSbEHnLo7XDLzZYlcdmVeo",
  authDomain: "expense-ai-auth.firebaseapp.com",
  projectId: "expense-ai-auth",
  storageBucket: "expense-ai-auth.firebasestorage.app",
  messagingSenderId: "944048823302",
  appId: "1:944048823302:web:ce05b6aaf91bd87f957787",
  measurementId: "G-S8P03F5W2V"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// ✅ Add this to fix your error:
const auth = getAuth(app);

// ✅ Export auth so other files (like AuthContext.tsx) can use it:
export { auth };
