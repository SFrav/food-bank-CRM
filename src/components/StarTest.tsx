import { useState } from "react"
import { StarRating } from "@/components/ui/star-rating"

export function StarTest() {
  const [rating, setRating] = useState(3.5)

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-semibold">Rate this recipe</h2>

      <StarRating
        value={rating}
        onChange={setRating}
        size="xl"            // optional – "sm", "md", "xl", "2xl"
      />

      <p className="text-sm text-muted-foreground">
        Current rating: <strong>{rating}</strong> stars
      </p>
    </div>
  )
}