"use client";

import * as React from "react";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

import { NavMain } from "@/components/shadcn-components/nav-main";
import { NavUser } from "@/components/shadcn-components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/shadcn-ui/sidebar";
import { Logo } from "@/components/atoms/logo";
import { Button } from "@/components/shadcn-ui/button";
import { useAuth } from "@/context/AuthContext";

export function AppSidebar({ 
  navItems = [],
  userData = null,
  ...props 
}: React.ComponentProps<typeof Sidebar> & {
  navItems?: any[];
  userData?: { name: string; email: string; avatar: string } | null;
}) {
  const { logout } = useAuth();
  const router = useRouter();

  // Default nav items if none are provided
  const defaultNavItems = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: () => <span className="h-4 w-4">📊</span>,
      isActive: true,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: () => <span className="h-4 w-4">⚙️</span>,
    },
  ];

  // Default user data if none is provided
  const defaultUserData = {
    name: "User",
    email: "user@example.com",
    avatar: "/avatars/user.png",
  };

  const items = navItems.length > 0 ? navItems : defaultNavItems;
  const user = userData || defaultUserData;

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="flex justify-center py-4">
        <Logo size="lg" />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={items} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
        <div className="px-2 pb-4">
          <Button 
            variant="outline" 
            className="w-full justify-start" 
            size="sm"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </Button>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
