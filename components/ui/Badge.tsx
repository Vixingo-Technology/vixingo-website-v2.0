import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "gold" | "danger" | "success" | "info";
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  const variants = {
    default: "bg-bg-elevated text-text-secondary border-bg-border",
    gold: "bg-accent-gold/10 text-accent-gold border-accent-gold/30",
    danger: "bg-danger/10 text-danger border-danger/30",
    success: "bg-success/10 text-success border-success/30",
    info: "bg-info/10 text-info border-info/30",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
