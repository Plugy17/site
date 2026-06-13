import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, OAuthProvider } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyABKHaAdlSFq1KzURXmCF5Q-9xMUgE4Ot0",
  authDomain: "berry-game-4fa9b.firebaseapp.com",
  databaseURL: "https://berry-game-4fa9b-default-rtdb.firebaseio.com",
  projectId: "berry-game-4fa9b",
  storageBucket: "berry-game-4fa9b.firebasestorage.app",
  messagingSenderId: "736707445306",
  appId: "1:736707445306:web:87a61ea4b725bd3071eb03",
  measurementId: "G-LLJ9L848G0",
};

const app = initializeApp(firebaseConfig);
getAnalytics(app);
export const auth = getAuth(app);
export const db = getDatabase(app);
export const googleProvider = new GoogleAuthProvider();
export const appleProvider = new OAuthProvider('apple.com');
export default app;