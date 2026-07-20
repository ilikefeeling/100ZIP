import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCOu3My4zjh6T5SCGP8sU5x-rLoQXzziqE",
  authDomain: import.meta.env.DEV ? "zip-85b02.firebaseapp.com" : "auth.100zip.com",
  projectId: "zip-85b02",
  storageBucket: "zip-85b02.firebasestorage.app",
  messagingSenderId: "363362535541",
  appId: "1:363362535541:web:6ed30259b31e7a6383503c",
  measurementId: "G-6J5RF9SPNE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// App Check disabled until a valid reCAPTCHA key is provided.

// Export Auth, Firestore, and Storage
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
