import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/shadcn-ui/dialog";
import { Button } from "@/components/shadcn-ui/button";
import { Badge } from "@/components/shadcn-ui/badge";
import { 
  CheckCircle, 
  UserPlus, 
  Eye, 
  Star, 
  FileText, 
  AlertTriangle,
  Loader2 
} from "lucide-react";

interface BulkConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  bulkAction: string;
  bulkActionData: any;
  selectedJobsCount: number;
  isLoading?: boolean;
}

export function BulkConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  bulkAction,
  bulkActionData,
  selectedJobsCount,
  isLoading = false,
}: BulkConfirmationDialogProps) {
  const getActionIcon = () => {
    switch (bulkAction) {
      case "change-status":
        return <CheckCircle className="h-5 w-5 text-blue-600" />;
      case "assign":
        return <UserPlus className="h-5 w-5 text-blue-600" />;
      case "set-visibility":
        return <Eye className="h-5 w-5 text-blue-600" />;
      case "set-featured":
        return <Star className="h-5 w-5 text-yellow-600" />;
      case "set-template":
        return <FileText className="h-5 w-5 text-purple-600" />;
      case "archive":
        return <FileText className="h-5 w-5 text-orange-600" />;
      case "delete":
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return <CheckCircle className="h-5 w-5 text-blue-600" />;
    }
  };

  const getActionTitle = () => {
    switch (bulkAction) {
      case "change-status":
        return "Confirm Status Change";
      case "assign":
        return "Confirm Job Assignment";
      case "set-visibility":
        return "Confirm Visibility Change";
      case "set-featured":
        return "Confirm Featured Status";
      case "set-template":
        return "Confirm Template Status";
      case "archive":
        return "Confirm Archive Action";
      case "delete":
        return "Confirm Deletion";
      default:
        return "Confirm Bulk Action";
    }
  };

  const getActionDescription = () => {
    const jobText = selectedJobsCount === 1 ? "job" : "jobs";
    
    switch (bulkAction) {
      case "change-status":
        return (
          <span>
            Change the status of <Badge variant="secondary">{selectedJobsCount}</Badge> selected {jobText} to{" "}
            <Badge variant="outline" className="font-semibold">
              {bulkActionData?.status}
            </Badge>
            ?
          </span>
        );
      case "assign":
        return (
          <span>
            Assign <Badge variant="secondary">{selectedJobsCount}</Badge> selected {jobText} to{" "}
            <Badge variant="outline" className="font-semibold">
              {bulkActionData?.assigneeName}
            </Badge>
            ?
          </span>
        );
      case "set-visibility":
        return (
          <span>
            Set the visibility of <Badge variant="secondary">{selectedJobsCount}</Badge> selected {jobText} to{" "}
            <Badge variant="outline" className="font-semibold">
              {bulkActionData?.visibility}
            </Badge>
            ?
          </span>
        );
      case "set-featured":
        return (
          <span>
            {bulkActionData?.featured ? "Feature" : "Unfeature"}{" "}
            <Badge variant="secondary">{selectedJobsCount}</Badge> selected {jobText}?
          </span>
        );
      case "set-template":
        return (
          <span>
            {bulkActionData?.isTemplate ? "Set as templates" : "Remove template status from"}{" "}
            <Badge variant="secondary">{selectedJobsCount}</Badge> selected {jobText}?
          </span>
        );
      case "archive":
        return (
          <span>
            Archive <Badge variant="secondary">{selectedJobsCount}</Badge> selected {jobText}? 
            They will be hidden from the main list but can be restored later.
          </span>
        );
      case "delete":
        return (
          <span>
            Permanently delete <Badge variant="destructive">{selectedJobsCount}</Badge> selected {jobText}? 
            This action cannot be undone.
          </span>
        );
      default:
        return (
          <span>
            Perform {bulkAction} on <Badge variant="secondary">{selectedJobsCount}</Badge> selected {jobText}?
          </span>
        );
    }
  };

  const getConfirmButtonText = () => {
    if (isLoading) {
      return (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Processing...
        </>
      );
    }

    switch (bulkAction) {
      case "change-status":
        return `Change to ${bulkActionData?.status || "New Status"}`;
      case "assign":
        return "Assign Jobs";
      case "set-visibility":
        return `Set ${bulkActionData?.visibility || "Visibility"}`;
      case "set-featured":
        return bulkActionData?.featured ? "Feature Jobs" : "Unfeature Jobs";
      case "set-template":
        return bulkActionData?.isTemplate ? "Set as Templates" : "Remove Template Status";
      case "archive":
        return "Archive Jobs";
      case "delete":
        return "Delete Jobs";
      default:
        return `Confirm ${bulkAction}`;
    }
  };

  const getButtonVariant = () => {
    if (bulkAction === "delete") return "destructive";
    if (bulkAction === "archive") return "secondary";
    return "default";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getActionIcon()}
            {getActionTitle()}
          </DialogTitle>
          <DialogDescription className="text-base">
            {getActionDescription()}
          </DialogDescription>
        </DialogHeader>
        
        {(bulkAction === "delete" || bulkAction === "archive") && (
          <div className="py-2">
            <div className={`flex items-start gap-2 p-3 rounded-lg ${
              bulkAction === "delete" 
                ? "bg-red-50 dark:bg-red-950" 
                : "bg-orange-50 dark:bg-orange-950"
            }`}>
              <AlertTriangle className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                bulkAction === "delete" ? "text-red-600" : "text-orange-600"
              }`} />
              <div className={`text-sm ${
                bulkAction === "delete" 
                  ? "text-red-800 dark:text-red-200" 
                  : "text-orange-800 dark:text-orange-200"
              }`}>
                {bulkAction === "delete" ? (
                  <p>This will also delete all associated applications and candidate data.</p>
                ) : (
                  <p>Archived jobs can be restored later from the archived jobs section.</p>
                )}
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            variant={getButtonVariant()}
            disabled={isLoading}
          >
            {getConfirmButtonText()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
