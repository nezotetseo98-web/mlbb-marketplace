import type React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import Header from "@/components/header"
import AuthProvider from "@/components/auth-provider"

export const metadata = {
  title: "MLBB Account Marketplace",
  description: "Buy & sell MLBB accounts. Fast, sleek, and secure.",
}

export default function MarketLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className={cn("min-h-dvh bg-neutral-950 text-neutral-100 antialiased")}>
        <Header />
        <main className="mx-auto w-full max-w-7xl px-4 pb-10 pt-6 md:px-6">{children}</main>
        <footer className="border-t border-neutral-800/80">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-2 px-4 py-6 text-xs text-neutral-400 md:px-6">
            <p className="opacity-80">
              {"© "}
              {new Date().getFullYear()} MLBB Market
            </p>
            <div className="flex items-center gap-4">
              <Link href="/" className="hover:text-neutral-200 transition-colors">
                Browse
              </Link>
              <Link href="/new" className="hover:text-neutral-200 transition-colors">
                New Listing
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </AuthProvider>
  )
}
