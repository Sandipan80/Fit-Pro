// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBZsxTLtDkJ6ec_8dGmrHVm7YLV0c_0NW0",
  authDomain: "cursor-3359c.firebaseapp.com",
  projectId: "cursor-3359c",
  storageBucket: "cursor-3359c.firebasestorage.app",
  messagingSenderId: "511964313227",
  appId: "1:511964313227:web:99a0d87eb9dcf33519868e",
  measurementId: "G-PC3T5MRJNZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
