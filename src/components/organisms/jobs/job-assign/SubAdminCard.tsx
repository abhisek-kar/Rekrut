'use client';

import { Briefcase, Calendar, Check } from 'lucide-react';
import { Button } from '@/components/shadcn-ui/button';
import { Badge } from '@/components/shadcn-ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/shadcn-ui/avatar';
import { Card, CardContent, CardFooter } from '@/components/shadcn-ui/card';
import { Skeleton } from '@/components/shadcn-ui/skeleton';

interface SubAdminCardProps {
  subadmin: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    profilePhoto?: string;
    status: string;
    assignedJobs: number;
    lastActive?: string;
  };
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export function SubAdminCard({ subadmin, isSelected, onSelect }: SubAdminCardProps) {
  const fullName = `${subadmin.firstName} ${subadmin.lastName}`;
  const initials = `${subadmin.firstName.charAt(0)}${subadmin.lastName.charAt(0)}`;

  // Format last active date
  const formatLastActive = (dateString?: string) => {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      return `${Math.floor(diffDays / 7)} weeks ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  return (
    <Card className={`transition-all ${isSelected ? 'ring-2 ring-primary' : 'hover:shadow-md'}`}>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center text-center mb-4">
          <Avatar className="h-16 w-16 mb-2">
            <AvatarImage src={subadmin.profilePhoto} alt={fullName} />
            <AvatarFallback className="text-lg">{initials}</AvatarFallback>
          </Avatar>
          <h3 className="font-medium text-lg">{fullName}</h3>
          <p className="text-sm text-muted-foreground mb-2">{subadmin.email}</p>
          <Badge variant={subadmin.status === 'active' ? 'default' : 'secondary'}>
            {subadmin.status === 'active' ? 'Active' : 'Inactive'}
          </Badge>
        </div>

        <div className="grid grid-cols-1 gap-2 mt-4">
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              {subadmin.assignedJobs} {subadmin.assignedJobs === 1 ? 'Job' : 'Jobs'} Assigned
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Last Active: {formatLastActive(subadmin.lastActive)}</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <Button 
          variant={isSelected ? "default" : "outline"} 
          className="w-full"
          onClick={() => onSelect(subadmin._id)}
        >
          {isSelected ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Selected
            </>
          ) : (
            'Select Recruiter'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

// Loading skeleton for SubAdminCard
export function SubAdminCardSkeleton() {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center text-center mb-4">
          <Skeleton className="h-16 w-16 rounded-full mb-2" />
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-4 w-48 mb-2" />
          <Skeleton className="h-5 w-16" />
        </div>

        <div className="grid grid-cols-1 gap-2 mt-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  );
}
