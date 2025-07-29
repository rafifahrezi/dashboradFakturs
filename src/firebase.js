// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyCOznGhV3uvyqOAViNIVujQJvZxhZliT2Y',
  authDomain: 'tutorial-ca7d7.firebaseapp.com',
  projectId: 'tutorial-ca7d7',
  storageBucket: 'tutorial-ca7d7.firebasestorage.app',
  messagingSenderId: '856649823221',
  appId: '1:856649823221:web:aedeb9350f2d5de227e6bc',
  measurementId: 'G-HN2K4J7VWS',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firestore instance
export const db = getFirestore(app);
