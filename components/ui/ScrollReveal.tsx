"use client";

import { useEffect, useRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "left" | "right";
}

export function ScrollReveal({
  children,
  className,
  delay = 0,
  direction = "up",
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            el.classList.add("opacity-100", "translate-y-0", "translate-x-0");
            const toRemove = [
              "opacity-0",
              direction === "up" ? "translate-y-6" : null,
              direction === "left" ? "-translate-x-6" : null,
              direction === "right" ? "translate-x-6" : null,
            ].filter(Boolean) as string[];
            el.classList.remove(...toRemove);
          }, delay);
          observer.unobserve(el);
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay, direction]);

  const initialClasses = {
    up: "opacity-0 translate-y-6",
    left: "opacity-0 -translate-x-6",
    right: "opacity-0 translate-x-6",
  };

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-500 ease-out",
        initialClasses[direction],
        className
      )}
    >
      {children}
    </div>
  );
}
