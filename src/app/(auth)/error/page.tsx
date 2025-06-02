"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/shadcn-ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/shadcn-ui/card";
import { AppFooter } from "@/components/atoms/footer";

// Error codes from NextAuth
const errorMessages: Record<string, string> = {
  Signin: "Try signing in with a different account.",
  OAuthSignin: "Try signing in with a different account.",
  OAuthCallback: "Try signing in with a different account.",
  OAuthCreateAccount: "Try signing in with a different account.",
  EmailCreateAccount: "Try signing in with a different account.",
  Callback: "Try signing in with a different account.",
  OAuthAccountNotLinked: "To confirm your identity, sign in with the same account you used originally.",
  EmailSignin: "The e-mail could not be sent.",
  CredentialsSignin: "Sign in failed. Check the details you provided are correct.",
  SessionRequired: "Please sign in to access this page.",
  default: "Unable to sign in.",
};

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      setError(errorMessages[errorParam] || errorMessages.default);
    } else {
      setError(errorMessages.default);
    }
  }, [searchParams]);

  const handleRetry = () => {
    router.push("/login");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="w-full max-w-md">
        <Card className="border-none shadow-lg">
          <CardHeader className="space-y-2 pb-2 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-semibold text-gray-900">
              Authentication Error
            </CardTitle>
            <CardDescription className="text-gray-600">
              There was a problem signing you in
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-6">
            <div className="rounded-lg bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>

            <div className="space-y-3">
              <Button onClick={handleRetry} className="w-full" size="lg">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
              
              <Button asChild variant="outline" className="w-full" size="lg">
                <Link href="/">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Go Home
                </Link>
              </Button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-500">
                Need help?{" "}
                <Link href="/forgot-password" className="text-primary hover:underline">
                  Reset your password
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <AppFooter />
      </div>
    </div>
  );
}
