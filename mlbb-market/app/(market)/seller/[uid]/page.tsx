"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { ensureFirebaseApp, firebaseEnabled } from "@/lib/firebase"
import { collection, doc, getDoc, getDocs, getFirestore, query, where } from "firebase/firestore"
import type { UserProfile } from "@/types/user"
import type { Listing } from "@/types/listing"
import ListingGrid from "@/components/listing-grid"
import { Badge } from "@/components/ui/badge"
import { TriangleAlert } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function SellerDetailPage() {
  const params = useParams<{ uid: string }>()
  const uid = params?.uid
  const [seller, setSeller] = useState<UserProfile | null>(null)
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [found, setFound] = useState(true)

  const active = listings.filter((l) => (l.status ?? "active") === "active")
  const sold = listings.filter((l) => l.status === "sold")

  useEffect(() => {
    if (!uid) return
    if (!firebaseEnabled) {
      setFound(false)
      setLoading(false)
      return
    }
    const run = async () => {
      try {
        const app = ensureFirebaseApp()
        const db = getFirestore(app)
        const userRef = doc(db, "users", uid)
        const snap = await getDoc(userRef)
        if (!snap.exists()) {
          setFound(false)
          return
        }
        const profile = snap.data() as UserProfile
        setSeller(profile)
        const qy = query(collection(db, "listings"), where("userId", "==", uid))
        const lSnap = await getDocs(qy)
        const items = lSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Listing, "id">) })) as Listing[]
        items.sort((a, b) => {
          const ta = (a.createdAt as any)?.toMillis?.() ?? 0
          const tb = (b.createdAt as any)?.toMillis?.() ?? 0
          return tb - ta
        })
        setListings(items)
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [uid])

  if (!uid) return null

  if (!found) {
    return (
      <Alert className="border-fuchsia-500/20 bg-fuchsia-500/5">
        <TriangleAlert className="h-4 w-4 text-fuchsia-400" />
        <AlertTitle className="text-fuchsia-300">Seller not found</AlertTitle>
        <AlertDescription className="text-fuchsia-200/80">We couldn't find this seller.</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-balance bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-emerald-400 bg-clip-text text-2xl font-bold text-transparent sm:text-3xl">
          {seller?.fullName || seller?.email || "Seller"}
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {seller?.sellerStatus === "approved" && (
            <Badge className="rounded border-emerald-500/40 bg-emerald-500/15 px-2 py-0.5 text-[11px] text-emerald-300">
              Verified seller
            </Badge>
          )}
          {seller?.role === "admin" && (
            <Badge className="rounded border-fuchsia-500/40 bg-fuchsia-500/15 px-2 py-0.5 text-[11px] text-fuchsia-300">
              Admin
            </Badge>
          )}
        </div>
        <p className="mt-1 max-w-prose text-sm text-neutral-400">All listings by this seller.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-[16/10] animate-pulse rounded-xl bg-neutral-900/70" />
          ))}
        </div>
      ) : (
        <>
          <h2 className="text-sm font-semibold text-neutral-300">Active</h2>
          <ListingGrid listings={active} loading={false} />
          <h2 className="mt-6 text-sm font-semibold text-neutral-300">Sold</h2>
          {sold.length ? (
            <ListingGrid listings={sold} loading={false} />
          ) : (
            <div className="grid place-items-center rounded-xl border border-neutral-800 bg-neutral-950/60 p-10 text-sm text-neutral-400">
              No sold listings yet.
            </div>
          )}
        </>
      )}
    </div>
  )
}
