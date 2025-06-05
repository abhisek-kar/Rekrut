import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/shadcn-ui/dropdown-menu";
import { Button } from "@/components/shadcn-ui/button";
import {
  MoreHorizontal,
  Share2,
  CheckCircle,
  Eye,
  Star,
  UserPlus,
  Archive,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

interface JobActionsDropdownProps {
  jobId: string;
  jobActions: {
    handleJobAction: (action: string, jobId: string) => void;
    users: Array<{
      _id: string;
      firstName: string;
      lastName: string;
      email: string;
    }>;
  };
  userRole: 'admin' | 'subadmin';
  showCopyLink?: boolean;
  triggerVariant?: 'icon' | 'button';
  triggerSize?: 'sm' | 'default' | 'lg';
  align?: 'start' | 'center' | 'end';
  className?: string;
}

export function JobActionsDropdown({
  jobId,
  jobActions,
  userRole,
  showCopyLink = true,
  triggerVariant = 'icon',
  triggerSize = 'default',
  align = 'end',
  className = '',
}: JobActionsDropdownProps) {
  
  // Copy job link
  const copyJobLink = () => {
    const publicUrl = `${window.location.origin}/apply/${jobId}`;
    navigator.clipboard.writeText(publicUrl);
    toast.success("Public job link copied to clipboard");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {triggerVariant === 'icon' ? (
          <Button variant="outline" size={triggerSize === 'sm' ? 'sm' : 'icon'} className={className}>
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        ) : (
          <Button variant="outline" size={triggerSize} className={className}>
            <MoreHorizontal className="w-4 h-4 mr-2" />
            Actions
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-48">
        {showCopyLink && (
          <>
            <DropdownMenuItem onClick={copyJobLink}>
              <Share2 className="w-4 h-4 mr-2" />
              Copy Job Link
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        
        {/* Job Actions */}
        <DropdownMenuItem onClick={() => jobActions.handleJobAction('status', jobId)}>
          <CheckCircle className="h-4 w-4 mr-2" />
          Change Status
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => jobActions.handleJobAction('visibility', jobId)}>
          <Eye className="h-4 w-4 mr-2" />
          Change Visibility
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => jobActions.handleJobAction('feature', jobId)}>
          <Star className="h-4 w-4 mr-2" />
          Feature Actions
        </DropdownMenuItem>

        {userRole === "admin" && jobActions.users.length > 0 && (
          <DropdownMenuItem onClick={() => jobActions.handleJobAction('assign', jobId)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Assign Job
          </DropdownMenuItem>
        )}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={() => jobActions.handleJobAction('archive', jobId)}>
          <Archive className="h-4 w-4 mr-2" />
          Archive Job
        </DropdownMenuItem>
        
        <DropdownMenuItem
          onClick={() => jobActions.handleJobAction('delete', jobId)}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Job
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
