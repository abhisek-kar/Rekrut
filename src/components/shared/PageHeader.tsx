"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  generateBreadcrumbs,
  generateBreadcrumbsWithContext,
  BreadcrumbItem,
} from "@/lib/breadcrumbs";
import {
  Breadcrumb,
  BreadcrumbItem as BreadcrumbItemComponent,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/shadcn-ui/breadcrumb";
import { SidebarTrigger } from "@/components/shadcn-ui/sidebar";
import { Separator } from "@/components/shadcn-ui/separator";
import { Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge } from "../shadcn-ui/badge";

interface PageHeaderProps {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  customBreadcrumbs?: BreadcrumbItem[];
  breadcrumbContext?: Record<string, string>;
}

export function PageHeader({
  title,
  description,
  actions,
  customBreadcrumbs,
  breadcrumbContext,
}: PageHeaderProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const router = useRouter();

  const breadcrumbs =
    customBreadcrumbs ||
    (breadcrumbContext
      ? generateBreadcrumbsWithContext(
          pathname,
          user?.role || "admin",
          breadcrumbContext
        )
      : generateBreadcrumbs(pathname, user?.role || "admin"));

  const handleNotificationClick = () => {
    if (user?.role === "admin") {
      // route to admin notifications
      router.push("/admin/notifications");
    } else if (user?.role === "subadmin") {
      // route to subadmin notifications
      router.push("/subadmin/notifications");
    }
  };

  return (
    <>
      {/* Navigation Header */}
      <header className="flex h-16 shrink-0  justify-between items-center gap-2 border-b px-4 md:px-6">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mx-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((item, index) => (
                <React.Fragment key={item.href}>
                  {index > 0 && <BreadcrumbSeparator />}
                  <BreadcrumbItemComponent>
                    <BreadcrumbLink
                      href={item.href}
                      className={item.isCurrentPage ? "text-foreground" : ""}
                    >
                      {item.label}
                    </BreadcrumbLink>
                  </BreadcrumbItemComponent>
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div
          className="flex items-center gap-2 cursor-pointer relative"
          onClick={handleNotificationClick}
        >
          <Bell className="h-6 w-6 text-muted-foreground" />
          {/* <Badge
          className="h-2 min-w-2 aspect-square rounded-full  tabular-nums "
          variant="destructive"
       /> */}
               </div>
      </header>

      {/* Page Title Header (if provided) */}
      {(title || description || actions) && (
        <div className="flex flex-col gap-4 p-4 md:p-6 border-b bg-muted/30">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {(title || description) && (
              <div>
                {title && (
                  <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
                )}
                {description && (
                  <p className="text-muted-foreground">{description}</p>
                )}
              </div>
            )}
            {actions && <div className="flex gap-2">{actions}</div>}
          </div>
        </div>
      )}
    </>
  );
}
