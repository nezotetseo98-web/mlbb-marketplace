import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency } from "@/utils/format"

export type ListingCardProps = {
  id?: string
  title?: string
  description?: string
  price?: number
  imageUrl?: string
}

export default function ListingCard({
  id = "demo",
  title = "MLBB Account",
  description = "High-rank account with exclusive skins.",
  price = 199,
  imageUrl = "/placeholder.svg?height=600&width=900",
}: ListingCardProps) {
  return (
    <Link href={"/listing/" + id} className="group block">
      <Card
        className="overflow-hidden border-neutral-800 bg-neutral-950/60 shadow-[0_0_0_0_rgba(34,211,238,0)]
        ring-1 ring-transparent transition-all duration-300 hover:shadow-[0_0_28px_-8px_rgba(34,211,238,0.45)]
        hover:ring-cyan-500/30"
      >
        <div className="relative aspect-[16/10] overflow-hidden">
          <img
            src={imageUrl || "/placeholder.svg"}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        </div>
        <CardContent className="space-y-2 p-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="line-clamp-1 text-sm font-semibold">{title}</h3>
            <div className="shrink-0 rounded-md bg-emerald-500/15 px-2 py-0.5 text-xs font-semibold text-emerald-300">
              {formatCurrency(price)}
            </div>
          </div>
          <p className="line-clamp-2 text-xs text-neutral-400">{description}</p>
        </CardContent>
      </Card>
    </Link>
  )
}
