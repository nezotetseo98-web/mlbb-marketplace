"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut, Plus, Shield, ShoppingBag } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import LoginDialog from "@/components/login-dialog"
import { useState, useMemo } from "react"
import { ensureFirebaseApp, firebaseEnabled } from "@/lib/firebase"
import { getAuth, signOut } from "firebase/auth"
import { cn } from "@/lib/utils"

const NavLink = ({ href, label, hidden = false }: { href: string; label: string; hidden?: boolean }) => {
  const pathname = usePathname()
  const active = pathname === href
  if (hidden) return null
  return (
    <Link
      href={href}
      className={cn(
        "rounded-md px-3 py-1.5 text-sm transition-colors",
        active ? "text-cyan-300" : "text-neutral-400 hover:text-neutral-200",
      )}
    >
      {label}
    </Link>
  )
}

export default function Header() {
  const { user, profile } = useAuth()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const canPost = useMemo(
    () => !!profile && (profile.role === "admin" || profile.sellerStatus === "approved"),
    [profile],
  )

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-900/80 bg-neutral-950/80 backdrop-blur supports-[backdrop-filter]:bg-neutral-950/60">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-2 px-4 md:px-6">
        <Link href="/" className="group flex items-center gap-2">
          <span className="relative grid size-8 place-content-center rounded-md border border-cyan-500/30 bg-neutral-900 text-cyan-300 shadow-[0_0_20px_-8px_rgba(34,211,238,0.7)] ring-1 ring-cyan-500/20 transition group-hover:shadow-[0_0_24px_-6px_rgba(34,211,238,0.9)]">
            <Shield className="h-4 w-4" />
          </span>
          <span className="bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-emerald-400 bg-clip-text text-sm font-semibold text-transparent sm:text-base">
            MLBB Market
          </span>
        </Link>

        <nav className="hidden items-center gap-2 sm:flex">
          <NavLink href="/" label="Browse" />
          <NavLink href="/sellers" label="Verified Sellers" />
          <NavLink href="/new" label="New Listing" hidden={!canPost} />
        </nav>

        <div className="flex items-center gap-2">
          {canPost && (
            <Button
              asChild
              size="sm"
              className="hidden border-cyan-500/40 bg-neutral-900 text-cyan-300 hover:bg-neutral-800 hover:text-cyan-200 md:inline-flex"
            >
              <Link href="/new">
                <Plus className="mr-1.5 h-4 w-4" />
                Post
              </Link>
            </Button>
          )}

          {!firebaseEnabled ? (
            <Button
              size="sm"
              className="border-cyan-500/40 bg-neutral-900 text-cyan-300 hover:bg-neutral-800 hover:text-cyan-200"
              onClick={() => router.push("/")}
            >
              <ShoppingBag className="mr-1.5 h-4 w-4" />
              Demo
            </Button>
          ) : user ? (
            <Button
              size="sm"
              variant="outline"
              className="border-fuchsia-500/40 bg-neutral-900 text-fuchsia-300 hover:bg-neutral-800 hover:text-fuchsia-200"
              onClick={async () => {
                const app = ensureFirebaseApp()
                const auth = getAuth(app)
                await signOut(auth)
                router.push("/")
              }}
            >
              <LogOut className="mr-1.5 h-4 w-4" />
              Sign out
            </Button>
          ) : (
            <Button
              size="sm"
              className="border-cyan-500/40 bg-neutral-900 text-cyan-300 hover:bg-neutral-800 hover:text-cyan-200"
              onClick={() => setOpen(true)}
            >
              Sign in
            </Button>
          )}
        </div>
      </div>
      <LoginDialog open={open} onOpenChange={setOpen} />
    </header>
  )
}
