
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';


const firebaseConfig = {
  apiKey: "AIzaSyBJmvbd-Qz-bRtqXavdwE3mWDqRxPhC7fw",
  authDomain: "pwaslide.firebaseapp.com",
  projectId: "pwaslide",
  storageBucket: "pwaslide.appspot.com",
  messagingSenderId: "446573800741",
  appId: "1:446573800741:web:222adb453513057232fecc",
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app); // Utilise uniquement Firestore
export const auth = getAuth(app);
