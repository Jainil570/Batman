/**
 * Batman AI - Glow Button Component
 * Animated CTA button with blue glow on hover.
 */
"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlowButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  type?: "button" | "submit";
}

export function GlowButton({
  children,
  onClick,
  className,
  variant = "primary",
  size = "md",
  disabled = false,
  type = "button",
}: GlowButtonProps) {
  const variants = {
    primary:
      "bg-[var(--color-accent-blue)] text-white hover:shadow-[0_0_25px_rgba(59,130,246,0.5)]",
    secondary:
      "bg-[var(--color-batman-panel)] text-[var(--color-batman-text)] border border-[var(--color-batman-border)] hover:border-[var(--color-accent-blue)] hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]",
    ghost:
      "bg-transparent text-[var(--color-batman-muted)] hover:text-[var(--color-accent-blue)] hover:bg-[var(--color-batman-panel)]",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-5 py-2.5 text-sm",
    lg: "px-8 py-3.5 text-base font-semibold",
  };

  return (
    <motion.button
      type={type}
      whileHover={{ scale: disabled ? 1 : 1.03 }}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "rounded-lg font-medium transition-all duration-300 inline-flex items-center justify-center gap-2",
        variants[variant],
        sizes[size],
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {children}
    </motion.button>
  );
}
