import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyC3BfKa2IDbBYiCWpiwUw7me_G0a5VOT_s",
  authDomain: "attendence-tracker-90940.firebaseapp.com",
  projectId: "attendence-tracker-90940",
  storageBucket: "attendence-tracker-90940.firebasestorage.app",
  messagingSenderId: "575531776559",
  appId: "1:575531776559:web:fb14ef4839e1a79fa564da",
  measurementId: "G-BDEPT9DS5C"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);