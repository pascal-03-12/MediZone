import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
// NEU: Importiere Cache-Funktionen
import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager 
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBx252bmRtCi8K2eTt2b2-qUdWonoIL7zU",
  authDomain: "medizone-3d975.firebaseapp.com",
  projectId: "medizone-3d975",
  storageBucket: "medizone-3d975.firebasestorage.app",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

// ÄNDERUNG: Statt getFirestore(app) nutzen wir initializeFirestore mit Config
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    // Erlaubt die Nutzung in mehreren Tabs gleichzeitig (sehr empfohlen)
    tabManager: persistentMultipleTabManager() 
  })
});

export default app;