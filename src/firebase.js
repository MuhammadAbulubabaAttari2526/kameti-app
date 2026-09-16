import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyC502LUYaUErGskXF3kQtNBBa-a5gEOsKE',
  authDomain: 'committee-app-11cf8.firebaseapp.com',
  projectId: 'committee-app-11cf8',
  storageBucket: 'committee-app-11cf8.firebasestorage.app',
  messagingSenderId: '534059750392',
  appId: '1:534059750392:web:4071f528b3033905b73c0d',
};

const firebaseApp = initializeApp(firebaseConfig);

export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });
