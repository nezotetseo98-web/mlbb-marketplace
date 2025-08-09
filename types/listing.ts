import type { Timestamp } from "firebase/firestore"

export type ListingStatus = "active" | "sold"

export type Listing = {
  id: string
  title: string
  description: string
  price: number
  imageUrls: string[]
  userId: string
  createdAt: Timestamp | null
  status?: ListingStatus
  soldAt?: Timestamp | null
}
