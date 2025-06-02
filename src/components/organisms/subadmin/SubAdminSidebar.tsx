"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  BriefcaseIcon,
  ClipboardListIcon,
  LayoutDashboardIcon,
  UsersIcon,
  CalendarIcon,
  FileTextIcon,
  CheckSquareIcon,
  UserCircle2Icon,
  LogOutIcon,
  MenuIcon,
  XIcon,
} from "lucide-react";
import { Button } from "@/components/shadcn-ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/shadcn-ui/avatar";
import { signOut, useSession } from "next-auth/react";

const navItems = [
  {
    title: "Dashboard",
    href: "/subadmin/dashboard",
    icon: <LayoutDashboardIcon className="w-5 h-5" />,
  },
  {
    title: "Jobs",
    href: "/subadmin/jobs",
    icon: <BriefcaseIcon className="w-5 h-5" />,
  },
  {
    title: "Applications",
    href: "/subadmin/applications",
    icon: <ClipboardListIcon className="w-5 h-5" />,
  },
  {
    title: "Candidates",
    href: "/subadmin/candidates",
    icon: <UsersIcon className="w-5 h-5" />,
  },
  {
    title: "Interviews",
    href: "/subadmin/interviews",
    icon: <CalendarIcon className="w-5 h-5" />,
  },
  {
    title: "Reports",
    href: "/subadmin/reports",
    icon: <FileTextIcon className="w-5 h-5" />,
  },
  {
    title: "Tasks",
    href: "/subadmin/tasks",
    icon: <CheckSquareIcon className="w-5 h-5" />,
  },
];

export default function SubAdminSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  const handleSignOut = () => {
    signOut({ callbackUrl: "/login" });
  };

  return (
    <div
      className={cn(
        "bg-white shadow-lg transition-all duration-300 flex flex-col h-full",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <h1 className="text-xl font-bold text-gray-800">SubAdmin</h1>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="ml-auto"
          >
            {isCollapsed ? (
              <MenuIcon className="w-4 h-4" />
            ) : (
              <XIcon className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-lg transition-colors",
                    isActive
                      ? "bg-blue-100 text-blue-700 border border-blue-200"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                    isCollapsed && "justify-center"
                  )}
                >
                  {item.icon}
                  {!isCollapsed && (
                    <span className="ml-3 font-medium">{item.title}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <Avatar className="w-8 h-8">
            <AvatarImage src={session?.user?.image || ""} />
            <AvatarFallback>
              <UserCircle2Icon className="w-4 h-4" />
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {session?.user?.name || "SubAdmin"}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {session?.user?.email || "subadmin@company.com"}
              </p>
            </div>
          )}
        </div>
        {!isCollapsed && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="w-full mt-2 justify-start text-gray-600 hover:text-gray-900"
          >
            <LogOutIcon className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        )}
      </div>
    </div>
  );
}
