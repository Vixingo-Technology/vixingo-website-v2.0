import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className, hover = true }: CardProps) {
  return (
    <div
      className={cn(
        "bg-bg-secondary border border-bg-border rounded-md p-6",
        hover && "card-hover",
        className
      )}
    >
      {children}
    </div>
  );
}
