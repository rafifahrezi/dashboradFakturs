// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from '@firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCOznGhV3uvyqOAViNIVujQJvZxhZliT2Y",
  authDomain: "tutorial-ca7d7.firebaseapp.com",
  projectId: "tutorial-ca7d7",
  storageBucket: "tutorial-ca7d7.firebasestorage.app",
  messagingSenderId: "856649823221",
  appId: "1:856649823221:web:aedeb9350f2d5de227e6bc",
  measurementId: "G-HN2K4J7VWS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const db = getFirestore();