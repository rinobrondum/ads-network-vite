// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use.
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBdfRuTCBusXX4xcBZ2oZdoA88N2eeLx5E",
  authDomain: "ads-network-vite---v2.firebaseapp.com",
  projectId: "ads-network-vite---v2",
  storageBucket: "ads-network-vite---v2.appspot.com",
  messagingSenderId: "668094578404",
  appId: "1:668094578404:web:9e8b246ee35e9f83aeb6f1",
  databaseURL: "https://ads-network-vite---v2.firebaseio.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Rename functions 
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
// Export functions
export { auth, db, storage };
