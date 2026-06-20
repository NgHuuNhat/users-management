// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB2Ju7TRIEhkNaWSUjOgFy0AvyXKNDwHJs",
  authDomain: "users-management-33845.firebaseapp.com",
  projectId: "users-management-33845",
  storageBucket: "users-management-33845.firebasestorage.app",
  messagingSenderId: "415413195844",
  appId: "1:415413195844:web:512cb6adf1d35a748e9811",
  measurementId: "G-4PKWWMEQL8"

  // apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  // authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  // projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  // storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  // messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  // appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  // measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase server
const app = initializeApp(firebaseConfig);
// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

// Initialize Firebase client (analytics)
// const analytics = getAnalytics(app);
// export const analytics =
//   typeof window !== "undefined"
//     ? getAnalytics(app)
//     : null;

export default app