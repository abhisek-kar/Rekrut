"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { 
  Briefcase, LayoutDashboard, FileText, 
  UserCircle, CheckSquare, FileBarChart2, CalendarCheck,
  Bell
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

  // Single unified navigation for subadmin (Settings moved to profile section)
  const navItems = [
    {
      title: "Dashboard",
      href: "/subadmin/dashboard",
      icon: LayoutDashboard
    },
    {
      title: "Jobs",
      href: "/subadmin/jobs",
      icon: Briefcase,
      label: "12" // This would be dynamic in a real implementation
    },
    {
      title: "Applications",
      href: "/subadmin/applications",
      icon: FileText,
      label: "24" // This would be dynamic in a real implementation
    },
    {
      title: "Candidates",
      href: "/subadmin/candidates",
      icon: UserCircle
    },
    {
      title: "Interviews",
      href: "/subadmin/interviews",
      icon: CalendarCheck
    },
    {
      title: "Tasks",
      href: "/subadmin/tasks",
      icon: CheckSquare,
      label: "5" // This would be dynamic in a real implementation
    },
    {
      title: "Reports",
      href: "/subadmin/reports",
      icon: FileBarChart2
    },
    {
      title: "Notifications",
      href: "/subadmin/notifications",
      icon: Bell,
      label: "3" // This would be dynamic in a real implementation
    }
  ];

  const userData = {
    name: user ? `${user.firstName} ${user.lastName}` : "SubAdmin User",
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