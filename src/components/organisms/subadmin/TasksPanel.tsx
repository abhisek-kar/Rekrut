'use client';

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/shadcn-ui/card";
import { Button } from "@/components/shadcn-ui/button";
import { Checkbox } from "@/components/shadcn-ui/checkbox";
import {
  BriefcaseIcon,
  UserIcon,
  CalendarIcon,
  ClockIcon,
  ChevronRightIcon,
  RefreshCwIcon,
  CircleIcon,
} from "lucide-react";
import { Badge } from "@/components/shadcn-ui/badge";
import { formatDistanceToNow, format } from "date-fns";
import Link from "next/link";
import { toast } from "sonner";
import { tasksService } from "@/services";
import { SectionLoader } from "@/components/atoms/loader";
import { ButtonLoader } from "@/components/atoms/loader";
import { Skeleton } from "@/components/shadcn-ui/skeleton";

interface Task {
  _id: string;
  title: string;
  description?: string;
  dueDate?: string;
  priority: "low" | "medium" | "high";
  status: "pending" | "inProgress" | "completed" | "cancelled";
  taskType: "interview" | "followUp" | "review" | "custom";
  relatedEntityType?: "job" | "application" | "candidate";
  relatedEntityId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface TasksResponse {
  tasks: Task[];
  counts: {
    all: number;
    pending: number;
    inProgress: number;
    completed: number;
    cancelled: number;
  };
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export function TasksPanel() {
  const [data, setData] = useState<TasksResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await tasksService.getSubAdminTasks({ 
        status: 'pending', 
        limit: 5 
      });
      setData(data);
    } catch (err) {
      setError("Error loading tasks");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleRefresh = () => {
    fetchTasks();
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl">Tasks & Reminders</CardTitle>
          <CardDescription>
            Your pending tasks and upcoming reminders
          </CardDescription>
        </div>
        <Button variant="ghost" size="icon" onClick={handleRefresh}>
          <RefreshCwIcon className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <SectionLoader message="Loading tasks..." height="300px" />
        ) : error ? (
          <div className="p-4 text-sm text-red-800 rounded-lg bg-red-50">
            {error}
          </div>
        ) : data?.tasks.length === 0 ? (
          <div className="p-4 text-center">
            <p className="text-sm text-gray-500">No pending tasks</p>
          </div>
        ) : (
          <div className="space-y-2">
            {data?.tasks.map((task) => (
              <TaskItem key={task._id} task={task} onTaskComplete={fetchTasks} />
            ))}
            
            <div className="text-center pt-4">
              <Link href="/subadmin/tasks">
                <Button variant="outline" className="gap-1">
                  View All Tasks <ChevronRightIcon className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TaskItem({ task, onTaskComplete }: { task: Task; onTaskComplete: () => void }) {
  const [isCompleting, setIsCompleting] = useState(false);
  
  const getTaskIcon = (taskType: string) => {
    switch (taskType) {
      case "interview":
        return <CalendarIcon className="w-4 h-4 text-indigo-500" />;
      case "review":
        return <BriefcaseIcon className="w-4 h-4 text-amber-500" />;
      case "followUp":
        return <UserIcon className="w-4 h-4 text-green-500" />;
      default:
        return <CircleIcon className="w-4 h-4 text-gray-400" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge className="bg-red-100 text-red-800 border-red-200">High</Badge>;
      case "medium":
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Medium</Badge>;
      case "low":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Low</Badge>;
      default:
        return null;
    }
  };

  const handleTaskComplete = async () => {
    setIsCompleting(true);
    try {
      await tasksService.updateTask(task._id, {
        status: 'completed',
      });

      toast.success("Task marked as complete");
      onTaskComplete();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update task status");
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <div className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-md transition-colors">
      <div className="pt-0.5">
        <Checkbox 
          checked={task.status === "completed"} 
          onCheckedChange={handleTaskComplete}
          disabled={isCompleting || task.status === "completed"}
        />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {getTaskIcon(task.taskType)}
            <h4 className="font-medium text-sm">{task.title}</h4>
          </div>
          
          {task.priority && getPriorityBadge(task.priority)}
        </div>
        
        {task.description && (
          <p className="text-xs text-gray-500 mt-1">{task.description}</p>
        )}
        
        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
          {task.dueDate && (
            <div className="flex items-center gap-1">
              <ClockIcon className="w-3 h-3" />
              <span className={getDueDateClasses(new Date(task.dueDate))}>
                {formatDueDate(new Date(task.dueDate))}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function formatDueDate(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  if (date < today) {
    return `Overdue: ${formatDistanceToNow(date, { addSuffix: true })}`;
  } else if (date.getTime() === today.getTime()) {
    return `Today, ${format(date, 'h:mm a')}`;
  } else if (date.getTime() === tomorrow.getTime()) {
    return `Tomorrow, ${format(date, 'h:mm a')}`;
  } else {
    return format(date, 'MMM d, h:mm a');
  }
}

function getDueDateClasses(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  if (date < today) {
    return "text-red-600 font-medium";
  } else if (date.getTime() === today.getTime()) {
    return "text-amber-600 font-medium";
  } else {
    return "text-gray-500";
  }
}
