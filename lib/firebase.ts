import { initializeApp, type FirebaseApp, getApps } from "firebase/app"

const cfg = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
}

export const firebaseEnabled =
  !!cfg.apiKey && !!cfg.authDomain && !!cfg.projectId && !!cfg.storageBucket && !!cfg.messagingSenderId && !!cfg.appId

let appRef: FirebaseApp | null = null

export function ensureFirebaseApp(): FirebaseApp {
  if (!firebaseEnabled) {
    throw new Error("Firebase config is missing. Add NEXT_PUBLIC_FIREBASE_* env vars.")
  }
  if (appRef) return appRef
  const existing = getApps()
  appRef = existing.length ? existing[0] : initializeApp(cfg)
  return appRef
}
