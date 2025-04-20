'use client';

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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/shadcn-ui/avatar";
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