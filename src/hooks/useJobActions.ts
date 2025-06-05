import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface JobActionsProps {
  userRole: 'admin' | 'subadmin';
  onSuccess?: () => void;
}

export function useJobActions({ userRole, onSuccess }: JobActionsProps) {
  // Dialog visibility states - unified for both single and bulk
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [showVisibilityDialog, setShowVisibilityDialog] = useState(false);
  const [showFeatureDialog, setShowFeatureDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);

  // Action state
  const [currentAction, setCurrentAction] = useState<string>('');
  const [actionData, setActionData] = useState<any>(null);
  const [targetJobs, setTargetJobs] = useState<string[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);

  // User data for assignment
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Generic action handler - works for both single and multiple jobs
  const handleJobAction = useCallback((actionType: string, jobIds: string | string[]) => {
    const jobArray = Array.isArray(jobIds) ? jobIds : [jobIds];
    setTargetJobs(jobArray);
    setCurrentAction(actionType);
    setActionData(null);
    
    switch (actionType) {
      case 'status':
        setShowStatusDialog(true);
        break;
      case 'visibility':
        setShowVisibilityDialog(true);
        break;
      case 'feature':
        setShowFeatureDialog(true);
        break;
      case 'assign':
        setShowAssignDialog(true);
        break;
      case 'archive':
        setShowArchiveDialog(true);
        break;
      case 'delete':
        setShowDeleteDialog(true);
        break;
    }
  }, []);

  // Execute action - adapts between single and bulk APIs
  const executeAction = useCallback(async () => {
    if (!currentAction || targetJobs.length === 0) return;

    try {
      setIsExecuting(true);

      const isBulkAction = targetJobs.length > 1;
      
      if (isBulkAction) {
        // Use bulk API
        const apiEndpoint = userRole === 'admin' ? '/api/jobs/bulk' : '/api/subadmin/jobs/bulk';
        
        const requestBody = {
          action: getAPIActionName(currentAction),
          jobIds: targetJobs,
          data: actionData || {}
        };

        const response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to execute bulk action');
        }

        const result = await response.json();
        toast.success(result.message || `${targetJobs.length} jobs updated successfully`);
      } else {
        // Use individual job API
        const jobId = targetJobs[0];
        await executeSingleJobAction(jobId, currentAction, actionData);
      }

      // Success cleanup
      closeAllDialogs();
      if (onSuccess) {
        onSuccess();
      }

    } catch (error) {
      console.error('Job action error:', error);
      toast.error(
        error instanceof Error 
          ? error.message 
          : `Failed to ${currentAction} job(s)`
      );
    } finally {
      setIsExecuting(false);
    }
  }, [currentAction, actionData, targetJobs, userRole, onSuccess]);

  // Execute single job action using individual APIs
  const executeSingleJobAction = async (jobId: string, action: string, data: any) => {
    switch (action) {
      case 'status':
        await updateJobStatus(jobId, data.status);
        break;
      case 'visibility':
        await updateJobField(jobId, { visibility: data.visibility });
        break;
      case 'feature':
        await updateJobField(jobId, { featured: data.featured });
        break;
      case 'assign':
        await assignJob(jobId, data.assignedTo);
        break;
      case 'archive':
        await updateJobStatus(jobId, 'archived');
        break;
      case 'delete':
        await deleteJob(jobId);
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  };

  // Individual API calls
  const updateJobStatus = async (jobId: string, status: string) => {
    const response = await fetch(`/api/jobs/${jobId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update job status');
    }

    const result = await response.json();
    toast.success(result.message || `Job ${status} successfully`);
  };

  const updateJobField = async (jobId: string, updateData: any) => {
    const response = await fetch(`/api/jobs/${jobId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update job');
    }

    const result = await response.json();
    toast.success('Job updated successfully');
  };

  const assignJob = async (jobId: string, assignedTo: string) => {
    const response = await fetch(`/api/jobs/${jobId}/assign`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subadminId: assignedTo }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to assign job');
    }

    const result = await response.json();
    toast.success('Job assigned successfully');
  };

  const deleteJob = async (jobId: string) => {
    const response = await fetch(`/api/jobs/${jobId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete job');
    }

    const result = await response.json();
    toast.success('Job deleted successfully');
  };

  // Convert UI action names to API action names
  const getAPIActionName = (action: string): string => {
    const actionMap: Record<string, string> = {
      'status': 'change-status',
      'visibility': 'set-visibility',
      'feature': 'set-featured',
      'assign': 'assign',
      'archive': 'archive',
      'delete': 'delete',
    };
    return actionMap[action] || action;
  };

  // Fetch users for assignment
  const fetchUsers = useCallback(async () => {
    if (userRole !== 'admin') return;

    try {
      setLoadingUsers(true);
      const response = await fetch('/api/users/subadmins?limit=100');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoadingUsers(false);
    }
  }, [userRole]);

  // Close all dialogs
  const closeAllDialogs = useCallback(() => {
    setShowStatusDialog(false);
    setShowVisibilityDialog(false);
    setShowFeatureDialog(false);
    setShowAssignDialog(false);
    setShowArchiveDialog(false);
    setShowDeleteDialog(false);
    setShowConfirmationDialog(false);
    setCurrentAction('');
    setActionData(null);
    setTargetJobs([]);
  }, []);

  return {
    // Dialog states
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
    showConfirmationDialog,
    setShowConfirmationDialog,

    // Action state
    currentAction,
    actionData,
    setActionData,
    targetJobs,
    isExecuting,

    // User data
    users,
    loadingUsers,
    fetchUsers,

    // Action handlers
    handleJobAction,
    executeAction,
    closeAllDialogs,

    // Helper for getting job count
    getJobCount: () => targetJobs.length,
    isBulkAction: () => targetJobs.length > 1,
  };
}
