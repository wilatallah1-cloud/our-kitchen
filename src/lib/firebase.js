import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyAhuGlcyZvEbfY4dsWzeeSsHN8N-6vN5rg",
  authDomain: "our-kitchen-8086c.firebaseapp.com",
  projectId: "our-kitchen-8086c",
  storageBucket: "our-kitchen-8086c.firebasestorage.app",
  messagingSenderId: "667513701276",
  appId: "1:667513701276:web:a16ed7f39823874990be59",
}

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()
const auth = getAuth(app)
const db = getFirestore(app)
const storage = getStorage(app)

export { auth, db, storage }
export default app
