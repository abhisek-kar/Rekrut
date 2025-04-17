"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/shadcn-ui/breadcrumb";
import { SidebarTrigger } from "@/components/shadcn-ui/sidebar";
import { Separator } from "@/components/shadcn-ui/separator";
import { SubAdminTable, SubAdmin } from "@/components/admin/subadmin-table";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export default function SubAdminsPage() {
  const [subadmins, setSubadmins] = useState<SubAdmin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    // Fetch the list of subadmins from the API
    const fetchSubadmins = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/users/subadmins');
        
        if (!response.ok) {
          throw new Error('Failed to fetch subadmins');
        }

        const data = await response.json();
        setSubadmins(data.users);
      } catch (error) {
        console.error('Error fetching subadmins:', error);
        toast.error('Failed to load subadmins');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubadmins();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mx-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin/users">Users</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <main className="flex-1 p-6">
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
            <p className="text-muted-foreground">
              Manage your recruitment team members
            </p>
          </div>

          <SubAdminTable data={subadmins} isLoading={isLoading} />
        </div>
      </main>
    </div>
  );
}
