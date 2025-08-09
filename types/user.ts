import type { Timestamp } from "firebase/firestore"

export type SellerStatus = "not_applied" | "pending" | "approved" | "rejected"
export type UserRole = "user" | "seller" | "admin"

export type UserProfile = {
  uid: string
  email?: string
  // New fields from OAuth providers like Google:
  displayName?: string
  photoURL?: string

  // Existing seller fields:
  role: UserRole
  sellerStatus: SellerStatus
  fullName?: string
  contactNumber?: string
  governmentIdUrl?: string
  passportPhotoUrl?: string

  createdAt?: Timestamp
  updatedAt?: Timestamp
}
