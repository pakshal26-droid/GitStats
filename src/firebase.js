// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCVCe2SbAQZ7-qy9wrPxSP3HmdPDFuAMRs",
  authDomain: "gitstats-d2f03.firebaseapp.com",
  projectId: "gitstats-d2f03",
  storageBucket: "gitstats-d2f03.firebasestorage.app",
  messagingSenderId: "863317107451",
  appId: "1:863317107451:web:9d52d6d5e74aafd5d1465e",
  measurementId: "G-ZES9EL31FC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const analytics = getAnalytics(app);

export { db };
