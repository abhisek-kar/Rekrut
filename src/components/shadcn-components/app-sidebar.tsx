"use client";

import * as React from "react";
import { Bell, Settings } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";

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
import { Badge } from "@/components/shadcn-ui/badge";
import { useAuth } from "@/hooks/useAuth";

export function AppSidebar({
  navItems = [],
  userData = null,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  navItems?: Array<{
    title: string;
    label?: string;
    icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    variant?: "default" | "ghost";
    href?: string;
    items?: Array<{ title: string; href: string }>;
  }>;
  userData?: { name: string; email: string; avatar: string } | null;
}) {
  const { user } = useAuth();
  const pathname = usePathname();

  // Get user's role to determine which menu items to show
  const isAdmin = user?.role === "admin";

  // Default user data if none is provided
  const defaultUserData = {
    name: user?.firstName ? `${user.firstName} ${user.lastName}` : "User",
    email: user?.email || "user@example.com",
    avatar: user?.profilePhoto || "/avatars/default.png",
  };

  const userProfile = userData || defaultUserData;

  return (
    <Sidebar className="border-r border-border" collapsible="icon" {...props}>
      <SidebarHeader className="flex flex-col items-center py-6">
        <div className="w-full flex justify-center">
          <Logo size="lg" hideTextInSidebar={true} />
        </div>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent className="px-2 py-2">
        <SidebarGroup>
          <SidebarGroupLabel>Main Navigation</SidebarGroupLabel>
          <SidebarMenu>
            {navItems.map((item, index) => {
              const isActive = item.href ? pathname.startsWith(item.href) : false;
              return (
                <SidebarMenuItem key={index}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    tooltip={item.title}
                    className="w-full transition-colors"
                  >
                    <Link href={item.href ?? "#"} className="flex items-center w-full justify-between">
                      <div className="flex items-center">
                        {item.icon && <item.icon className="h-5 w-5 mr-3" />}
                        <span>{item.title}</span>
                      </div>
                      {item.label && (
                        <Badge
                          variant={isActive ? "default" : "secondary"}
                          className="ml-auto text-xs h-5"
                        >
                          {item.label}
                        </Badge>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
{/* 
        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>System</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <Link href="/admin/notifications" className="w-full">
                  <SidebarMenuButton
                    asChild
                    isActive={pathname?.startsWith("/admin/notifications")}
                    tooltip="Notifications"
                    className="w-full transition-colors"
                  >
                    <div className="flex items-center w-full justify-between">
                      <div className="flex items-center">
                        <Bell className="h-5 w-5 mr-3" />
                        <span>Notifications</span>
                      </div>
                      <Badge
                        variant="destructive"
                        className="ml-auto text-xs h-5"
                      >
                        4
                      </Badge>
                    </div>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href="/admin/settings" className="w-full">
                  <SidebarMenuButton
                    asChild
                    isActive={pathname?.startsWith("/admin/settings")}
                    tooltip="Settings"
                    className="w-full transition-colors"
                  >
                    <div className="flex items-center">
                      <Settings className="h-5 w-5 mr-3" />
                      <span>Settings</span>
                    </div>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        )} */}
      </SidebarContent>

      <SidebarFooter className="border-t border-border/50 mt-auto">
        <NavUser user={userProfile} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
