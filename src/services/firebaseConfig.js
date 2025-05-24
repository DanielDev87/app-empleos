import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import Constants from 'expo-constants';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA7WpFJX6iHAXZrXvXjHlxjrPXoHUZRbPg",
  authDomain: "proyecto-app-empleos.firebaseapp.com",
  projectId: "proyecto-app-empleos",
  storageBucket: "proyecto-app-empleos.appspot.com",  // URL directa del bucket
  messagingSenderId: "1048561511871",
  appId: "1:1048561511871:web:c5a8e63f4b4b2c9f05cca5"
};

// Initialize Firebase only if it hasn't been initialized
let app;
try {
  app = getApp();
} catch {
  app = initializeApp(firebaseConfig);
}

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Log configuration for debugging
console.log('Firebase configurado:', {
  app: app.name,
  bucket: firebaseConfig.storageBucket,
  platform: Constants.platform
});

export { auth, db, storage, app };