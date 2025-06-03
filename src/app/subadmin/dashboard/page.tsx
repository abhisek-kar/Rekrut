"use client";

import React, { useState } from "react";

import { useAuth } from "@/context/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/shadcn-ui/tabs";
import { DashboardMetricsPanel } from "@/components/organisms/subadmin/DashboardMetricsPanel";
import { AssignedJobsPanel } from "@/components/organisms/subadmin/AssignedJobsPanel";
import { RecentApplicationsPanel } from "@/components/organisms/subadmin/RecentApplicationsPanel";
import { TasksPanel } from "@/components/organisms/subadmin/TasksPanel";
import { QuickActionsPanel } from "@/components/organisms/subadmin/QuickActionsPanel";
import { PageHeader } from "@/components/shared/PageHeader";


export default function SubAdminDashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  if (!user) {
    return null;
  }

  const firstName = user.firstName || 'SubAdmin';

  return (
    <div className="flex flex-col min-h-screen">
    

      <PageHeader title={`Welcome, ${firstName}`} description={` Here&apos;s an overview of your recruitment activities`}/>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6">
        <div className="flex flex-col gap-6">

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="jobs">Jobs</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              {/* Metrics Panel */}
              <DashboardMetricsPanel />
              
              {/* Jobs and Quick Actions */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <AssignedJobsPanel />
                </div>
                <div className="lg:col-span-1">
                  <QuickActionsPanel />
                </div>
              </div>
              
              {/* Applications and Tasks */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div>
                  <RecentApplicationsPanel />
                </div>
                <div>
                  <TasksPanel />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="jobs" className="space-y-6">
              <h2 className="text-2xl font-bold">Assigned Jobs</h2>
              <p className="text-muted-foreground">
                Manage all jobs assigned to you
              </p>
              
              <AssignedJobsPanel />
            </TabsContent>
            
            <TabsContent value="tasks" className="space-y-6">
              <h2 className="text-2xl font-bold">Tasks & Reminders</h2>
              <p className="text-muted-foreground">
                Manage your tasks and upcoming deadlines
              </p>
              
              <TasksPanel />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
