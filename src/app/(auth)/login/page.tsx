import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getDashboardRoute } from "@/lib/routes";
import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage() {
  const session = await auth();

  // If the user is already authenticated, this will redirect them to their
  // dashboard and the LoginForm component below will never be rendered.
  // This completely solves the redirect loop.
  if (session?.user) {
    const dashboardRoute = getDashboardRoute(session.user.role);
    redirect(dashboardRoute);
  }

  // Only render the client component with the form if the user is not logged in.
  return <LoginForm />;
}
