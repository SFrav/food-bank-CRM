import React, { useState, useEffect } from "react";
import { Star } from "lucide-react";
import * as RadioGroup from "@radix-ui/react-radio-group";
import { cn } from "@/lib/utils";

export interface StarRatingProps {
  value?: number;
  onChange?: (value: number) => void;
  disabled?: boolean;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
}

const sizeMap = {
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6",
  xl: "w-8 h-8",
  "2xl": "w-10 h-10",
};

export function StarRating({
  value = 0,
  onChange,
  disabled,
  size = "md",
}: StarRatingProps) {
  const [internalValue, setInternal] = useState(value);
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  useEffect(() => {
    setInternal(value ?? 0);
  }, [value]);

  const currentValue = hoverValue ?? internalValue;

  const handleChange = (newVal: string) => {
    const num = parseFloat(newVal);
    if (!isNaN(num) && num >= 0 && num <= 5) {
      setInternal(num);
      onChange?.(num);
    }
  };

  const dimensionClass = sizeMap[size];

  return (
    <RadioGroup.Root
      value={internalValue.toString()}
      onValueChange={handleChange}
      disabled={disabled}
      className={cn(
        "inline-flex items-center gap-1",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      {Array.from({ length: 5 }, (_, starIndex) => {
        const starNumber = starIndex + 1;
        const leftValue = starNumber - 0.5;
        const rightValue = starNumber;

        const isLeftFilled = currentValue >= leftValue;
        const isRightFilled = currentValue >= rightValue;

        return (
          <div
            key={starIndex}
            className={cn("relative inline-flex items-center", dimensionClass)}
          >
            {/* Background Empty Star */}
            <Star
              className={cn("absolute inset-0 w-full h-full text-muted-foreground")}
              strokeWidth={1}
              fill="none"
            />

            {/* Left Half Interactive Radio Item */}
            <RadioGroup.Item
              value={leftValue.toString()}
              className={cn(
                "absolute left-0 top-0 w-1/2 h-full z-10 cursor-pointer focus:outline-none",
                disabled && "cursor-not-allowed pointer-events-none"
              )}
              onPointerEnter={() => !disabled && setHoverValue(leftValue)}
              onPointerLeave={() => !disabled && setHoverValue(null)}
            />

            {/* Right Half Interactive Radio Item */}
            <RadioGroup.Item
              value={rightValue.toString()}
              className={cn(
                "absolute right-0 top-0 w-1/2 h-full z-10 cursor-pointer focus:outline-none",
                disabled && "cursor-not-allowed pointer-events-none"
              )}
              onPointerEnter={() => !disabled && setHoverValue(rightValue)}
              onPointerLeave={() => !disabled && setHoverValue(null)}
            />

            {/* Filled State Overlay */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden flex">
              {isRightFilled ? (
                <Star
                  className={cn("w-full h-full text-primary shrink-0")}
                  strokeWidth={0}
                  fill="currentColor"
                />
              ) : isLeftFilled ? (
                <div className="w-1/2 h-full overflow-hidden relative">
                  <Star
                    className={cn("absolute left-0 top-0 text-primary", dimensionClass)}
                    style={{ width: "initial", maxWidth: "none" }}
                    strokeWidth={0}
                    fill="currentColor"
                  />
                </div>
              ) : null}
            </div>
          </div>
        );
      })}
    </RadioGroup.Root>
  );
}