"use client";

import { cn } from "@/lib/utils";

interface StatCardProps {
  value: string;
  label: string;
  icon?: React.ReactNode;
  className?: string;
}

export function StatCard({ value, label, icon, className }: StatCardProps) {
  return (
    <div
      className={cn(
        "bg-bg-secondary border border-bg-border rounded-md p-6 text-center",
        className
      )}
    >
      {icon && <div className="flex justify-center mb-2 text-accent-gold">{icon}</div>}
      <div className="text-3xl font-bold font-heading text-accent-gold">{value}</div>
      <div className="text-sm text-text-secondary mt-1">{label}</div>
    </div>
  );
}
