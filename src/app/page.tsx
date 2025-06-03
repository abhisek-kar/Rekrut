"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getDashboardRoute } from "@/lib/routes";
import { Button } from "@/components/shadcn-ui/button";
import { PageLoader } from "@/components/atoms/loader";
import Link from "next/link";
import { Logo } from "@/components/atoms/logo";

export default function Home() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  // Redirect authenticated users to their dashboard
  useEffect(() => {
    if (isAuthenticated && user) {
      const dashboardRoute = getDashboardRoute(user.role);
      router.push(dashboardRoute);
    }
  }, [isAuthenticated, user, router]);

  // If authenticated, show redirecting state
  if (isAuthenticated && user) {
    return <PageLoader message="Redirecting to your dashboard..." />;
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