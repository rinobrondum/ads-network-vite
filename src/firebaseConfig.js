// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use.
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "ads-network-vite.firebaseapp.com",
  projectId: "ads-network-vite",
  storageBucket: "ads-network-vite.appspot.com",
  messagingSenderId: "892207831703",
  appId: "1:892207831703:web:46fff04d6e881f267ba7d2",
  databaseURL: "https://ads-network-vite.firebaseio.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Rename functions 
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
// Export functions
export { auth, db, storage };
