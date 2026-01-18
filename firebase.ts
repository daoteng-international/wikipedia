import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyBfQ7zCkz-RZ7V04u4qrPGEZdzvti9Ikyw",
    authDomain: "daoteng-9bbe9.firebaseapp.com",
    projectId: "daoteng-9bbe9",
    storageBucket: "daoteng-9bbe9.firebasestorage.app",
    messagingSenderId: "404364429356",
    appId: "1:404364429356:web:102305bba5de4233bb6989",
    measurementId: "G-E5EJQFDGDR"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export default app;
