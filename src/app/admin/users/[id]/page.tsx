"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/shadcn-ui/breadcrumb";
import { SidebarTrigger } from "@/components/shadcn-ui/sidebar";
import { Separator } from "@/components/shadcn-ui/separator";
import {
  SubadminForm,
  SubadminFormValues,
} from "@/components/admin/subadmin-form";
import { toast } from "sonner";
import { Button } from "@/components/shadcn-ui/button";
import { AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/shadcn-ui/alert-dialog";

export default function EditSubAdminPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [subadmin, setSubadmin] = useState<Partial<SubadminFormValues> | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    // Fetch the subadmin details
    const fetchSubadmin = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/users/subadmins/${id}`);

        if (!response.ok) {
          throw new Error("Failed to fetch subadmin details");
        }

        const data = await response.json();
        setSubadmin(data.user);
      } catch (error) {
        console.error("Error fetching subadmin:", error);
        toast.error("Failed to load subadmin details");
        router.push("/admin/users");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchSubadmin();
    }
  }, [id, router]);

  const handleDeleteSubadmin = async () => {
    try {
      const response = await fetch(`/api/users/subadmins/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete subadmin");
      }

      toast.success("SubAdmin deleted successfully");
      router.push("/admin/users");
      router.refresh();
    } catch (error) {
      console.error("Error deleting subadmin:", error);
      toast.error("Failed to delete subadmin");
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!subadmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <h1 className="text-xl font-semibold">SubAdmin not found</h1>
        <Button
          variant="link"
          onClick={() => router.push("/admin/users")}
          className="mt-4"
        >
          Return to User Management
        </Button>
      </div>
    );
  }

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
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href={`/admin/users/${id}`}>
                  Edit SubAdmin
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <main className="flex-1 p-6">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Edit SubAdmin
              </h1>
              <p className="text-muted-foreground">
                Update details for {subadmin.firstName} {subadmin.lastName}
              </p>
            </div>
            <AlertDialog
              open={isDeleteDialogOpen}
              onOpenChange={setIsDeleteDialogOpen}
            >
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Delete SubAdmin</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    the SubAdmin account and remove their data from the system.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteSubadmin}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          <SubadminForm
            initialData={{
              ...subadmin,
              id: id,
            }}
            isEditing={true}
            onSuccess={() => {
              router.push("/admin/users");
              router.refresh();
            }}
          />
        </div>
      </main>
    </div>
  );
}
