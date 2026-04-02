/**
 * Batman AI - Skeleton Loader Component
 * Shimmer loading animation (dark gradient).
 */
import React from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "card" | "circle" | "chat";
}

export function Skeleton({ className, variant = "text" }: SkeletonProps) {
  const variants = {
    text: "h-4 w-full",
    card: "h-32 w-full rounded-xl",
    circle: "h-10 w-10 rounded-full",
    chat: "h-20 w-3/4 rounded-xl",
  };

  return (
    <div className={cn("skeleton", variants[variant], className)} />
  );
}

export function ChatSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <div className="flex justify-end">
        <Skeleton className="h-12 w-1/3 rounded-xl" />
      </div>
      <div className="flex justify-start">
        <Skeleton variant="chat" />
      </div>
      <div className="flex justify-end">
        <Skeleton className="h-10 w-1/4 rounded-xl" />
      </div>
      <div className="flex justify-start">
        <Skeleton variant="chat" className="w-2/3" />
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Skeleton variant="card" />
        <Skeleton variant="card" />
      </div>
      <Skeleton className="h-8 w-32" />
      <div className="space-y-3">
        <Skeleton variant="card" className="h-20" />
        <Skeleton variant="card" className="h-20" />
        <Skeleton variant="card" className="h-20" />
      </div>
    </div>
  );
}
