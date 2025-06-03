"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useAuthForm } from "@/hooks/useAuthForm";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  Mail,
  AlertCircle,
  CheckCircle,
  InfoIcon,
} from "lucide-react";
import { ButtonLoader } from "@/components/atoms/loader";

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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/shadcn-ui/card";
import { AppFooter } from "@/components/atoms/footer";

// Form validation schema
const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { isLoading, error, handleForgotPassword } = useAuthForm();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/admin/dashboard");
    }
  }, [isAuthenticated, router]);

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    const success = await handleForgotPassword(data.email);
    if (success) {
      setIsSubmitted(true);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="w-full max-w-md">
        <Card className="border-none shadow-lg overflow-hidden">
          <CardHeader className="space-y-2   pb-6">
            <CardTitle className="text-2xl font-semibold text-center ">
              Forgot your password?
            </CardTitle>
            <CardDescription className="text-center text-gray-600">
              Enter your email address and we&apos;ll send you a link to reset your
              password
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            {error && (
              <div className="mb-5 rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-200 flex items-start">
                <AlertCircle className="h-5 w-5 mr-3 text-red-500 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {isSubmitted ? (
              <div className="space-y-6">
                <div className="rounded-lg bg-green-50 p-5 border border-green-200">
                  <div className="flex items-center mb-3">
                    <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
                    <h3 className="font-semibold text-green-800">
                      Email Sent Successfully
                    </h3>
                  </div>
                  <div className="text-green-700 ml-9">
                    <p>
                      Password reset instructions have been sent to your email
                      address.
                    </p>
                    <p className="mt-2">
                      Please check your inbox and spam folder, then follow the
                      instructions to reset your password.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button asChild className="w-full h-12 text-base font-medium">
                    <Link href="/login">Return to Login</Link>
                  </Button>
                  <p className="text-center text-sm text-gray-500">
                    Didn&apos;t receive an email?{" "}
                    <button
                      type="button"
                      onClick={() => form.handleSubmit(onSubmit)()}
                      className="text-primary font-medium hover:underline"
                    >
                      Resend
                    </button>
                  </p>
                </div>
              </div>
            ) : (
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-5"
                >
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 mb-2">
                    <div className="flex items-start gap-2 text-gray-700">
                      <InfoIcon className="" />
                      <span className="text-sm ">
                        We&apos;ll send you an email with instructions to reset your
                        password. Make sure to check your spam folder.
                      </span>
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">
                          Email Address
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 bg-white rounded-full p-0.5">
                              <Mail className="h-4 w-4" />
                            </div>
                            <Input
                              placeholder="Enter your email address"
                              type="email"
                              autoComplete="email"
                              autoFocus
                              className="pl-10 h-12 rounded-lg border-gray-300 focus:border-primary focus:ring-primary bg-white text-gray-800"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-500" />
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
                        <ButtonLoader size="sm" />
                        Sending Email...
                      </>
                    ) : (
                      "Send Reset Instructions"
                    )}
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>

          <CardFooter className="flex justify-center border-t bg-gray-50 py-4">
            <Link
              href="/login"
              className="text-sm font-medium text-gray-600 inline-flex items-center hover:text-primary transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to login
            </Link>
          </CardFooter>
        </Card>

        <AppFooter />
      </div>
    </div>
  );
}
