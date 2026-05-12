import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD3L9U7FGjt6UBY378WmGSYToBl4SECycE",
  authDomain: "sistema-agendamentos-9e620.firebaseapp.com",
  projectId: "sistema-agendamentos-9e620",
  storageBucket: "sistema-agendamentos-9e620.firebasestorage.app",
  messagingSenderId: "474988382530",
  appId: "1:474988382530:web:bad2a67782feae4544e0db"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);