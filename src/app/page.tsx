"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getDashboardRoute } from "@/lib/routes";
import { Button } from "@/components/shadcn-ui/button";
import { Skeleton } from "@/components/shadcn-ui/skeleton";
import Link from "next/link";
import { Logo } from "@/components/atoms/logo";

export default function Home() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  // Redirect authenticated users to their dashboard
  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      const dashboardRoute = getDashboardRoute(user.role);
      router.push(dashboardRoute);
    }
  }, [isAuthenticated, isLoading, user, router]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen p-4 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-48" />
          </div>
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="flex items-center justify-center mt-32">
          <div className="text-center">
            <Skeleton className="h-8 w-64 mx-auto mb-4" />
            <Skeleton className="h-4 w-96 mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  // If authenticated, this will redirect, but show loading state briefly
  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen p-4 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  // Show homepage for non-authenticated users
  return (
    <div className="min-h-screen p-4 bg-gray-50">
      <div className="flex items-center justify-between">
        <Logo size="xl" />
        <Button asChild>
          <Link href="/login">Go to Login</Link>
        </Button>
      </div>
      
      <div className="flex items-center justify-center mt-32">
        <div className="text-center max-w-md">
          <h1 className="text-4xl font-bold mb-4">Welcome to Rekrut ATS</h1>
          <p className="text-muted-foreground mb-8">
            Streamline your recruitment process with our modern applicant tracking system.
          </p>
          <Button asChild size="lg">
            <Link href="/login">Get Started</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}