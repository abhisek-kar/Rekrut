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
import { AUTH_ROUTES, getDashboardRoute } from "@/lib/routes";

import { Button } from "@/components/shadcn-ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/shadcn-ui/form";
import { Tabs, TabsList, TabsTrigger } from "@/components/shadcn-ui/tabs";
import { Input } from "@/components/shadcn-ui/input";
import { Checkbox } from "@/components/shadcn-ui/checkbox";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/shadcn-ui/card";
import { AppFooter } from "@/components/atoms/footer";

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
  const { user, isAuthenticated, isLoading } = useAuth();
  const { isLoading: authFormLoading, error, handleLogin } = useAuthForm();

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
    if (!isLoading && isAuthenticated && user) {
      const defaultRedirect = redirectUrl || getDashboardRoute(user.role);
      router.push(defaultRedirect);
    }
  }, [isAuthenticated, isLoading, user, redirectUrl, router]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If authenticated, show redirect message
  if (isAuthenticated && user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  const onSubmit = async (data: LoginFormValues) => {
    await handleLogin(data);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="w-full max-w-md">
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
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
                method="POST" // Explicitly set method to POST
              >
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-gray-700 font-medium">
                        Login as
                      </FormLabel>
                      <FormControl>
                        <Tabs
                          value={field.value}
                          onValueChange={field.onChange}
                          className="w-full"
                        >
                          <TabsList className="grid w-full grid-cols-2">
                            {["admin", "subadmin"].map((item) => (
                              <TabsTrigger
                                key={item}
                                value={item}
                                className=" data-[state=active]:text-primary "
                              >
                                <div className="flex items-center">
                                  {item === "admin" ? (
                                    <Shield className="h-4 w-4 mr-2" />
                                  ) : (
                                    <User className="h-4 w-4 mr-2" />
                                  )}

                                  <span>
                                    {item.charAt(0).toUpperCase() +
                                      item.slice(1)}
                                  </span>
                                </div>
                              </TabsTrigger>
                            ))}
                          </TabsList>
                        </Tabs>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                          href={AUTH_ROUTES.FORGOT_PASSWORD}
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

                {error && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-12 text-base font-medium rounded-lg transition-all duration-200 hover:shadow-md hover:translate-y-[-1px]"
                  disabled={authFormLoading}
                >
                  {authFormLoading ? (
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

        <AppFooter />
      </div>
    </div>
  );
}
