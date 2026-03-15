"use client";

import { ReactNode, useEffect } from "react";
import { cn } from "@/lib/utils";

interface ModalProps {
    isOpen?: boolean;
    open?: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
    className?: string;
}

export function Modal({
    isOpen,
    open,
    onClose,
    title,
    children,
    className,
}: ModalProps) {
    const isModalOpen = isOpen ?? open ?? false;

    useEffect(() => {
        document.body.style.overflow = isModalOpen ? "hidden" : "";
        return () => {
            document.body.style.overflow = "";
        };
    }, [isModalOpen]);

    if (!isModalOpen) return null;

    return (
        <div
            className={cn(
                "fixed inset-0 z-50 flex items-center justify-center p-4",
                "animate-fade-in",
            )}
        >
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />
            <div
                className={cn(
                    "relative bg-bg-secondary border border-bg-border rounded-lg p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto shadow-xl",
                    className,
                )}
            >
                {title && (
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-heading font-bold">
                            {title}
                        </h3>
                        <button
                            onClick={onClose}
                            className="text-text-muted hover:text-text-primary transition-colors"
                        >
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                )}
                {children}
            </div>
        </div>
    );
}
