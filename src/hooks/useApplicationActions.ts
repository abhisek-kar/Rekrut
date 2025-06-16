import { useState, useCallback } from "react";
import { toast } from "sonner";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
}

interface ApplicationActionsProps {
  userRole: "admin" | "subadmin";
  onSuccess?: () => void;
}

export function useApplicationActions({
  userRole,
  onSuccess,
}: ApplicationActionsProps) {
  // Dialog visibility states - unified for both single and bulk
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Action state
  const [currentAction, setCurrentAction] = useState<string>("");
  const [actionData, setActionData] = useState<any>(null);
  const [targetApplications, setTargetApplications] = useState<string[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);

  // User data for assignment
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Generic action handler - works for both single and multiple applications
  const handleApplicationAction = useCallback(
    (actionType: string, applicationIds: string | string[]) => {
      const applicationArray = Array.isArray(applicationIds)
        ? applicationIds
        : [applicationIds];

      // Edge case: Prevent subadmins from using bulk assign action
      if (
        actionType === "assign" &&
        applicationArray.length > 1 &&
        userRole === "subadmin"
      ) {
        toast.error(
          "Bulk assignment is not available for SubAdmins. Please assign applications individually."
        );
        return;
      }

      setTargetApplications(applicationArray);
      setCurrentAction(actionType);
      setActionData(null);

      switch (actionType) {
        case "status":
          setShowStatusDialog(true);
          break;
        case "assign":
          setShowAssignDialog(true);
          break;
        case "note":
          setShowNoteDialog(true);
          break;
        case "archive":
          setShowArchiveDialog(true);
          break;
        case "delete":
          setShowDeleteDialog(true);
          break;
      }
    },
    [userRole]
  );

  // Execute action - adapts between single and bulk APIs
  const executeAction = useCallback(async () => {
    if (!currentAction || targetApplications.length === 0) return;

    try {
      setIsExecuting(true);

      const isBulkAction = targetApplications.length > 1;

      if (isBulkAction) {
        // Use bulk API
        const apiEndpoint =
          userRole === "admin"
            ? "/api/applications/bulk"
            : "/api/subadmin/applications/bulk";

        const requestBody = {
          action: getAPIActionName(currentAction),
          applicationIds: targetApplications,
          data: actionData || {},
        };

        const response = await fetch(apiEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to execute bulk action");
        }

        const result = await response.json();
        toast.success(
          result.message ||
            `${targetApplications.length} applications updated successfully`
        );
      } else {
        // Use individual application API
        const applicationId = targetApplications[0];
        await executeSingleApplicationAction(
          applicationId,
          currentAction,
          actionData
        );
      }

      // Success cleanup
      closeAllDialogs();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Application action error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : `Failed to ${currentAction} application(s)`
      );
    } finally {
      setIsExecuting(false);
    }
  }, [currentAction, actionData, targetApplications, userRole, onSuccess]);

  // Execute single application action using individual APIs
  const executeSingleApplicationAction = async (
    applicationId: string,
    action: string,
    data: any
  ) => {
    switch (action) {
      case "status":
        await updateApplicationStatus(applicationId, data.status, data.note);
        break;
      case "assign":
        await assignApplication(applicationId, data.assignedTo);
        break;
      case "note":
        await addApplicationNote(
          applicationId,
          data.note,
          data.type,
          data.isInternal
        );
        break;
      case "archive":
        await updateApplicationStatus(applicationId, "archived");
        break;
      case "delete":
        await deleteApplication(applicationId);
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  };

  // Individual API calls
  const updateApplicationStatus = async (
    applicationId: string,
    status: string,
    note?: string
  ) => {
    const apiEndpoint =
      userRole === "admin"
        ? `/api/applications/${applicationId}/status`
        : `/api/subadmin/applications/${applicationId}/status`;

    const response = await fetch(apiEndpoint, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, note }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to update application status");
    }

    const result = await response.json();
    toast.success(result.message || "Application status updated successfully");
  };

  const assignApplication = async (
    applicationId: string,
    assignedTo: string
  ) => {
    const apiEndpoint =
      userRole === "admin"
        ? `/api/applications/${applicationId}/assign`
        : `/api/subadmin/applications/${applicationId}/assign`;

    const response = await fetch(apiEndpoint, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assignedTo }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to assign application");
    }

    const result = await response.json();
    toast.success(result.message || "Application assigned successfully");
  };

  const addApplicationNote = async (
    applicationId: string,
    note: string,
    type: string,
    isInternal: boolean
  ) => {
    const apiEndpoint =
      userRole === "admin"
        ? `/api/applications/${applicationId}/notes`
        : `/api/subadmin/applications/${applicationId}/notes`;

    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note, type, isInternal }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to add note");
    }

    const result = await response.json();
    toast.success(result.message || "Note added successfully");
  };

  const deleteApplication = async (applicationId: string) => {
    const apiEndpoint =
      userRole === "admin"
        ? `/api/applications/${applicationId}`
        : `/api/subadmin/applications/${applicationId}`;

    const response = await fetch(apiEndpoint, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to delete application");
    }

    const result = await response.json();
    toast.success(result.message || "Application deleted successfully");
  };

  // Download application data
  const downloadApplication = useCallback(
    async (applicationId: string, format: "pdf" | "csv" = "pdf") => {
      try {
        const apiEndpoint =
          userRole === "admin"
            ? `/api/applications/${applicationId}/download?format=${format}`
            : `/api/subadmin/applications/${applicationId}/download?format=${format}`;

        const response = await fetch(apiEndpoint);

        if (!response.ok) {
          throw new Error("Failed to download application");
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `application-${applicationId}.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        toast.success("Application downloaded successfully");
      } catch (error) {
        console.error("Download error:", error);
        toast.error("Failed to download application");
      }
    },
    [userRole]
  );

  // Email application
  const emailApplication = useCallback(
    async (applicationId: string, emailType: "candidate" | "internal") => {
      try {
        const apiEndpoint =
          userRole === "admin"
            ? `/api/applications/${applicationId}/email`
            : `/api/subadmin/applications/${applicationId}/email`;

        const response = await fetch(apiEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: emailType }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to send email");
        }

        const result = await response.json();
        toast.success(result.message || "Email sent successfully");
      } catch (error) {
        console.error("Email error:", error);
        toast.error("Failed to send email");
      }
    },
    [userRole]
  );

  // Load users for assignment (admin only)
  const loadUsers = useCallback(async () => {
    if (userRole !== "admin" || loadingUsers) return;

    try {
      setLoadingUsers(true);
      const response = await fetch("/api/admin/users?role=subadmin");

      if (!response.ok) {
        throw new Error("Failed to load users");
      }

      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error("Load users error:", error);
      toast.error("Failed to load users for assignment");
    } finally {
      setLoadingUsers(false);
    }
  }, [userRole, loadingUsers]);

  // Helper function to map action names to API action names
  const getAPIActionName = (action: string): string => {
    const actionMap: Record<string, string> = {
      status: "updateStatus",
      assign: "assign",
      note: "addNote",
      archive: "archive",
      delete: "delete",
    };
    return actionMap[action] || action;
  };

  // Close all dialogs
  const closeAllDialogs = useCallback(() => {
    setShowStatusDialog(false);
    setShowAssignDialog(false);
    setShowNoteDialog(false);
    setShowArchiveDialog(false);
    setShowDeleteDialog(false);
    setCurrentAction("");
    setActionData(null);
    setTargetApplications([]);
  }, []);

  // Update action data
  const updateActionData = useCallback((data: any) => {
    setActionData((prev: any) => ({ ...prev, ...data }));
  }, []);

  return {
    // Dialog states
    showStatusDialog,
    showAssignDialog,
    showNoteDialog,
    showArchiveDialog,
    showDeleteDialog,

    // Action state
    currentAction,
    actionData,
    targetApplications,
    isExecuting,

    // User data
    users,
    loadingUsers,

    // Actions
    handleApplicationAction,
    executeAction,
    downloadApplication,
    emailApplication,
    loadUsers,
    closeAllDialogs,
    updateActionData,
    setActionData: updateActionData, // Alias for compatibility

    // Individual dialog setters
    setShowStatusDialog,
    setShowAssignDialog,
    setShowNoteDialog,
    setShowArchiveDialog,
    setShowDeleteDialog,
  };
}
