"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Users, LayoutGrid, Briefcase, FileText } from "lucide-react";
import { PageLoader } from "@/components/atoms/loader";

import { AppSidebar } from "@/components/shadcn-components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/shadcn-ui/sidebar";
import { useAuth } from "@/hooks/useAuth";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // We still use these to conditionally render the UI
  const { isAuthenticated, isLoading, user } = useAuth();

  // This check is good for UX to prevent content flicker
  if (isLoading) {
    return <PageLoader message="Authenticating..." />;
  }

  // This check ensures we don't render the layout for a split second
  // if the user is somehow unauthenticated on the client.
  // CRITICAL: We DO NOT redirect here. The middleware handles that.
  if (!isAuthenticated) {
    return <PageLoader message="Authenticating..." />; // Or return null
  }

  // --- If we reach this point, the user is authenticated ---

  const navItems = [
    {
      title: "Dashboard",
      href: "/admin/dashboard",
      icon: LayoutGrid,
    },
    {
      title: "Users",
      href: "/admin/users",
      icon: Users,
    },
    {
      title: "Jobs",
      href: "/admin/jobs",
      icon: Briefcase,
    },
    {
      title: "Applications",
      href: "/admin/applications",
      icon: FileText,
    },
  ];

  const userData = {
    name: user ? `${user.firstName} ${user.lastName}` : "Admin User",
    email: user?.email || "",
    avatar:
      user?.profilePhoto || "https://docs.material-tailwind.com/img/face-2.jpg",
  };

  return (
    <SidebarProvider>
      <AppSidebar navItems={navItems} userData={userData} />
      <SidebarInset className="bg-background">
        <div className="min-h-screen">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
