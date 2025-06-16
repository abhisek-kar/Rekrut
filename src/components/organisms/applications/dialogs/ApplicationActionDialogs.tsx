"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/shadcn-ui/dialog";
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
import { Button } from "@/components/shadcn-ui/button";
import { Label } from "@/components/shadcn-ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn-ui/select";
import { Textarea } from "@/components/shadcn-ui/textarea";
import { Badge } from "@/components/shadcn-ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/shadcn-ui/avatar";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePhoto?: string;
}

interface ApplicationActionDialogsProps {
  // Status Dialog
  showStatusDialog: boolean;
  setShowStatusDialog: (show: boolean) => void;

  // Assignment Dialog
  showAssignDialog: boolean;
  setShowAssignDialog: (show: boolean) => void;

  // Note Dialog
  showNoteDialog: boolean;
  setShowNoteDialog: (show: boolean) => void;

  // Archive Dialog
  showArchiveDialog: boolean;
  setShowArchiveDialog: (show: boolean) => void;

  // Delete Dialog
  showDeleteDialog: boolean;
  setShowDeleteDialog: (show: boolean) => void;

  // Common props
  applicationCount: number;
  isBulkAction: boolean;
  actionData: any;
  setActionData: (data: any) => void;
  onExecute: () => void;
  users: User[];
}

// Helper function to get initials
const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

export function ApplicationActionDialogs({
  showStatusDialog,
  setShowStatusDialog,
  showAssignDialog,
  setShowAssignDialog,
  showNoteDialog,
  setShowNoteDialog,
  showArchiveDialog,
  setShowArchiveDialog,
  showDeleteDialog,
  setShowDeleteDialog,
  applicationCount,
  isBulkAction,
  actionData,
  setActionData,
  onExecute,
  users,
}: ApplicationActionDialogsProps) {
  // Status Change Dialog
  const StatusDialog = () => (
    <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Change Application Status</DialogTitle>
          <DialogDescription>
            {isBulkAction
              ? `Update status for ${applicationCount} selected applications`
              : "Update the status for this application"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="status">New Status</Label>
            <Select
              value={actionData?.status || ""}
              onValueChange={(value) =>
                setActionData({ ...actionData, status: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select new status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="applied">Applied</SelectItem>
                <SelectItem value="screening">Screening</SelectItem>
                <SelectItem value="interview_scheduled">
                  Interview Scheduled
                </SelectItem>
                <SelectItem value="interviewed">Interviewed</SelectItem>
                <SelectItem value="offered">Offered</SelectItem>
                <SelectItem value="hired">Hired</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Status Change Note (Optional)</Label>
            <Textarea
              id="note"
              placeholder="Add a note about this status change..."
              value={actionData?.note || ""}
              onChange={(e) =>
                setActionData({ ...actionData, note: e.target.value })
              }
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setShowStatusDialog(false)}>
            Cancel
          </Button>
          <Button onClick={onExecute} disabled={!actionData?.status}>
            Update Status
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  // Assignment Dialog
  const AssignDialog = () => (
    <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Assign Applications</DialogTitle>
          <DialogDescription>
            {isBulkAction
              ? `Assign ${applicationCount} selected applications to a recruiter`
              : "Assign this application to a recruiter"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Select Recruiter</Label>
            <Select
              value={actionData?.assigneeId || ""}
              onValueChange={(value) =>
                setActionData({ ...actionData, assigneeId: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a recruiter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user._id} value={user._id}>
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={user.profilePhoto} />
                        <AvatarFallback className="text-xs">
                          {getInitials(`${user.firstName} ${user.lastName}`)}
                        </AvatarFallback>
                      </Avatar>
                      <span>
                        {user.firstName} {user.lastName}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {actionData?.assigneeId && actionData.assigneeId !== "unassigned" && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center space-x-3">
                {(() => {
                  const selectedUser = users.find(
                    (u) => u._id === actionData.assigneeId
                  );
                  return selectedUser ? (
                    <>
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={selectedUser.profilePhoto} />
                        <AvatarFallback>
                          {getInitials(
                            `${selectedUser.firstName} ${selectedUser.lastName}`
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {selectedUser.firstName} {selectedUser.lastName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {selectedUser.email}
                        </div>
                      </div>
                    </>
                  ) : null;
                })()}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="assignNote">Assignment Note (Optional)</Label>
            <Textarea
              id="assignNote"
              placeholder="Add a note about this assignment..."
              value={actionData?.note || ""}
              onChange={(e) =>
                setActionData({ ...actionData, note: e.target.value })
              }
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setShowAssignDialog(false)}>
            Cancel
          </Button>
          <Button onClick={onExecute} disabled={!actionData?.assigneeId}>
            Assign Applications
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  // Note Dialog
  const NoteDialog = () => (
    <Dialog open={showNoteDialog} onOpenChange={setShowNoteDialog}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Note</DialogTitle>
          <DialogDescription>
            {isBulkAction
              ? `Add a note to ${applicationCount} selected applications`
              : "Add a note to this application"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="noteContent">Note Content</Label>
            <Textarea
              id="noteContent"
              placeholder="Enter your note..."
              value={actionData?.content || ""}
              onChange={(e) =>
                setActionData({ ...actionData, content: e.target.value })
              }
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label>Note Type</Label>
            <Select
              value={actionData?.type || "general"}
              onValueChange={(value) =>
                setActionData({ ...actionData, type: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="interview">Interview</SelectItem>
                <SelectItem value="feedback">Feedback</SelectItem>
                <SelectItem value="followup">Follow-up</SelectItem>
                <SelectItem value="internal">Internal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setShowNoteDialog(false)}>
            Cancel
          </Button>
          <Button onClick={onExecute} disabled={!actionData?.content?.trim()}>
            Add Note
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  // Archive Dialog
  const ArchiveDialog = () => (
    <AlertDialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Archive Applications</AlertDialogTitle>
          <AlertDialogDescription>
            {isBulkAction
              ? `Are you sure you want to archive ${applicationCount} selected applications? They will be moved to the archived section and can be restored later.`
              : "Are you sure you want to archive this application? It will be moved to the archived section and can be restored later."}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onExecute}>
            Archive {isBulkAction ? "Applications" : "Application"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  // Delete Dialog
  const DeleteDialog = () => (
    <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Applications</AlertDialogTitle>
          <AlertDialogDescription>
            {isBulkAction
              ? `Are you sure you want to delete ${applicationCount} selected applications? This action cannot be undone.`
              : "Are you sure you want to delete this application? This action cannot be undone."}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onExecute}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete {isBulkAction ? "Applications" : "Application"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return (
    <>
      <StatusDialog />
      <AssignDialog />
      <NoteDialog />
      <ArchiveDialog />
      <DeleteDialog />
    </>
  );
}
