"use client";

import { useState } from "react";
import Link from "next/link";
import { useActionState } from "react";
import { Eye, EyeOff, Mail, Lock, UserCheck } from "lucide-react";
import { Button } from "@/components/shadcn-ui/button";
import { Input } from "@/components/shadcn-ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/shadcn-ui/card";
import { AppFooter } from "@/components/atoms/footer";
import { ButtonLoader } from "@/components/atoms/loader";
import { useFormStatus } from "react-dom";
import { authenticate } from "@/app/(auth)/login/actions";

function LoginButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full h-12" disabled={pending}>
      {pending ? (
        <>
          <ButtonLoader size="sm" />
          <span>Logging in...</span>
        </>
      ) : (
        <>
          <UserCheck className="mr-2 h-5 w-5" /> Sign In
        </>
      )}
    </Button>
  );
}

// Renamed to LoginForm to reflect its role
export function LoginForm() {
  const [errorMessage, dispatch] = useActionState(authenticate, undefined);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-bold">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-center">
              Log in to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={dispatch} className="space-y-6">
              <div>
                <label htmlFor="email">Email</label>
                <div className="relative mt-1">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="pl-10 h-12"
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between">
                  <label htmlFor="password">Password</label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative mt-1">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    className="pl-10 h-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              {errorMessage && (
                <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md">
                  {errorMessage}
                </div>
              )}
              <LoginButton />
            </form>
          </CardContent>
        </Card>
        <AppFooter />
      </div>
    </div>
  );
}
