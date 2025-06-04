"use client";

import React, { useState, useEffect } from "react";
import { SubAdminTable, SubAdmin } from "@/components/admin/subadmin-table";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/shadcn-ui/button";
import { Plus , PlusCircle} from "lucide-react";
import { useRouter } from "next/navigation";
import { usersService } from "@/services";
import type { User } from "@/services";

export default function SubAdminsPage() {
  const router = useRouter();
  const [subadmins, setSubadmins] = useState<SubAdmin[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch the list of subadmins using the new API client
    const fetchSubadmins = async () => {
      try {
        setIsLoading(true);
        const data = await usersService.getUsers({
          role: 'SUBADMIN',
          pageSize: 100, // Get all subadmins for now
          sortBy: 'name',
          sortOrder: 'asc'
        });
        
        // Convert User type to SubAdmin type for component compatibility
        const convertedSubadmins: SubAdmin[] = data.users.map((user: User) => ({
          id: user.id,
          email: user.email,
          name: user.name,
          status: user.status,
          createdAt: user.createdAt,
          lastLoginAt: user.lastLoginAt,
          department: user.department,
          phone: user.phone,
          profilePicture: user.profilePicture,
          // Add any other SubAdmin-specific fields if needed
        }));
        
        setSubadmins(convertedSubadmins);
      } catch (error) {
        console.error('Error fetching subadmins:', error);
        toast.error('Failed to load subadmins');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubadmins();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader
        title="User Management"
        description="Manage your recruitment team members"
        actions={
          <Button onClick={() => router.push("/admin/users/create")}>
              <PlusCircle className="h-4 w-4 mr-2" />
            
             Add SubAdmin
          </Button>
        }
      />

      <main className="flex-1 p-6">
        <SubAdminTable data={subadmins} isLoading={isLoading} />
      </main>
    </div>
  );
}
