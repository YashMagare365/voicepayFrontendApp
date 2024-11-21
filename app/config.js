import firebase from 'firebase/compat/app';
import 'firebase/compat/auth'; // Include if you use Firebase Authentication
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDlMMF65Uj1oCK-ZGrItXpHIWc5-Zx-8OE",
  authDomain: "voice-pay-ac033.firebaseapp.com",
  databaseURL: "https://voice-pay-ac033-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "voice-pay-ac033",
  storageBucket: "voice-pay-ac033.appspot.com",
  messagingSenderId: "1088783199521",
  appId: "1:1088783199521:web:f6351aaf960da67fe7a260",
  measurementId: "G-QQMSBHKXTT"
};

// Initialize Firebase app
const app = firebase.initializeApp(firebaseConfig);

// Get instances for database and storage
const db = getDatabase(app);
const storage = getStorage(app);

export { db, storage };
