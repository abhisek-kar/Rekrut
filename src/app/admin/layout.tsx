"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { 
  Users, LayoutGrid, Briefcase, FileText, ContactRound, Box
} from "lucide-react";
import { PageLoader } from "@/components/atoms/loader";

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

  // If still loading or not authenticated, show loading screen
  if (isLoading || !isAuthenticated || (user && user.role !== "admin")) {
    return <PageLoader message="Loading admin dashboard..." />;
  }

  // Single unified navigation for admin (Settings moved to profile section)
  const navItems = [
    {
      title: "Dashboard",
      href: "/admin/dashboard",
      icon: LayoutGrid
    },
    {
      title: "Users",
      href: "/admin/users",
      icon: Users
    },
    {
      title: "Jobs",
      href: "/admin/jobs",
      icon: Briefcase
    },
    {
      title: "Candidates",
      href: "/admin/candidates",
      icon: ContactRound
    },
    {
      title: "Applications",
      href: "/admin/applications",
      icon: FileText
    },
  
  ];

  const userData = {
    name: user ? `${user.firstName} ${user.lastName}` : "Admin User",
    email: user?.email || "",
    avatar: user?.profilePhoto || "https://docs.material-tailwind.com/img/face-2.jpg",
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