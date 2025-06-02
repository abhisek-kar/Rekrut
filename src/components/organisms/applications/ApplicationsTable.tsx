"use client";

import { useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  getPaginationRowModel,
  useReactTable,
  ColumnFiltersState,
  getFilteredRowModel,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/shadcn-ui/table";
import { Checkbox } from "@/components/shadcn-ui/checkbox";
import { Button } from "@/components/shadcn-ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/shadcn-ui/dropdown-menu";
import { ApplicationStatusBadge } from "./ApplicationStatusBadge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/shadcn-ui/avatar";
import { MoreHorizontal, ArrowUpDown } from "lucide-react";
import { getInitials } from "@/lib/utils";
import { format } from "date-fns";
import { ApplicationType } from "@/types/application";

interface ApplicationsTableProps {
  applications: ApplicationType[];
  selectedApplications: string[];
  onSelect: (applicationId: string) => void;
  onSelectAll: () => void;
  onStatusUpdate: (status: string) => void;
  onViewApplication: (applicationId: string) => void;
}

export function ApplicationsTable({
  applications,
  selectedApplications,
  onSelect,
  onSelectAll,
  onStatusUpdate,
  onViewApplication,
}: ApplicationsTableProps) {
  // State for tanstack table
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch {
      return "Invalid Date";
    }
  };

  // Define columns for tanstack table
  const columns: ColumnDef<ApplicationType>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllRowsSelected()}
          indeterminate={table.getIsSomeRowsSelected()}
          onCheckedChange={(value) => table.toggleAllRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label={`Select ${row.original.candidate?.firstName} ${row.original.candidate?.lastName}`}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "candidate",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="pl-0"
          >
            Candidate
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const candidate = row.original.candidate;
        if (!candidate) return null;

        return (
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage
                src={candidate.profilePhoto}
                alt={`${candidate.firstName} ${candidate.lastName}`}
              />
              <AvatarFallback>
                {getInitials(`${candidate.firstName} ${candidate.lastName}`)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium">
                {candidate.firstName} {candidate.lastName}
              </span>
              <span className="text-xs text-muted-foreground">
                {candidate.email}
              </span>
            </div>
          </div>
        );
      },
      sortingFn: (rowA, rowB) => {
        const a = rowA.original.candidate?.lastName || "";
        const b = rowB.original.candidate?.lastName || "";
        return a.localeCompare(b);
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Status
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <ApplicationStatusBadge status={row.original.status} />
      ),
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "applicationDate",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Applied
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => formatDate(row.original.applicationDate),
    },
    {
      accessorKey: "matchingScore",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Match Score
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const score = row.original.matchingScore?.overall;
        return score ? (
          <span className="font-medium">{score}%</span>
        ) : (
          <span className="text-muted-foreground text-sm">N/A</span>
        );
      },
      sortingFn: (rowA, rowB) => {
        const a = rowA.original.matchingScore?.overall || 0;
        const b = rowB.original.matchingScore?.overall || 0;
        return a - b;
      },
    },
    {
      accessorKey: "source",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Source
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <span className="capitalize">{row.original.source || "Direct"}</span>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const application = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="p-0 h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => onViewApplication(application._id)}
              >
                View Details
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onStatusUpdate("screening")}>
                Move to Screening
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStatusUpdate("interview")}>
                Move to Interview
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStatusUpdate("offer")}>
                Move to Offer
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStatusUpdate("hired")}>
                Mark as Hired
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onStatusUpdate("rejected")}
                className="text-destructive"
              >
                Reject Application
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  // Initialize tanstack table
  const table = useReactTable({
    data: applications,
    columns,
    state: {
      sorting,
      rowSelection: Object.fromEntries(
        selectedApplications.map((id) => [
          applications.findIndex((app) => app._id === id),
          true,
        ])
      ),
      columnFilters,
    },
    enableRowSelection: true,
    onRowSelectionChange: (updaterOrValue) => {
      // Map row selection changes back to our component state
      const updatedSelection =
        typeof updaterOrValue === "function"
          ? updaterOrValue(table.getState().rowSelection)
          : updaterOrValue;

      // Convert row indices back to application IDs
      const selectedIds = Object.entries(updatedSelection)
        .filter(([, selected]) => selected)
        .map(([index]) => applications[parseInt(index)]._id);

      // Update parent component with selected applications
      if (selectedIds.length === applications.length) {
        onSelectAll();
      } else {
        selectedIds.forEach((id) => {
          if (!selectedApplications.includes(id)) {
            onSelect(id);
          }
        });

        selectedApplications.forEach((id) => {
          if (!selectedIds.includes(id)) {
            onSelect(id);
          }
        });
      }
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    // Map our existing sort state to tanstack's sort state
    manualSorting: true,
  });

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() ? "selected" : undefined}
                className={row.getIsSelected() ? "bg-muted/40" : ""}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No applications found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
