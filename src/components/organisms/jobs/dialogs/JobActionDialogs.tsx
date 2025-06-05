import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/shadcn-ui/dialog';
import { Button } from '@/components/shadcn-ui/button';
import { Badge } from '@/components/shadcn-ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/shadcn-ui/radio-group';
import { Label } from '@/components/shadcn-ui/label';
import { ScrollArea } from '@/components/shadcn-ui/scroll-area';
import { 
  CheckCircle, 
  Eye, 
  Star, 
  UserPlus, 
  Archive, 
  Trash2,
  Info,
  AlertTriangle 
} from 'lucide-react';

interface JobActionDialogsProps {
  // Dialog visibility
  showStatusDialog: boolean;
  setShowStatusDialog: (show: boolean) => void;
  showVisibilityDialog: boolean;
  setShowVisibilityDialog: (show: boolean) => void;
  showFeatureDialog: boolean;
  setShowFeatureDialog: (show: boolean) => void;
  showAssignDialog: boolean;
  setShowAssignDialog: (show: boolean) => void;
  showArchiveDialog: boolean;
  setShowArchiveDialog: (show: boolean) => void;
  showDeleteDialog: boolean;
  setShowDeleteDialog: (show: boolean) => void;

  // Action data
  jobCount: number;
  isBulkAction: boolean;
  actionData: any;
  setActionData: (data: any) => void;
  onExecute: () => void;

  // User data for assignment
  users: Array<{
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  }>;
  loadingUsers: boolean;
  userRole: 'admin' | 'subadmin';
}

export function JobActionDialogs({
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
  jobCount,
  isBulkAction,
  actionData,
  setActionData,
  onExecute,
  users,
  loadingUsers,
  userRole,
}: JobActionDialogsProps) {

  const getJobText = () => isBulkAction ? `${jobCount} jobs` : 'this job';
  const getActionTitle = (action: string) => 
    isBulkAction ? `${action} Jobs` : `${action} Job`;

  const handleDialogAction = (actionType: string, closeDialog: () => void) => {
    closeDialog();
    onExecute();
  };

  return (
    <>
      {/* Status Change Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-blue-600" />
              {getActionTitle('Change Status for')}
            </DialogTitle>
            <DialogDescription>
              Select the new status for <Badge variant="secondary">{jobCount}</Badge> {isBulkAction ? 'selected jobs' : 'job'}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <RadioGroup
              onValueChange={(value) => setActionData({ status: value })}
              className="space-y-4"
            >
              {[
                { value: 'active', label: 'Active', desc: 'Job is live and accepting applications' },
                { value: 'draft', label: 'Draft', desc: 'Job is saved but not published' },
                { value: 'paused', label: 'Paused', desc: 'Job is temporarily not accepting applications' },
                { value: 'closed', label: 'Closed', desc: 'Job is closed, no longer accepting applications' },
              ].map((status) => (
                <div key={status.value} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value={status.value} id={`status-${status.value}`} />
                  <Label htmlFor={`status-${status.value}`} className="flex items-center cursor-pointer flex-1">
                    <div>
                      <div className="font-medium">{status.label}</div>
                      <div className="text-sm text-muted-foreground">{status.desc}</div>
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStatusDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => handleDialogAction('status', () => setShowStatusDialog(false))}
              disabled={!actionData?.status}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Visibility Change Dialog */}
      <Dialog open={showVisibilityDialog} onOpenChange={setShowVisibilityDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-green-600" />
              {getActionTitle('Change Visibility for')}
            </DialogTitle>
            <DialogDescription>
              Set the visibility for <Badge variant="secondary">{jobCount}</Badge> {isBulkAction ? 'selected jobs' : 'job'}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <RadioGroup
              onValueChange={(value) => setActionData({ visibility: value })}
              className="space-y-4"
            >
              {[
                { value: 'public', label: 'Public', desc: 'Visible to all job seekers' },
                { value: 'private', label: 'Private', desc: 'Only accessible via direct link' },
              ].map((visibility) => (
                <div key={visibility.value} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value={visibility.value} id={`visibility-${visibility.value}`} />
                  <Label htmlFor={`visibility-${visibility.value}`} className="flex items-center cursor-pointer flex-1">
                    <div>
                      <div className="font-medium">{visibility.label}</div>
                      <div className="text-sm text-muted-foreground">{visibility.desc}</div>
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowVisibilityDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => handleDialogAction('visibility', () => setShowVisibilityDialog(false))}
              disabled={!actionData?.visibility}
            >
              <Eye className="h-4 w-4 mr-2" />
              Update Visibility
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Feature Toggle Dialog */}
      <Dialog open={showFeatureDialog} onOpenChange={setShowFeatureDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-600" />
              {getActionTitle('Feature Settings for')}
            </DialogTitle>
            <DialogDescription>
              Set the featured status for <Badge variant="secondary">{jobCount}</Badge> {isBulkAction ? 'selected jobs' : 'job'}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <RadioGroup
              onValueChange={(value) => setActionData({ featured: value === 'true' })}
              className="space-y-4"
            >
              {[
                { value: 'true', label: 'Featured', desc: 'Promote job in search results' },
                { value: 'false', label: 'Normal', desc: 'Standard job listing' },
              ].map((feature) => (
                <div key={feature.value} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value={feature.value} id={`feature-${feature.value}`} />
                  <Label htmlFor={`feature-${feature.value}`} className="flex items-center cursor-pointer flex-1">
                    <div>
                      <div className="font-medium">{feature.label}</div>
                      <div className="text-sm text-muted-foreground">{feature.desc}</div>
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFeatureDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => handleDialogAction('feature', () => setShowFeatureDialog(false))}
              disabled={actionData?.featured === undefined}
            >
              <Star className="h-4 w-4 mr-2" />
              Update Featured Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assignment Dialog */}
      {userRole === 'admin' && (
        <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-purple-600" />
                {getActionTitle('Assign')}
              </DialogTitle>
              <DialogDescription>
                Assign <Badge variant="secondary">{jobCount}</Badge> {isBulkAction ? 'selected jobs' : 'job'} to a SubAdmin recruiter.
              </DialogDescription>
            </DialogHeader>
            <div className="py-6">
              {loadingUsers ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-sm text-muted-foreground">Loading recruiters...</p>
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">No SubAdmin recruiters available</p>
                </div>
              ) : (
                <ScrollArea className="h-64">
                  <RadioGroup
                    onValueChange={(value) => setActionData({ assignedTo: value })}
                    className="space-y-3"
                  >
                    {users.map((user) => (
                      <div key={user._id} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                        <RadioGroupItem value={user._id} id={`user-${user._id}`} />
                        <Label htmlFor={`user-${user._id}`} className="flex items-center cursor-pointer flex-1">
                          <div>
                            <div className="font-medium">{user.firstName} {user.lastName}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                          </div>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </ScrollArea>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAssignDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => handleDialogAction('assign', () => setShowAssignDialog(false))}
                disabled={!actionData?.assignedTo}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Assign {isBulkAction ? 'Jobs' : 'Job'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Archive Confirmation Dialog */}
      <Dialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Archive className="h-5 w-5 text-orange-600" />
              {getActionTitle('Archive')}
            </DialogTitle>
            <DialogDescription>
              <div className="space-y-3">
                <p>Are you sure you want to archive <Badge variant="secondary">{jobCount}</Badge> {isBulkAction ? 'selected jobs' : 'job'}?</p>
                <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-950">
                  <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    Archived jobs can be restored later from the archived jobs section.
                  </p>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowArchiveDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => handleDialogAction('archive', () => setShowArchiveDialog(false))}
              variant="secondary"
            >
              <Archive className="h-4 w-4 mr-2" />
              Archive {isBulkAction ? 'Jobs' : 'Job'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-600" />
              {getActionTitle('Delete')}
            </DialogTitle>
            <DialogDescription>
              <div className="space-y-3">
                <p>Are you sure you want to permanently delete <Badge variant="destructive">{jobCount}</Badge> {isBulkAction ? 'selected jobs' : 'job'}?</p>
                <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950">
                  <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-red-800 dark:text-red-200">
                    <p className="font-medium">This action cannot be undone.</p>
                    <p>All associated applications and data will also be removed.</p>
                  </div>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => handleDialogAction('delete', () => setShowDeleteDialog(false))}
              variant="destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete {isBulkAction ? 'Jobs' : 'Job'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
