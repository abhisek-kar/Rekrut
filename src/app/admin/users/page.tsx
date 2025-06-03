"use client";

import React, { useState, useEffect } from "react";
import { SubAdminTable, SubAdmin } from "@/components/admin/subadmin-table";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/shadcn-ui/button";
import { Plus , PlusCircle} from "lucide-react";
import { useRouter } from "next/navigation";

export default function SubAdminsPage() {
  const router = useRouter();
  const [subadmins, setSubadmins] = useState<SubAdmin[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch the list of subadmins from the API
    const fetchSubadmins = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/users/subadmins');
        
        if (!response.ok) {
          throw new Error('Failed to fetch subadmins');
        }

        const data = await response.json();
        setSubadmins(data.users);
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
