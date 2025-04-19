"use client";

import * as React from "react";
import { LogOut, Settings, Users, Briefcase, LineChart, Bell, FileText, Search } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

import { NavMain } from "@/components/shadcn-components/nav-main";
import { NavUser } from "@/components/shadcn-components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarSeparator,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/shadcn-ui/sidebar";
import { Logo } from "@/components/atoms/logo";
import { Input } from "@/components/shadcn-ui/input";
import { Badge } from "@/components/shadcn-ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { LogoutButton } from "./logout-button";
import Link from "next/link";

export function AppSidebar({ 
  navItems = [],
  userData = null,
  ...props 
}: React.ComponentProps<typeof Sidebar> & {
  navItems?: any[];
  userData?: { name: string; email: string; avatar: string } | null;
}) {
  const { user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  
  // Get user's role to determine which menu items to show
  const isAdmin = user?.role === 'admin';

  // Dynamic menu items for admin
  const adminItems = [
    {
      title: "Dashboard",
      url: "/admin/dashboard",
      icon: LineChart,
      isActive: pathname === '/admin/dashboard',
    },
    {
      title: "Users",
      url: "/admin/users",
      icon: Users,
      isActive: pathname?.startsWith('/admin/users'),
    },
    {
      title: "Jobs",
      url: "/admin/jobs",
      icon: Briefcase,
      isActive: pathname?.startsWith('/admin/jobs'),
      badge: "12",
    },
    {
      title: "Candidates",
      url: "/admin/candidates",
      icon: Users,
      isActive: pathname?.startsWith('/admin/candidates'),
      badge: "86",
    },
    {
      title: "Applications",
      url: "/admin/applications",
      icon: FileText,
      isActive: pathname?.startsWith('/admin/applications'),
      badge: "24",
    },
    {
      title: "Settings",
      url: "/admin/settings",
      icon: Settings,
      isActive: pathname?.startsWith('/admin/settings'),
    },
  ];

  // Dynamic menu items for subadmin
  const subadminItems = [
    {
      title: "Dashboard",
      url: "/subadmin/dashboard",
      icon: LineChart,
      isActive: pathname === '/subadmin/dashboard',
    },
    {
      title: "Jobs",
      url: "/subadmin/jobs",
      icon: Briefcase,
      isActive: pathname?.startsWith('/subadmin/jobs'),
      badge: "8",
    },
    {
      title: "Applications",
      url: "/subadmin/applications",
      icon: FileText,
      isActive: pathname?.startsWith('/subadmin/applications'),
      badge: "32",
    }
  ];

  // Default user data if none is provided
  const defaultUserData = {
    name: user?.firstName ? `${user.firstName} ${user.lastName}` : "User",
    email: user?.email || "user@example.com",
    avatar: user?.profilePhoto || "/avatars/default.png",
  };

  const items = isAdmin ? adminItems : subadminItems;
  const userProfile = userData || defaultUserData;

  return (
    <Sidebar className="border-r border-border" collapsible="icon" {...props}>
      <SidebarHeader className="flex flex-col items-center py-6 px-2">
        <div className="w-full flex justify-center mb-4">
          <Logo size="lg" hideTextInSidebar={true} />
        </div>
        
        <div className="w-full px-2 relative">
          <Input 
            placeholder="Search..." 
            className="pl-8 bg-background/50 border-border/50 focus:border-primary" 
          />
          <Search className="absolute left-4 top-2.5 h-4 w-4 text-muted-foreground" />
        </div>
      </SidebarHeader>
      
      <SidebarSeparator />
      
      <SidebarContent className="px-2 py-2">
        <SidebarGroup>
          <SidebarGroupLabel>Main Navigation</SidebarGroupLabel>
          <SidebarMenu>
            {items.map((item, index) => (
              <SidebarMenuItem key={index}>
                <Link href={item.url} className="w-full">
                  <SidebarMenuButton 
                    asChild 
                    isActive={item.isActive}
                    tooltip={item.title}
                    className="w-full transition-colors"
                  >
                    <div className="flex items-center w-full justify-between">
                      <div className="flex items-center">
                        <item.icon className="h-5 w-5 mr-3" />
                        <span>{item.title}</span>
                      </div>
                      {item.badge && (
                        <Badge 
                          variant={item.isActive ? "default" : "secondary"} 
                          className="ml-auto text-xs h-5"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
        
        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>System</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <Link href="/admin/notifications" className="w-full">
                  <SidebarMenuButton 
                    asChild 
                    isActive={pathname?.startsWith('/admin/notifications')}
                    tooltip="Notifications"
                    className="w-full transition-colors"
                  >
                    <div className="flex items-center w-full justify-between">
                      <div className="flex items-center">
                        <Bell className="h-5 w-5 mr-3" />
                        <span>Notifications</span>
                      </div>
                      <Badge variant="destructive" className="ml-auto text-xs h-5">4</Badge>
                    </div>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        )}
      </SidebarContent>
      
      <SidebarFooter className="border-t border-border/50 mt-auto">
        <NavUser user={userProfile} />
        <div className="px-4 pb-6 pt-2">
          <LogoutButton 
            variant="outline" 
            className="w-full justify-start hover:bg-destructive/10 transition-colors" 
            size="sm"
            redirectTo="/auth/login"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </LogoutButton>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
