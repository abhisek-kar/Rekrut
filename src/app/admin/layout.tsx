"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { 
  Users, LayoutDashboard, Briefcase, 
  UserCircle, FileText, Bell
} from "lucide-react";

import { AppSidebar } from "@/components/shadcn-components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/shadcn-ui/sidebar";
import { useAuth } from "@/context/AuthContext";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Redirect if not authenticated or not an admin
  React.useEffect(() => {
    if (!isLoading && (!isAuthenticated || (user && user.role !== "admin"))) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router, user]);

  // If still loading or not authenticated, show nothing
  if (isLoading || !isAuthenticated || (user && user.role !== "admin")) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // Single unified navigation for admin (Settings moved to profile section)
  const navItems = [
    {
      title: "Dashboard",
      url: "/admin/dashboard",
      icon: LayoutDashboard,
      isActive: pathname === "/admin/dashboard"
    },
    {
      title: "Users",
      url: "/admin/users",
      icon: Users,
      isActive: pathname.startsWith("/admin/users")
    },
    {
      title: "Jobs",
      url: "/admin/jobs",
      icon: Briefcase,
      isActive: pathname.startsWith("/admin/jobs")
    },
    {
      title: "Candidates",
      url: "/admin/candidates",
      icon: UserCircle,
      isActive: pathname.startsWith("/admin/candidates")
    },
    {
      title: "Applications",
      url: "/admin/applications",
      icon: FileText,
      isActive: pathname.startsWith("/admin/applications")
    },
    {
      title: "Notifications",
      url: "/admin/notifications",
      icon: Bell,
      isActive: pathname.startsWith("/admin/notifications"),
      badge: "4" // This would be dynamic in real implementation
    }
  ];

  const userData = {
    name: user ? `${user.firstName} ${user.lastName}` : "Admin User",
    email: user?.email || "",
    avatar: user?.profilePhoto || "/avatars/default.png",
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