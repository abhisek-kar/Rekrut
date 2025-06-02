"use client";

import * as React from "react";
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

type NavItem = {
  title: string;
  url: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  isActive: boolean;
  badge?: string;
};

export function AppSidebar({
  navItems = [],
  userData = null,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  navItems?: NavItem[];
  userData?: { name: string; email: string; avatar: string } | null;
}) {
  const { user } = useAuth();

  // Default user data if none is provided
  const defaultUserData = {
    name: user?.firstName ? `${user.firstName} ${user.lastName}` : "User",
    email: user?.email || "user@example.com",
    avatar: user?.profilePhoto || "https://docs.material-tailwind.com/img/face-2.jpg",
  };

  const userProfile = userData || defaultUserData;

  return (
    <Sidebar className="border-r border-border" collapsible="icon" {...props}>
      <SidebarHeader className="flex flex-col items-center py-6">
        <div className="w-full flex justify-center">
          <Logo size="lg" />
        </div>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent className="px-2 py-2">
        {/* Single unified navigation group */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarMenu>
            {navItems.map((item, index) => (
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
      </SidebarContent>

      <SidebarFooter className="border-t border-border/50 mt-auto">
        <NavUser user={userProfile} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}