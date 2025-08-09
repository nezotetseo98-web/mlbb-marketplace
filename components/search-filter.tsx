"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { useEffect, useMemo, useState } from "react"

export type SearchFilterProps = {
  minPrice?: number
  maxPrice?: number
  onSearchChange?: (q: string) => void
  onRangeChange?: (range: [number, number]) => void
}

export default function SearchFilter({
  minPrice = 0,
  maxPrice = 1000,
  onSearchChange = () => {},
  onRangeChange = () => {},
}: SearchFilterProps) {
  const [q, setQ] = useState("")
  const [range, setRange] = useState<[number, number]>([minPrice, maxPrice])

  useEffect(() => {
    setRange([minPrice, maxPrice])
  }, [minPrice, maxPrice])

  useEffect(() => {
    onSearchChange(q)
  }, [q, onSearchChange])

  useEffect(() => {
    onRangeChange(range)
  }, [range, onRangeChange])

  const pretty = useMemo(
    () => ({
      min: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(
        range[0],
      ),
      max: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(
        range[1],
      ),
    }),
    [range],
  )

  return (
    <div className="grid gap-3 rounded-xl border border-neutral-800 bg-neutral-950/60 p-4">
      <div className="grid gap-2">
        <Label htmlFor="search">Search</Label>
        <Input
          id="search"
          placeholder="Search by title or description..."
          className="border-neutral-800 bg-neutral-900 placeholder:text-neutral-500"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <div className="mt-2 grid gap-2">
        <div className="flex items-center justify-between text-sm">
          <Label>Price range</Label>
          <div className="text-neutral-300">
            {pretty.min} – {pretty.max}
          </div>
        </div>
        <Slider
          min={minPrice}
          max={maxPrice}
          step={1}
          value={range}
          onValueChange={(v) => setRange([v[0], v[1]] as [number, number])}
          className="[--track-bg:rgba(34,211,238,0.15)] [--thumb:rgba(34,211,238,0.9)]"
        />
      </div>
    </div>
  )
}
