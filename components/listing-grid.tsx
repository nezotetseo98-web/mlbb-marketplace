"use client"

import ListingCard from "./listing-card"
import type { Listing } from "@/types/listing"

export default function ListingGrid({
  listings = [],
  loading = false,
}: {
  listings?: Listing[]
  loading?: boolean
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="aspect-[16/10] animate-pulse rounded-xl bg-neutral-900/70" />
        ))}
      </div>
    )
  }

  if (!listings.length) {
    return (
      <div className="grid place-items-center rounded-xl border border-neutral-800 bg-neutral-950/60 p-10 text-sm text-neutral-400">
        No listings yet. Be the first to post.
      </div>
    )
  }

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {listings.map((l) => (
        <ListingCard
          key={l.id}
          id={l.id}
          title={l.title}
          description={l.description}
          price={l.price}
          imageUrl={l.imageUrls?.[0]}
        />
      ))}
    </section>
  )
}
