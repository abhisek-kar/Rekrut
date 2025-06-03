"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Plus } from "lucide-react";
import { SectionLoader } from "@/components/atoms/loader";

import { Button } from "@/components/shadcn-ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/shadcn-ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/shadcn-ui/alert-dialog";
import { Badge } from "@/components/shadcn-ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/shadcn-ui/avatar";
import { DataTable } from "../shadcn-components/data-table/data-table";

// Define the SubAdmin data type
export type SubAdmin = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: "active" | "inactive";
  profilePhoto?: string;
  phone?: string;
  createdAt: string;
  permissions: string[];
};

// Helper function to get initials
function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

interface SubAdminTableProps {
  data: SubAdmin[];
  isLoading?: boolean;
}

export function SubAdminTable({ data, isLoading = false }: SubAdminTableProps) {
  const router = useRouter();
  const [openAlertId, setOpenAlertId] = React.useState<string | null>(null);

  const handleToggleStatus = async (subadmin: SubAdmin) => {
    try {
      const response = await fetch(`/api/users/subadmins/${subadmin.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: subadmin.status === "active" ? "inactive" : "active",
        }),
      });

      if (response.ok) {
        router.refresh();
      } else {
        console.error("Failed to update subadmin status");
      }
    } catch (error) {
      console.error("Error updating subadmin status:", error);
    } finally {
      setOpenAlertId(null);
    }
  };

  // Define table columns
  const columns: ColumnDef<SubAdmin>[] = [
    {
      accessorKey: "name",
      header: "User",
      cell: ({ row }) => {
        const subadmin = row.original;
        return (
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage
                src={subadmin.profilePhoto}
                alt={`${subadmin.firstName} ${subadmin.lastName}`}
              />
              <AvatarFallback>
                {getInitials(`${subadmin.firstName} ${subadmin.lastName}`)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium">{`${subadmin.firstName} ${subadmin.lastName}`}</span>
              <span className="text-xs text-muted-foreground">
                {subadmin.email}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => <div>{row.getValue("phone") || "—"}</div>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <Badge variant={status === "active" ? "secondary" : "destructive"}>
            {status === "active" ? "Active" : "Inactive"}
          </Badge>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Created
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const date = new Date(row.getValue("createdAt"));
        const formatted = new Intl.DateTimeFormat("en-US", {
          dateStyle: "medium",
        }).format(date);
        return <div>{formatted}</div>;
      },
      sortingFn: "datetime",
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const subadmin = row.original;
        return (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => router.push(`/admin/users/${subadmin.id}`)}
                >
                  Edit Details
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    router.push(`/admin/users/${subadmin.id}/activity`)
                  }
                >
                  View Activity
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setOpenAlertId(subadmin.id)}>
                  {subadmin.status === "active"
                    ? "Deactivate Account"
                    : "Activate Account"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialog
              open={openAlertId === subadmin.id}
              onOpenChange={(open) => !open && setOpenAlertId(null)}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {subadmin.status === "active"
                      ? "Deactivate Account"
                      : "Activate Account"}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {subadmin.status === "active"
                      ? `This will prevent ${subadmin.firstName} ${subadmin.lastName} from accessing the system. They can be reactivated at any time.`
                      : `This will allow ${subadmin.firstName} ${subadmin.lastName} to access the system again.`}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleToggleStatus(subadmin)}
                  >
                    {subadmin.status === "active" ? "Deactivate" : "Activate"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        );
      },
    },
  ];

  // Define filterable columns for the data table
  const filterableColumns = [
    {
      id: "status",
      title: "Status",
      options: [
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
      ],
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">SubAdmins</h2>
          {/* <Button onClick={() => router.push("/admin/users/create")}>
            <Plus className="mr-2 h-4 w-4" /> Add SubAdmin
          </Button> */}
        </div>
        <SectionLoader message="Loading users..." height="400px" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">SubAdmins</h2>
        {/* <Button onClick={() => router.push("/admin/users/create")}>
          <Plus className="mr-2 h-4 w-4" /> Add SubAdmin
        </Button> */}
      </div>

      <DataTable
        columns={columns}
        data={data}
        searchKey="name"
        filterableColumns={filterableColumns}
      />
    </div>
  );
}
