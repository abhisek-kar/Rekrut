"use client";

import React from "react";
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
import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { toast } from "sonner";

interface LogoutConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  redirectTo?: string;
}

export function LogoutConfirmationModal({
  isOpen,
  onClose,
  redirectTo = "/auth/login",
}: LogoutConfirmationModalProps) {
  const handleLogout = async () => {
    try {
      await signOut({ 
        redirect: false,
        callbackUrl: redirectTo
      });
      
      toast.success("You have been logged out successfully");
      
      // Manually redirect to maintain consistent behavior
      window.location.href = redirectTo;
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to log out. Please try again.");
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to log out of your account?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleLogout}
            className="bg-destructive hover:bg-destructive/90"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
