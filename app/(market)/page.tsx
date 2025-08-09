"use client"

import { useEffect, useMemo, useState } from "react"
import { collection, onSnapshot, orderBy, query, getFirestore, where } from "firebase/firestore"
import type { Listing } from "@/types/listing"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { TriangleAlert, UserCheck2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import ListingGrid from "@/components/listing-grid"
import { firebaseEnabled, ensureFirebaseApp } from "@/lib/firebase"
import { useAuth } from "@/components/auth-provider"
import SearchFilter from "@/components/search-filter"
import SellerApplyDialog from "@/components/seller-apply-dialog"
import VerifiedSellersBar from "@/components/verified-sellers"

export default function Page() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)

  const { user, profile } = useAuth()
  const [applyOpen, setApplyOpen] = useState(false)

  // search and filter
  const [q, setQ] = useState("")
  const [range, setRange] = useState<[number, number]>([0, 1000])

  useEffect(() => {
    if (!firebaseEnabled) {
      setLoading(false)
      return
    }
    const app = ensureFirebaseApp()
    const db = getFirestore(app)
    const qy = query(collection(db, "listings"), where("status", "==", "active"), orderBy("createdAt", "desc"))
    const unsub = onSnapshot(
      qy,
      (snap) => {
        const items = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Listing, "id">) })) as Listing[]
        setListings(items)
        setLoading(false)
      },
      () => setLoading(false),
    )
    return () => unsub()
  }, [])

  const demoListings = useMemo<Listing[]>(
    () => [
      {
        id: "demo-1",
        title: "Mythic #120 ★ 70 Skins",
        description: "End-game account with meta heroes, exclusive skins, and high MMR. Secure and ready to transfer.",
        price: 299.0,
        imageUrls: ["/placeholder.svg?height=600&width=900"],
        userId: "demo",
        createdAt: null as any,
        status: "active",
      },
      {
        id: "demo-2",
        title: "Epic #50 • Clean History",
        description: "Solid mid-tier account. Main roles: Jungle/EXP. Original email available.",
        price: 129.0,
        imageUrls: ["/placeholder.svg?height=600&width=900"],
        userId: "demo",
        createdAt: null as any,
        status: "active",
      },
      {
        id: "demo-3",
        title: "Legend #80 • 40 Skins",
        description: "Balanced account, great for ranked grind.",
        price: 189.0,
        imageUrls: ["/placeholder.svg?height=600&width=900"],
        userId: "demo",
        createdAt: null as any,
        status: "active",
      },
    ],
    [],
  )

  const data = firebaseEnabled ? listings : demoListings
  const minPrice = useMemo(() => Math.min(...(data.map((d) => d.price) || [0, 1000])), [data])
  const maxPrice = useMemo(() => Math.max(...(data.map((d) => d.price) || [0, 1000])), [data])

  useEffect(() => {
    if (Number.isFinite(minPrice) && Number.isFinite(maxPrice)) {
      setRange([minPrice, maxPrice])
    }
  }, [minPrice, maxPrice])

  const filtered = useMemo(() => {
    const qLower = q.trim().toLowerCase()
    return data.filter((l) => {
      const matchQ =
        !qLower || l.title.toLowerCase().includes(qLower) || (l.description || "").toLowerCase().includes(qLower)
      const matchPrice = l.price >= range[0] && l.price <= range[1]
      return matchQ && matchPrice
    })
  }, [data, q, range])

  const canPost = !!profile && (profile.role === "admin" || profile.sellerStatus === "approved")
  const canApply = !!user && !!profile && profile.sellerStatus !== "approved"

  return (
    <div className="space-y-6">
      {!firebaseEnabled && (
        <Alert className="border-cyan-500/20 bg-cyan-500/5">
          <TriangleAlert className="h-4 w-4 text-cyan-400" />
          <AlertTitle className="text-cyan-300">Connect Firebase to enable real data</AlertTitle>
          <AlertDescription className="text-cyan-200/80">
            Set your NEXT_PUBLIC_FIREBASE_* keys to enable authentication, uploads, and live listings.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-balance bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-emerald-400 bg-clip-text text-2xl font-bold text-transparent sm:text-3xl">
            MLBB Account Marketplace
          </h1>
          <p className="mt-1 max-w-prose text-sm text-neutral-400">
            Buy and sell MLBB accounts in a sleek, secure, and fast marketplace.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canPost && (
            <Button
              asChild
              className="border-cyan-500/40 bg-neutral-900 text-cyan-300 hover:bg-neutral-800 hover:text-cyan-200"
            >
              <Link href="/new">Post a Listing</Link>
            </Button>
          )}
          {canApply && firebaseEnabled && (
            <Button
              onClick={() => setApplyOpen(true)}
              className="border-emerald-500/40 bg-neutral-900 text-emerald-300 hover:bg-neutral-800 hover:text-emerald-200"
            >
              <UserCheck2 className="mr-2 h-4 w-4" />
              Become a Seller
            </Button>
          )}
        </div>
      </div>

      {!!profile && firebaseEnabled && (
        <div className="flex flex-wrap items-center gap-2">
          {profile.sellerStatus === "approved" && (
            <Badge className="border-emerald-500/40 bg-emerald-500/15 text-emerald-300">Seller verified</Badge>
          )}
          {profile.sellerStatus === "pending" && (
            <Badge className="border-cyan-500/40 bg-cyan-500/15 text-cyan-300">Seller application pending</Badge>
          )}
          {profile.sellerStatus === "rejected" && (
            <Badge className="border-fuchsia-500/40 bg-fuchsia-500/15 text-fuchsia-300">
              Seller application rejected
            </Badge>
          )}
          {profile.role === "admin" && (
            <Badge className="border-fuchsia-500/40 bg-fuchsia-500/15 text-fuchsia-300">Admin</Badge>
          )}
        </div>
      )}

      <VerifiedSellersBar />

      <SearchFilter
        minPrice={Number.isFinite(minPrice) ? minPrice : 0}
        maxPrice={Number.isFinite(maxPrice) ? maxPrice : 1000}
        onSearchChange={setQ}
        onRangeChange={setRange}
      />

      <ListingGrid listings={filtered} loading={loading} />

      <SellerApplyDialog open={applyOpen} onOpenChange={setApplyOpen} />
    </div>
  )
}
