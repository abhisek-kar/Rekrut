import { Badge } from "@/components/shadcn-ui/badge";
import { Bell, Settings, User, FileText } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";

export default function AdminNotificationsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader
        title="Notifications"
        description="Stay updated with system activities and important events"
      />

      <main className="flex-1 p-4 md:p-6">
        <div className="flex flex-col gap-6">
          {/* Sample notifications */}
          <div className="space-y-4">
            <div className="border rounded-lg p-4 flex items-start gap-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <User className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">New user registered</h4>
                  <Badge variant="secondary">2 hours ago</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  John Doe has created a new account and is pending approval.
                </p>
              </div>
            </div>

            <div className="border rounded-lg p-4 flex items-start gap-3">
              <div className="bg-green-100 p-2 rounded-full">
                <FileText className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">New job application</h4>
                  <Badge variant="secondary">5 hours ago</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  A new application was submitted for Senior Developer position.
                </p>
              </div>
            </div>

            <div className="border rounded-lg p-4 flex items-start gap-3">
              <div className="bg-yellow-100 p-2 rounded-full">
                <Settings className="h-4 w-4 text-yellow-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">System update completed</h4>
                  <Badge variant="secondary">1 day ago</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Application has been updated to version 2.1.0 with new
                  features.
                </p>
              </div>
            </div>

            <div className="border rounded-lg p-4 flex items-start gap-3">
              <div className="bg-purple-100 p-2 rounded-full">
                <Bell className="h-4 w-4 text-purple-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">Weekly report available</h4>
                  <Badge variant="secondary">2 days ago</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Your weekly recruitment report is ready for download.
                </p>
              </div>
            </div>
          </div>

          {/* Placeholder for future features */}
          <div className="border rounded-lg p-6 text-center">
            <h3 className="text-lg font-medium mb-2">Notification Center</h3>
            <p className="text-muted-foreground mb-4">
              This is a preview of the notification system. Future features will
              include:
            </p>
            <div className="grid gap-4 md:grid-cols-2 mt-6">
              <div className="border rounded-lg p-4">
                <h4 className="font-medium">Real-time Notifications</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Instant alerts for important system events
                </p>
              </div>
              <div className="border rounded-lg p-4">
                <h4 className="font-medium">Email Notifications</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Configurable email alerts for different events
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
