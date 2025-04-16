"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Lock,
  UserCheck,
  User,
  Shield,
} from "lucide-react";
import { useAuthForm } from "@/hooks/useAuthForm";
import { useAuth } from "@/context/AuthContext";

import { Button } from "@/components/shadcn-ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/shadcn-ui/form";
import { Input } from "@/components/shadcn-ui/input";
import { Checkbox } from "@/components/shadcn-ui/checkbox";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/shadcn-ui/card";
import appConfig from "@/lib/appConfig";

// Form validation schema
const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
  rememberMe: z.boolean(),
  role: z.enum(["admin", "subadmin"]),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "";
  const [showPassword, setShowPassword] = useState(false);
  const { isAuthenticated } = useAuth();
  const { isLoading, error, setError, handleLogin } = useAuthForm();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
      role: "admin",
    },
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push(redirectUrl || "/admin/dashboard");
    }
  }, [isAuthenticated, redirectUrl, router]);

  const onSubmit = async (data: LoginFormValues) => {
    await handleLogin(data);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="w-full max-w-md">
        {/* <div className="mb-8 flex justify-center">
          <Logo size="lg" />
        </div> */}

        <Card className="border-none shadow-lg">
          <CardHeader className="space-y-2 pb-2">
            <CardTitle className="text-2xl font-semibold text-center ">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-center text-gray-600">
              Log in to your account to continue
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {error && (
              <div className="mb-5 rounded-md bg-red-50 p-3.5 text-sm text-red-600 border border-red-200 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 text-red-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {error}
              </div>
            )}

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">
                        Email
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 bg-white rounded-full p-0.5">
                            <Mail className="h-4 w-4" />
                          </div>
                          <Input
                            placeholder="Enter your email"
                            type="email"
                            autoComplete="email"
                            className="pl-10 h-12 rounded-lg border-gray-300 focus:border-primary focus:ring-primary bg-white text-gray-800"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex justify-between items-center">
                        <FormLabel className="text-gray-700 font-medium">
                          Password
                        </FormLabel>
                        <Link
                          href="/forgot-password"
                          className="text-xs font-medium text-primary hover:underline"
                        >
                          Forgot password?
                        </Link>
                      </div>
                      <FormControl>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 bg-white rounded-full p-0.5">
                            <Lock className="h-4 w-4" />
                          </div>
                          <Input
                            placeholder="Enter your password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="current-password"
                            className="pl-10 h-12 rounded-lg border-gray-300 focus:border-primary focus:ring-primary bg-white text-gray-800"
                            {...field}
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                      <FormLabel className="text-gray-700 font-medium mb-2 block">
                        Login as
                      </FormLabel>
                      <div className="flex space-x-6 mt-1">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <div className="relative">
                            <input
                              type="radio"
                              name="role"
                              value="admin"
                              checked={field.value === "admin"}
                              onChange={() => field.onChange("admin")}
                              className="sr-only"
                            />
                            <div
                              className={`w-5 h-5 rounded-full border ${
                                field.value === "admin"
                                  ? "border-primary bg-primary"
                                  : "border-gray-300 bg-white"
                              } flex items-center justify-center`}
                            >
                              {field.value === "admin" && (
                                <div className="w-2 h-2 rounded-full bg-white"></div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center">
                            <Shield className="h-4 w-4 mr-1.5 text-gray-600" />
                            <span className="font-medium">Admin</span>
                          </div>
                        </label>

                        <label className="flex items-center space-x-2 cursor-pointer">
                          <div className="relative">
                            <input
                              type="radio"
                              name="role"
                              value="subadmin"
                              checked={field.value === "subadmin"}
                              onChange={() => field.onChange("subadmin")}
                              className="sr-only"
                            />
                            <div
                              className={`w-5 h-5 rounded-full border ${
                                field.value === "subadmin"
                                  ? "border-primary bg-primary"
                                  : "border-gray-300 bg-white"
                              } flex items-center justify-center`}
                            >
                              {field.value === "subadmin" && (
                                <div className="w-2 h-2 rounded-full bg-white"></div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-1.5 text-gray-600" />
                            <span className="font-medium">Recruiter</span>
                          </div>
                        </label>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="rememberMe"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                      <FormControl>
                        <div className="relative flex items-center">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="rounded border-gray-300 text-primary focus:ring-primary"
                          />
                        </div>
                      </FormControl>
                      <FormLabel className="text-sm font-normal text-gray-600 cursor-pointer">
                        Keep me signed in
                      </FormLabel>
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full h-12 text-base font-medium rounded-lg transition-all duration-200 hover:shadow-md hover:translate-y-[-1px]"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      <span>Logging in...</span>
                    </>
                  ) : (
                    <>
                      <UserCheck className="mr-2 h-5 w-5" /> Sign In
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-xs text-gray-500">
          &copy; {new Date().getFullYear()} {appConfig.COMPANY_NAME}. All rights
          reserved.
        </div>
      </div>
    </div>
  );
}
