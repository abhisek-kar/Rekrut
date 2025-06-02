import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/shadcn-ui/breadcrumb";
import { SidebarTrigger } from "@/components/shadcn-ui/sidebar";
import { Separator } from "@/components/shadcn-ui/separator";

export default function AdminCandidatesPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 md:px-6">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mx-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin/candidates">Candidates</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight">Candidates</h1>
            <p className="text-muted-foreground">
              Manage all candidates in the system
            </p>
          </div>

          {/* Placeholder content */}
          <div className="border rounded-lg p-8 text-center">
            <h3 className="text-xl font-medium mb-2">Candidates Management</h3>
            <p className="text-muted-foreground mb-4">
              This feature is coming soon. You'll be able to view and manage all candidates here.
            </p>
            <div className="grid gap-4 md:grid-cols-3 mt-6">
              <div className="border rounded-lg p-4">
                <h4 className="font-medium">View All Candidates</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Browse through all candidates with filtering and search
                </p>
              </div>
              <div className="border rounded-lg p-4">
                <h4 className="font-medium">Candidate Profiles</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  View detailed candidate information and history
                </p>
              </div>
              <div className="border rounded-lg p-4">
                <h4 className="font-medium">Bulk Actions</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Perform actions on multiple candidates at once
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}