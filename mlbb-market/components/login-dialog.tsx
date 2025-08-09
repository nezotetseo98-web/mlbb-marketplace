"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ensureFirebaseApp, firebaseEnabled } from "@/lib/firebase"
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth"
import { TriangleAlert, Chrome } from "lucide-react"
import { doc, getFirestore, serverTimestamp, setDoc } from "firebase/firestore"

export default function LoginDialog({
  open = false,
  onOpenChange = () => {},
}: {
  open?: boolean
  onOpenChange?: (v: boolean) => void
}) {
  const [mode, setMode] = React.useState<"signin" | "signup">("signin")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const seedUserDoc = async (uid: string, values: Record<string, any>) => {
    const app = ensureFirebaseApp()
    const db = getFirestore(app)
    const ref = doc(db, "users", uid)
    await setDoc(
      ref,
      {
        uid,
        role: "user",
        sellerStatus: "not_applied",
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
        ...values,
      },
      { merge: true },
    )
  }

  const signInWithGoogle = async () => {
    if (!firebaseEnabled) return
    setLoading(true)
    setError(null)
    try {
      const app = ensureFirebaseApp()
      const auth = getAuth(app)
      const provider = new GoogleAuthProvider()
      const cred = await signInWithPopup(auth, provider)
      const user = cred.user
      await seedUserDoc(user.uid, {
        email: user.email || "",
        displayName: user.displayName || "",
        photoURL: user.photoURL || "",
        // Seed fullName if not set later; safe to default from displayName
        fullName: user.displayName || null,
      })
      onOpenChange(false)
    } catch (err: any) {
      setError(err?.message || "Google sign-in failed")
    } finally {
      setLoading(false)
    }
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!firebaseEnabled) return
    setLoading(true)
    setError(null)
    try {
      const app = ensureFirebaseApp()
      const auth = getAuth(app)
      if (mode === "signin") {
        await signInWithEmailAndPassword(auth, email, password)
      } else {
        const cred = await createUserWithEmailAndPassword(auth, email, password)
        await seedUserDoc(cred.user.uid, {
          email: cred.user.email || "",
        })
      }
      onOpenChange(false)
    } catch (err: any) {
      setError(err?.message || "Authentication failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-neutral-800 bg-neutral-950 text-neutral-100">
        <DialogHeader>
          <DialogTitle className="text-center">{mode === "signin" ? "Sign in" : "Create account"}</DialogTitle>
        </DialogHeader>

        {!firebaseEnabled && (
          <div className="flex items-center gap-2 rounded-md border border-cyan-500/20 bg-cyan-500/5 p-3 text-sm text-cyan-300">
            <TriangleAlert className="h-4 w-4" />
            Add Firebase config to enable authentication.
          </div>
        )}

        <div className="grid gap-3">
          <Button
            type="button"
            onClick={signInWithGoogle}
            disabled={loading || !firebaseEnabled}
            className="w-full border-cyan-500/40 bg-neutral-900 text-cyan-300 hover:bg-neutral-800 hover:text-cyan-200"
          >
            <Chrome className="mr-2 h-4 w-4" />
            Continue with Google
          </Button>

          <div className="relative py-1 text-center text-xs text-neutral-500">
            <span className="bg-neutral-950 px-2">or</span>
            <div className="absolute inset-x-0 top-1/2 -z-10 h-px -translate-y-1/2 bg-neutral-800" />
          </div>
        </div>

        <form onSubmit={submit} className="grid gap-3">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border-neutral-800 bg-neutral-900 placeholder:text-neutral-500"
              disabled={!firebaseEnabled}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border-neutral-800 bg-neutral-900 placeholder:text-neutral-500"
              disabled={!firebaseEnabled}
            />
          </div>

          {error && <p className="text-sm text-fuchsia-300">{error}</p>}

          <Button
            type="submit"
            disabled={loading || !firebaseEnabled}
            className="mt-1 w-full border-cyan-500/40 bg-neutral-900 text-cyan-300 hover:bg-neutral-800 hover:text-cyan-200"
          >
            {loading ? "Please wait..." : mode === "signin" ? "Sign in" : "Sign up"}
          </Button>

          <button
            type="button"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="text-xs text-neutral-400 underline underline-offset-4 hover:text-neutral-200"
          >
            {mode === "signin" ? "New here? Create an account" : "Already have an account? Sign in"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
