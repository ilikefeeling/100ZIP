import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCOu3My4zjh6T5SCGP8sU5x-rLoQXzziqE",
  authDomain: "zip-85b02.firebaseapp.com",
  projectId: "zip-85b02",
  storageBucket: "zip-85b02.firebasestorage.app",
  messagingSenderId: "363362535541",
  appId: "1:363362535541:web:6ed30259b31e7a6383503c",
  measurementId: "G-6J5RF9SPNE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize App Check (for local dev, define self.FIREBASE_APPCHECK_DEBUG_TOKEN)
// In production, you must set the actual reCAPTCHA v3 site key here.
if (typeof window !== "undefined") {
  // Uncomment and set this to true to enable debug tokens in local environment
  // self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
  try {
    initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider("YOUR_RECAPTCHA_V3_SITE_KEY_HERE"),
      isTokenAutoRefreshEnabled: true
    });
  } catch (e) {
    console.warn("App Check initialization failed or already initialized.", e);
  }
}

// Export Auth, Firestore, and Storage
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
