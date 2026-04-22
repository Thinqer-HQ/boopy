"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  value: number;
  onChange: (next: number) => void;
};

const OPTIONS = [3, 6, 12];

export function PeriodFilter({ value, onChange }: Props) {
  return (
    <div className="flex gap-2">
      {OPTIONS.map((months) => (
        <Button
          key={months}
          variant="outline"
          size="sm"
          className={cn(value === months && "bg-muted")}
          onClick={() => onChange(months)}
        >
          {months}m
        </Button>
      ))}
    </div>
  );
}
