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
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

export default app