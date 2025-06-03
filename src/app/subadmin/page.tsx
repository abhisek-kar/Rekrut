"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SubAdminPage() {
  const router = useRouter();

  useEffect(() => {
    router.push("/subadmin/dashboard");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
    </div>
  );
}
