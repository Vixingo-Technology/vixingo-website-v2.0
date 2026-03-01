"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-bg-border/50",
        className
      )}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-bg-secondary border border-bg-border rounded-md p-6 space-y-4">
      <Skeleton className="h-40 w-full rounded-md" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-3 w-full" />
    </div>
  );
}
