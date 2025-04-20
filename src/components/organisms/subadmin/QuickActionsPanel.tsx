'use client';

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/shadcn-ui/card";
import { Button } from "@/components/shadcn-ui/button";
import Link from "next/link";
import {
  PlusCircleIcon,
  SearchIcon,
  CalendarIcon,
  ClipboardListIcon,
  UserPlusIcon,
  FileTextIcon,
} from "lucide-react";

export function QuickActionsPanel() {
  const quickActions = [
    {
      title: "Create Job",
      description: "Post a new job opening",
      icon: <PlusCircleIcon className="w-5 h-5" />,
      href: "/subadmin/jobs/create",
      color: "text-primary",
    },
    {
      title: "Review Applications",
      description: "Screen new applications",
      icon: <ClipboardListIcon className="w-5 h-5" />,
      href: "/subadmin/applications?status=applied",
      color: "text-amber-500",
    },
    {
      title: "Schedule Interviews",
      description: "Set up candidate interviews",
      icon: <CalendarIcon className="w-5 h-5" />,
      href: "/subadmin/interviews",
      color: "text-indigo-500",
    },
    {
      title: "Find Candidates",
      description: "Search the candidate database",
      icon: <SearchIcon className="w-5 h-5" />,
      href: "/subadmin/candidates",
      color: "text-emerald-500",
    },
    {
      title: "Add Candidate",
      description: "Create candidate profile",
      icon: <UserPlusIcon className="w-5 h-5" />,
      href: "/subadmin/candidates/create",
      color: "text-blue-500",
    },
    {
      title: "Generate Report",
      description: "View job or candidate reports",
      icon: <FileTextIcon className="w-5 h-5" />,
      href: "/subadmin/reports",
      color: "text-purple-500",
    },
  ];

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-xl">Quick Actions</CardTitle>
        <CardDescription>
          Common tasks and shortcuts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {quickActions.map((action, index) => (
            <Link key={index} href={action.href} className="block">
              <Button
                variant="outline"
                className="w-full justify-start h-auto py-3 px-3 gap-2 transition-all hover:border-primary overflow-hidden"
              >
                <div className={`${action.color} shrink-0`}>
                  {action.icon}
                </div>
                <div className="text-left min-w-0 flex-1">
                  <div className="font-medium text-sm truncate">
                    {action.title}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {action.description}
                  </div>
                </div>
              </Button>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
