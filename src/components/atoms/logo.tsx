import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type LogoSize = "sm" | "md" | "lg" | "xl";

interface LogoProps {
  size?: LogoSize;
  className?: string;
  asLink?: boolean;
}

export function Logo({ size = "md", className, asLink = true }: LogoProps) {
  // Define size classes
  const sizeClasses = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-3xl",
    xl: "text-4xl",
  };

  // Logo content component
  const LogoContent = () => (
    <div
      className={cn(
        "font-bold text-primary flex items-center",
        sizeClasses[size],
        className
      )}
    >
      <h1 className="text-primary">
        Rekrut<span className="text-gray-800"> ATS</span>
      </h1>
    </div>
  );

  // Return as link or div based on prop
  if (asLink) {
    return (
      <Link href="/" className="hover:opacity-90 transition-opacity">
        <LogoContent />
      </Link>
    );
  }

  return <LogoContent />;
}
