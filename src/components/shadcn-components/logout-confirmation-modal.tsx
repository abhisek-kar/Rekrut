"use client";

import React, { useCallback, useState } from "react";
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
import { LogOut, Loader2 } from "lucide-react";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import clsx from "clsx";

interface LogoutConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  redirectTo?: string;
}

export function LogoutConfirmationModal({
  isOpen,
  onClose,
  redirectTo = "/",
}: LogoutConfirmationModalProps) {
  const [loading, setLoading] = useState(false);

  const handleLogout = useCallback(async () => {
    setLoading(true);
    try {
      await signOut({ redirect: false, callbackUrl: redirectTo });
      toast.success("You’ve been logged out successfully.");
      window.location.href = redirectTo;
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [redirectTo]);

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="space-y-4">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-semibold">
            Confirm Logout
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">
            Logging out will end your current session. Are you sure you want to
            continue?
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="flex justify-end gap-3 pt-4">
          <AlertDialogCancel
            disabled={loading}
            className="rounded-md px-4 py-2 text-sm"
          >
            Cancel
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={handleLogout}
            disabled={loading}
            className={clsx(
              "bg-destructive text-white hover:bg-destructive/90 rounded-md px-4 py-2 text-sm flex items-center justify-center gap-2",
              loading && "opacity-75 cursor-not-allowed"
            )}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin h-4 w-4" />
                Logging out...
              </>
            ) : (
              <>
                <LogOut className="h-4 w-4" />
                Logout
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}