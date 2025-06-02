import React from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/shadcn-ui/sidebar";

// Import the SVG logo
import LogoSVG from "@/assets/logo.svg";

type LogoSize = "sm" | "md" | "lg" | "xl";

interface LogoProps {
  size?: LogoSize;
  className?: string;
  asLink?: boolean;
  hideTextInSidebar?: boolean;
}

export function Logo({
  size = "md",
  className,
  asLink = true,
  hideTextInSidebar = false,
}: LogoProps) {
  // Call hook at top level, but handle the error case
  let sidebarState = null;
  let sidebarError = false;

  try {
    const sidebar = useSidebar();
    sidebarState = sidebar.state;
  } catch {
    sidebarError = true;
  }

  // Define size classes
  const sizeClasses = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-3xl",
    xl: "text-4xl",
  };

  // Define logo size dimensions
  const logoDimensions = {
    sm: { width: 32, height: 34 },
    md: { width: 36, height: 38 },
    lg: { width: 42, height: 45 },
    xl: { width: 52, height: 56 },
  };

  // In a collapsed sidebar, only show the icon
  const isCollapsedSidebar =
    !sidebarError && sidebarState === "collapsed" && hideTextInSidebar;

  // Logo content component
  const LogoContent = () => (
    <div
      className={cn(
        "font-bold flex items-center gap-2",
        sizeClasses[size],
        className
      )}
    >
      {/* SVG Logo */}
      <Image
        src={LogoSVG}
        alt="Rekrut Logo"
        width={logoDimensions[size].width}
        height={logoDimensions[size].height}
        className="transition-all duration-200"
      />

      {/* Text Logo - hide when sidebar is collapsed */}
      {!isCollapsedSidebar && (
        <h1 className="text-primary whitespace-nowrap transition-opacity duration-200 group-data-[collapsible=icon]:opacity-0">
          Rekrut<span className="text-gray-800"> ATS</span>
        </h1>
      )}
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
