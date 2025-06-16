"use client";

import { useState, useEffect } from "react";
import { SharedApplicationView } from "@/components/organisms/applications/details/SharedApplicationView";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/shadcn-ui/button";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminApplicationDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchApplication = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/applications/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setApplication(data);
      } else {
        setApplication(null);
      }
    } catch (error) {
      console.error("Error fetching application:", error);
      setApplication(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplication();
  }, [params.id]);

  const candidateName = application?.application?.candidate
    ? `${application.application.candidate.firstName} ${application.application.candidate.lastName}`
    : "Loading...";

  const jobTitle = application?.application?.job?.title || "Loading...";

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader
        title={`Application Details`}
        description={`${candidateName} • ${jobTitle}`}
        actions={
          <div className="flex items-center gap-2">
            <Button
              onClick={() => router.back()}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <Button
              onClick={fetchApplication}
              variant="outline"
              size="sm"
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        }
      />

      <main className="flex-1 p-4 md:p-6">
        <SharedApplicationView
          application={application?.application || null}
          loading={loading}
          userRole="admin"
          onRefresh={fetchApplication}
        />
      </main>
    </div>
  );
}
