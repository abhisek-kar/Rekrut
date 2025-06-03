"use client";

import React from "react";
import { SubadminForm } from "@/components/admin/subadmin-form";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";

export default function CreateSubAdminPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader
        title="Create SubAdmin"
        description="Add a new recruiter to your team"
      />

      <main className="flex-1 p-6">
        <SubadminForm 
          onSuccess={() => {
            router.push('/admin/users');
            router.refresh();
          }} 
        />
      </main>
    </div>
  );
}
