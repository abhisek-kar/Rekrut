import { useState, useCallback } from "react";
import { toast } from "sonner";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface UseBulkActionsProps {
  apiEndpoint: string;
  onSuccess?: () => void;
}

export function useBulkActions({ apiEndpoint, onSuccess }: UseBulkActionsProps) {
  // Dialog visibility states
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [showVisibilityDialog, setShowVisibilityDialog] = useState(false);
  const [showFeatureDialog, setShowFeatureDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Action state
  const [bulkAction, setBulkAction] = useState<string>("");
  const [bulkActionData, setBulkActionData] = useState<any>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  // User data for assignment
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const handleBulkActionType = useCallback((actionType: string) => {
    // Reset previous data
    setBulkActionData(null);
    
    switch (actionType) {
      case "status":
        setShowStatusDialog(true);
        break;
      case "visibility":
        setShowVisibilityDialog(true);
        break;
      case "feature":
        setShowFeatureDialog(true);
        break;
      case "assign":
        setShowAssignDialog(true);
        break;
      case "archive":
        setShowArchiveDialog(true);
        break;
      case "delete":
        setShowDeleteDialog(true);
        break;
    }
  }, []);

  const executeBulkAction = useCallback(async (selectedJobs: string[]) => {
    if (!bulkAction || selectedJobs.length === 0) return;

    try {
      setIsExecuting(true);

      const requestBody: any = {
        action: bulkAction,
        jobIds: selectedJobs,
      };

      // Add additional data for specific actions
      if (bulkActionData) {
        requestBody.data = bulkActionData;
      }

      const response = await fetch(`${apiEndpoint}/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Bulk action failed");
      }

      const result = await response.json();

      const actionLabels: Record<string, string> = {
        'change-status': `Status changed to ${bulkActionData?.status}`,
        'assign': `Assigned to ${bulkActionData?.assigneeName}`,
        'set-visibility': `Visibility changed to ${bulkActionData?.visibility}`,
        'set-featured': `Featured status ${bulkActionData?.featured ? 'enabled' : 'disabled'}`,
        'set-template': `Template status ${bulkActionData?.isTemplate ? 'enabled' : 'disabled'}`,
        'archive': 'archived',
        'delete': 'deleted',
      };

      toast.success(
        result.message || 
        `${result.count || selectedJobs.length} jobs ${actionLabels[bulkAction] || bulkAction} successfully`
      );

      // Reset state
      setBulkAction("");
      setBulkActionData(null);
      setShowBulkDialog(false);

      // Call success callback
      if (onSuccess) {
        onSuccess();
      }

    } catch (error) {
      console.error("Bulk action error:", error);
      toast.error(
        error instanceof Error 
          ? error.message 
          : `Failed to ${bulkAction} selected jobs`
      );
    } finally {
      setIsExecuting(false);
    }
  }, [bulkAction, bulkActionData, apiEndpoint, onSuccess]);

  const fetchUsers = useCallback(async () => {
    try {
      setLoadingUsers(true);
      const response = await fetch("/api/users/subadmins?limit=100");
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      } else {
        console.error("Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  const closeAllDialogs = useCallback(() => {
    setShowBulkDialog(false);
    setShowStatusDialog(false);
    setShowVisibilityDialog(false);
    setShowFeatureDialog(false);
    setShowAssignDialog(false);
    setShowArchiveDialog(false);
    setShowDeleteDialog(false);
    setBulkAction("");
    setBulkActionData(null);
  }, []);

  return {
    // Dialog states
    showBulkDialog,
    setShowBulkDialog,
    showStatusDialog,
    setShowStatusDialog,
    showVisibilityDialog,
    setShowVisibilityDialog,
    showFeatureDialog,
    setShowFeatureDialog,
    showAssignDialog,
    setShowAssignDialog,
    showArchiveDialog,
    setShowArchiveDialog,
    showDeleteDialog,
    setShowDeleteDialog,

    // Action state
    bulkAction,
    setBulkAction,
    bulkActionData,
    setBulkActionData,
    isExecuting,

    // User data
    users,
    loadingUsers,
    fetchUsers,

    // Functions
    handleBulkActionType,
    executeBulkAction,
    closeAllDialogs,
  };
}
