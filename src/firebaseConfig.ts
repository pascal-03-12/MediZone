import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';        // Neu: Für Login
import { getFirestore } from 'firebase/firestore';
// TODO: Replace the following with your app's Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyBx252bmRtCi8K2eTt2b2-qUdWonoIL7zU",
  authDomain: "medizone-3d975.firebaseapp.com",
  projectId: "medizone-3d975",
  storageBucket: "medizone-3d975.firebasestorage.app",
}

const app = initializeApp(firebaseConfig);

// Initialisiert die Dienste und exportiert sie für die App
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;