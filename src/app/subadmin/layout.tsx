"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { 
  Briefcase, LayoutDashboard, FileText, 
  UserCircle, CheckSquare, FileBarChart2, CalendarCheck,
  Bell, Settings
} from "lucide-react";

import { AppSidebar } from "@/components/shadcn-components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/shadcn-ui/sidebar";
import { useAuth } from "@/context/AuthContext";

export default function SubAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Redirect if not authenticated or not a subadmin
  React.useEffect(() => {
    if (!isLoading && (!isAuthenticated || (user && user.role !== "subadmin"))) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router, user]);

  // If still loading or not authenticated, show nothing
  if (isLoading || !isAuthenticated || (user && user.role !== "subadmin")) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // Navigation items for subadmin - match the same structure as admin
  const navItems = [
    {
      title: "Dashboard",
      url: "/subadmin/dashboard",
      icon: LayoutDashboard,
      isActive: pathname === "/subadmin/dashboard"
    },
    {
      title: "Jobs",
      url: "/subadmin/jobs",
      icon: Briefcase,
      isActive: pathname.startsWith("/subadmin/jobs"),
      badge: "12" // This would be dynamic in a real implementation
    },
    {
      title: "Applications",
      url: "/subadmin/applications",
      icon: FileText,
      isActive: pathname.startsWith("/subadmin/applications"),
      badge: "24" // This would be dynamic in a real implementation
    },
    {
      title: "Candidates",
      url: "/subadmin/candidates",
      icon: UserCircle,
      isActive: pathname.startsWith("/subadmin/candidates")
    },
    {
      title: "Interviews",
      url: "/subadmin/interviews",
      icon: CalendarCheck,
      isActive: pathname.startsWith("/subadmin/interviews")
    },
    {
      title: "Tasks",
      url: "/subadmin/tasks",
      icon: CheckSquare,
      isActive: pathname.startsWith("/subadmin/tasks"),
      badge: "5" // This would be dynamic in a real implementation
    },
    {
      title: "Reports",
      url: "/subadmin/reports",
      icon: FileBarChart2,
      isActive: pathname.startsWith("/subadmin/reports")
    },
    {
      title: "Notifications",
      url: "/subadmin/notifications",
      icon: Bell,
      isActive: pathname.startsWith("/subadmin/notifications"),
      badge: "3" // This would be dynamic in a real implementation
    },
    {
      title: "Settings",
      url: "/subadmin/profile/settings",
      icon: Settings,
      isActive: pathname.startsWith("/subadmin/profile/settings")
    }
  ];

  const userData = {
    name: user ? `${user.firstName} ${user.lastName}` : "SubAdmin User",
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
