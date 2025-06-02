import type { Metadata } from "next";
import "./globals.css";
import { Poppins, Open_Sans } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "@/components/shadcn-ui/sonner";
import { SessionProviderWrapper } from "@/lib/auth/session-provider";
import { validateEnv } from "@/lib/env";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Validate environment variables at startup
if (typeof window === "undefined") {
  validateEnv();
} 

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});
const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-open-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Rekrut ATS",
  description: "A recruitment platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} ${openSans.variable}`}>
        <ErrorBoundary level="global">
          <SessionProviderWrapper>
            <AuthProvider>
              {children}
              <Toaster />
            </AuthProvider>
          </SessionProviderWrapper>
        </ErrorBoundary>
      </body>
    </html>
  );
}
