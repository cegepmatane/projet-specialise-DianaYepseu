import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBQ8lFsKkjKbLe3f96vDkh2O7vLBeOkJIo",
  authDomain: "cookieshop-c8501.firebaseapp.com",
  projectId: "cookieshop-c8501",
  storageBucket: "cookieshop-c8501.firebasestorage.app",
  messagingSenderId: "858539718084",
  appId: "1:858539718084:web:194a0536f6aadb042ea091",
  measurementId: "G-QNRYEDC26H",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
