"use client";

import React from "react";
import { cn } from "@/lib/utils";

// Loader size variants
type LoaderSize = "xs" | "sm" | "md" | "lg" | "xl";

// Loader style variants
type LoaderVariant = "spinner" | "dots" | "pulse" | "bars";

interface LoaderProps {
  size?: LoaderSize;
  variant?: LoaderVariant;
  className?: string;
  color?: "primary" | "secondary" | "white" | "muted";
}

interface GlobalLoaderProps extends LoaderProps {
  message?: string;
  fullScreen?: boolean;
  overlay?: boolean;
}

// Size mappings for different loader variants
const sizeClasses = {
  xs: {
    spinner: "h-4 w-4",
    dots: "h-4",
    pulse: "h-4 w-4",
    bars: "h-4",
  },
  sm: {
    spinner: "h-6 w-6",
    dots: "h-6",
    pulse: "h-6 w-6",
    bars: "h-6",
  },
  md: {
    spinner: "h-8 w-8",
    dots: "h-8",
    pulse: "h-8 w-8",
    bars: "h-8",
  },
  lg: {
    spinner: "h-12 w-12",
    dots: "h-12",
    pulse: "h-12 w-12",
    bars: "h-12",
  },
  xl: {
    spinner: "h-16 w-16",
    dots: "h-16",
    pulse: "h-16 w-16",
    bars: "h-16",
  },
};

// Color mappings
const colorClasses = {
  primary: "border-primary",
  secondary: "border-secondary",
  white: "border-white",
  muted: "border-muted-foreground",
};

// Base Loader Component
export function Loader({ 
  size = "md", 
  variant = "spinner", 
  className, 
  color = "primary" 
}: LoaderProps) {
  const sizeClass = sizeClasses[size][variant];
  const colorClass = colorClasses[color];

  if (variant === "spinner") {
    return (
      <div 
        className={cn(
          "animate-spin rounded-full border-t-2 border-b-2",
          sizeClass,
          colorClass,
          className
        )}
        role="status"
        aria-label="Loading"
      />
    );
  }

  if (variant === "dots") {
    return (
      <div className={cn("flex space-x-1", sizeClass, className)} role="status" aria-label="Loading">
        <div className={cn("rounded-full animate-bounce", colorClass.replace("border-", "bg-"), "h-2 w-2")} style={{ animationDelay: "0ms" }} />
        <div className={cn("rounded-full animate-bounce", colorClass.replace("border-", "bg-"), "h-2 w-2")} style={{ animationDelay: "150ms" }} />
        <div className={cn("rounded-full animate-bounce", colorClass.replace("border-", "bg-"), "h-2 w-2")} style={{ animationDelay: "300ms" }} />
      </div>
    );
  }

  if (variant === "pulse") {
    return (
      <div 
        className={cn(
          "animate-pulse rounded-full",
          colorClass.replace("border-", "bg-"),
          sizeClass,
          className
        )}
        role="status"
        aria-label="Loading"
      />
    );
  }

  if (variant === "bars") {
    return (
      <div className={cn("flex space-x-1", sizeClass, className)} role="status" aria-label="Loading">
        <div className={cn("animate-pulse", colorClass.replace("border-", "bg-"), "w-1 h-full")} style={{ animationDelay: "0ms" }} />
        <div className={cn("animate-pulse", colorClass.replace("border-", "bg-"), "w-1 h-full")} style={{ animationDelay: "150ms" }} />
        <div className={cn("animate-pulse", colorClass.replace("border-", "bg-"), "w-1 h-full")} style={{ animationDelay: "300ms" }} />
        <div className={cn("animate-pulse", colorClass.replace("border-", "bg-"), "w-1 h-full")} style={{ animationDelay: "450ms" }} />
      </div>
    );
  }

  return null;
}

// Global Loader Component
export function GlobalLoader({ 
  size = "lg", 
  variant = "spinner",
  className,
  color = "primary",
  message = "Loading...",
  fullScreen = false,
  overlay = false
}: GlobalLoaderProps) {
  const containerClasses = cn(
    "flex flex-col items-center justify-center",
    fullScreen ? "fixed inset-0 z-50" : "p-8",
    overlay && "bg-background/80 backdrop-blur-sm",
    className
  );

  return (
    <div className={containerClasses}>
      <Loader size={size} variant={variant} color={color} />
      {message && (
        <p className="mt-4 text-sm text-muted-foreground text-center">
          {message}
        </p>
      )}
    </div>
  );
}

// Page Loader Component (for page transitions)
export function PageLoader({ 
  message = "Loading page..." 
}: { 
  message?: string 
}) {
  return (
    <GlobalLoader
      size="lg"
      variant="spinner"
      color="primary"
      message={message}
      fullScreen={true}
      overlay={true}
    />
  );
}

// Section Loader Component (for loading sections within pages)
export function SectionLoader({ 
  message = "Loading...",
  height = "200px"
}: { 
  message?: string;
  height?: string;
}) {
  return (
    <div className="flex items-center justify-center" style={{ minHeight: height }}>
      <GlobalLoader
        size="md"
        variant="spinner"
        color="primary"
        message={message}
      />
    </div>
  );
}

// Button Loader Component (for loading buttons)
export function ButtonLoader({ 
  size = "sm" 
}: { 
  size?: LoaderSize 
}) {
  return (
    <Loader 
      size={size} 
      variant="spinner" 
      color="white"
      className="mr-2"
    />
  );
}

// Default export
export default Loader;