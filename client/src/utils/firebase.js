
import { initializeApp } from "firebase/app";
import {getAuth, GoogleAuthProvider} from "firebase/auth"

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "interviewiq-8e01c.firebaseapp.com",
  projectId: "interviewiq-8e01c",
  storageBucket: "interviewiq-8e01c.firebasestorage.app",
  messagingSenderId: "505210014828",
  appId: "1:505210014828:web:7bbf0a334001fd0c5e1c49"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app)

const provider = new GoogleAuthProvider();

provider.setCustomParameters({
  prompt: "select_account",
});

export { auth, provider };