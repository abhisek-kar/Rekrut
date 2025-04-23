'use client';

import { Badge } from "@/components/shadcn-ui/badge";
import { cva } from "class-variance-authority";

// Define status badge variants
const statusBadgeVariants = cva("", {
  variants: {
    status: {
      applied: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
      screening: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
      interview: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
      offer: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
      hired: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
      rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
      withdrawn: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
    },
  },
  defaultVariants: {
    status: "applied",
  },
});

// Status type mapping for display
const statusDisplayText: Record<string, string> = {
  applied: "Applied",
  screening: "Screening",
  interview: "Interview",
  offer: "Offer",
  hired: "Hired",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
};

interface ApplicationStatusBadgeProps {
  status: string;
  className?: string;
}

export function ApplicationStatusBadge({ status, className }: ApplicationStatusBadgeProps) {
  const displayText = statusDisplayText[status] || status;
  
  return (
    <Badge 
      className={statusBadgeVariants({ status: status as any, className })}
    >
      {displayText}
    </Badge>
  );
}
