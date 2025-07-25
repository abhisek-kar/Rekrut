// In src/layout.tsx

import type { Metadata } from "next";
import "./globals.css";
import { Poppins, Open_Sans } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "@/components/shadcn-ui/sonner";
import { auth } from "@/auth"; // ✨ Import the auth function

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});
const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-open-sans",
});

export const metadata: Metadata = {
  title: "Rekrut ATS",
  description: "A recruitment platform",
};

// ✨ Make the component async
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ✨ Fetch the session on the server
  const session = await auth();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${poppins.variable} ${openSans.variable}`}>
        {/* ✨ Pass the server session to the provider */}
        <SessionProvider session={session}>
          {children}
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  );
}
