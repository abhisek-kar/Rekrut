import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/nextauth';
import { getDashboardRoute } from '@/lib/routes';

/**
 * Dashboard redirect page
 * This page redirects users to their role-specific dashboard
 * - Admin users → /admin/dashboard
 * - SubAdmin users → /subadmin/dashboard
 */
export default async function DashboardPage() {
  // Get the current user session
  const session = await getServerSession(authOptions);
  
  // If no session, redirect to login
  if (!session?.user) {
    redirect('/login');
  }
  
  // Redirect to role-specific dashboard
  const dashboardRoute = getDashboardRoute(session.user.role);
  redirect(dashboardRoute);
}