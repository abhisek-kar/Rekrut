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
import { RadioGroup, RadioGroupItem } from "@/components/shadcn-ui/radio-group";
import { Label } from "@/components/shadcn-ui/label";
import { Badge } from "@/components/shadcn-ui/badge";
import { ScrollArea } from "@/components/shadcn-ui/scroll-area";
import {
  CheckCircle,
  Pause,
  X,
  FileText,
  Eye,
  EyeOff,
  Star,
  StarOff,
  UserPlus,
  Archive,
  Trash2,
  AlertTriangle,
  Info,
} from "lucide-react";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface BulkActionDialogsProps {
  selectedJobsCount: number;
  bulkActionData: any;
  setBulkActionData: (data: any) => void;
  setBulkAction: (action: string) => void;
  setShowBulkDialog: (show: boolean) => void;
  users: User[];
  loadingUsers: boolean;
  userRole: "admin" | "subadmin";
  
  // Dialog visibility states
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
}

export function BulkActionDialogs({
  selectedJobsCount,
  bulkActionData,
  setBulkActionData,
  setBulkAction,
  setShowBulkDialog,
  users,
  loadingUsers,
  userRole,
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
}: BulkActionDialogsProps) {
  const handleDialogAction = (action: string, closeDialog: () => void) => {
    setBulkAction(action);
    closeDialog();
    setShowBulkDialog(true);
  };

  return (
    <>
      {/* Status Change Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-blue-600" />
              Change Job Status
            </DialogTitle>
            <DialogDescription>
              Select the new status for <Badge variant="secondary">{selectedJobsCount}</Badge> selected job(s).
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <RadioGroup
              onValueChange={(value) => setBulkActionData({ status: value })}
              className="space-y-4"
            >
              <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="active" id="status-active" />
                <Label htmlFor="status-active" className="flex items-center cursor-pointer flex-1">
                  <CheckCircle className="h-4 w-4 mr-3 text-green-600" />
                  <div>
                    <div className="font-medium">Active</div>
                    <div className="text-sm text-muted-foreground">Job is live and accepting applications</div>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="paused" id="status-paused" />
                <Label htmlFor="status-paused" className="flex items-center cursor-pointer flex-1">
                  <Pause className="h-4 w-4 mr-3 text-yellow-600" />
                  <div>
                    <div className="font-medium">Paused</div>
                    <div className="text-sm text-muted-foreground">Temporarily stop accepting applications</div>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="closed" id="status-closed" />
                <Label htmlFor="status-closed" className="flex items-center cursor-pointer flex-1">
                  <X className="h-4 w-4 mr-3 text-red-600" />
                  <div>
                    <div className="font-medium">Closed</div>
                    <div className="text-sm text-muted-foreground">Job is closed, no longer accepting applications</div>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="draft" id="status-draft" />
                <Label htmlFor="status-draft" className="flex items-center cursor-pointer flex-1">
                  <FileText className="h-4 w-4 mr-3 text-gray-600" />
                  <div>
                    <div className="font-medium">Draft</div>
                    <div className="text-sm text-muted-foreground">Job is not published yet</div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStatusDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => handleDialogAction("change-status", () => setShowStatusDialog(false))}
              disabled={!bulkActionData?.status}
            >
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Visibility Change Dialog */}
      <Dialog open={showVisibilityDialog} onOpenChange={setShowVisibilityDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-blue-600" />
              Change Job Visibility
            </DialogTitle>
            <DialogDescription>
              Select the visibility setting for <Badge variant="secondary">{selectedJobsCount}</Badge> selected job(s).
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <RadioGroup
              onValueChange={(value) => setBulkActionData({ visibility: value })}
              className="space-y-4"
            >
              <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="public" id="visibility-public" />
                <Label htmlFor="visibility-public" className="flex items-center cursor-pointer flex-1">
                  <Eye className="h-4 w-4 mr-3 text-green-600" />
                  <div>
                    <div className="font-medium">Public</div>
                    <div className="text-sm text-muted-foreground">Visible to everyone on job board</div>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="private" id="visibility-private" />
                <Label htmlFor="visibility-private" className="flex items-center cursor-pointer flex-1">
                  <EyeOff className="h-4 w-4 mr-3 text-gray-600" />
                  <div>
                    <div className="font-medium">Private</div>
                    <div className="text-sm text-muted-foreground">Internal only, not visible on public job board</div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowVisibilityDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => handleDialogAction("set-visibility", () => setShowVisibilityDialog(false))}
              disabled={!bulkActionData?.visibility}
            >
              Update Visibility
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Feature Toggle Dialog */}
      <Dialog open={showFeatureDialog} onOpenChange={setShowFeatureDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-600" />
              Feature Jobs
            </DialogTitle>
            <DialogDescription>
              Choose whether to feature or unfeature <Badge variant="secondary">{selectedJobsCount}</Badge> selected job(s).
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <RadioGroup
              onValueChange={(value) => setBulkActionData({ featured: value === "true" })}
              className="space-y-4"
            >
              <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="true" id="feature-yes" />
                <Label htmlFor="feature-yes" className="flex items-center cursor-pointer flex-1">
                  <Star className="h-4 w-4 mr-3 text-yellow-600" />
                  <div>
                    <div className="font-medium">Feature Jobs</div>
                    <div className="text-sm text-muted-foreground">Highlight jobs in listings and searches</div>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="false" id="feature-no" />
                <Label htmlFor="feature-no" className="flex items-center cursor-pointer flex-1">
                  <StarOff className="h-4 w-4 mr-3 text-gray-600" />
                  <div>
                    <div className="font-medium">Remove Featured Status</div>
                    <div className="text-sm text-muted-foreground">Jobs will appear normally in listings</div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFeatureDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => handleDialogAction("set-featured", () => setShowFeatureDialog(false))}
              disabled={bulkActionData?.featured === undefined}
            >
              Update Featured Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assignment Dialog */}
      {userRole === "admin" && (
        <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-blue-600" />
                Assign Jobs
              </DialogTitle>
              <DialogDescription>
                Select a SubAdmin to assign <Badge variant="secondary">{selectedJobsCount}</Badge> selected job(s) to.
              </DialogDescription>
            </DialogHeader>
            <div className="py-6">
              {loadingUsers ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  <span className="ml-2 text-sm text-muted-foreground">Loading users...</span>
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-8">
                  <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No SubAdmin users available</p>
                </div>
              ) : (
                <ScrollArea className="max-h-64">
                  <RadioGroup
                    onValueChange={(value) => {
                      const user = users.find(u => u._id === value);
                      setBulkActionData({ 
                        assignedTo: value,
                        assigneeName: user ? `${user.firstName} ${user.lastName}` : ""
                      });
                    }}
                    className="space-y-3"
                  >
                    {users.map((user) => (
                      <div key={user._id} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                        <RadioGroupItem value={user._id} id={`assign-${user._id}`} />
                        <Label htmlFor={`assign-${user._id}`} className="flex items-center cursor-pointer flex-1">
                          <UserPlus className="h-4 w-4 mr-3 text-blue-600" />
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
                onClick={() => handleDialogAction("assign", () => setShowAssignDialog(false))}
                disabled={!bulkActionData?.assignedTo}
              >
                Assign Jobs
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
              Archive Jobs
            </DialogTitle>
            <DialogDescription>
              <div className="space-y-2">
                <p>Are you sure you want to archive <Badge variant="secondary">{selectedJobsCount}</Badge> selected job(s)?</p>
                <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-950">
                  <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    Archived jobs will be hidden from the main list but can be restored later.
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
              onClick={() => handleDialogAction("archive", () => setShowArchiveDialog(false))}
              variant="secondary"
            >
              <Archive className="h-4 w-4 mr-2" />
              Archive Jobs
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
              Delete Jobs
            </DialogTitle>
            <DialogDescription>
              <div className="space-y-3">
                <p>Are you sure you want to permanently delete <Badge variant="destructive">{selectedJobsCount}</Badge> selected job(s)?</p>
                <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950">
                  <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-red-800 dark:text-red-200">
                    <p className="font-medium">This action cannot be undone!</p>
                    <p>This will also delete all associated applications and candidate data.</p>
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
              onClick={() => handleDialogAction("delete", () => setShowDeleteDialog(false))}
              variant="destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Jobs
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
