"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { getAuth, onAuthStateChanged, type User } from "firebase/auth"
import { ensureFirebaseApp, firebaseEnabled } from "@/lib/firebase"
import { doc, getDoc, getFirestore, serverTimestamp, setDoc } from "firebase/firestore"
import type { UserProfile } from "@/types/user"

type AuthContextValue = {
  user: User | null
  loading: boolean
  profile: UserProfile | null
  profileLoading: boolean
  refreshProfile?: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: false,
  profile: null,
  profileLoading: false,
})

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(firebaseEnabled)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState<boolean>(firebaseEnabled)

  const loadProfile = useCallback(async (u: User | null) => {
    if (!firebaseEnabled || !u) {
      setProfile(null)
      setProfileLoading(false)
      return
    }
    setProfileLoading(true)
    try {
      const app = ensureFirebaseApp()
      const db = getFirestore(app)
      const ref = doc(db, "users", u.uid)
      const snap = await getDoc(ref)
      if (snap.exists()) {
        const data = snap.data() as UserProfile
        // If missing displayName/photoURL/fullName, upsert from auth
        const patch: Partial<UserProfile> = {}
        if (!data.displayName && u.displayName) patch.displayName = u.displayName
        if (!data.photoURL && u.photoURL) patch.photoURL = u.photoURL
        if (!data.fullName && u.displayName) patch.fullName = u.displayName
        if (Object.keys(patch).length) {
          await setDoc(
            ref,
            {
              ...patch,
              updatedAt: serverTimestamp() as any,
            },
            { merge: true },
          )
          setProfile({ ...data, ...patch })
        } else {
          setProfile(data)
        }
      } else {
        // Seed a basic profile if missing
        const base: UserProfile = {
          uid: u.uid,
          email: u.email || "",
          displayName: u.displayName || "",
          photoURL: u.photoURL || "",
          role: "user",
          sellerStatus: "not_applied",
          fullName: u.displayName || undefined,
          createdAt: serverTimestamp() as any,
          updatedAt: serverTimestamp() as any,
        }
        await setDoc(ref, base, { merge: true })
        setProfile(base)
      }
    } finally {
      setProfileLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!firebaseEnabled) return
    const app = ensureFirebaseApp()
    const auth = getAuth(app)
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u)
      setLoading(false)
      await loadProfile(u)
    })
    return () => unsub()
  }, [loadProfile])

  const refreshProfile = useCallback(async () => {
    if (!user) return
    await loadProfile(user)
  }, [user, loadProfile])

  return (
    <AuthContext.Provider value={{ user, loading, profile, profileLoading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
