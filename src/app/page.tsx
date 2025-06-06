// "use client";

// import { useEffect, Suspense } from "react";
// import { useRouter } from "next/navigation";
// import { useAuth } from "@/context/AuthContext";
// import { getDashboardRoute } from "@/lib/routes";
// import { PageLoader } from "@/components/atoms/loader";
// import dynamic from "next/dynamic";

// // Lazy load components for better performance
// const Header = dynamic(() => import("@/components/landing/Header"), {
//   ssr: true,
// });

// const HeroSection = dynamic(() => import("@/components/landing/HeroSection"), {
//   ssr: true,
// });

// const StatsSection = dynamic(() => import("@/components/landing/StatsSection"), {
//   ssr: false,
// });

// const FeaturesSection = dynamic(() => import("@/components/landing/FeaturesSection"), {
//   ssr: false,
// });

// const BenefitsSection = dynamic(() => import("@/components/landing/BenefitsSection"), {
//   ssr: false,
// });

// const TestimonialsSection = dynamic(() => import("@/components/landing/TestimonialsSection"), {
//   ssr: false,
// });

// const PricingSection = dynamic(() => import("@/components/landing/PricingSection"), {
//   ssr: false,
// });

// const CTASection = dynamic(() => import("@/components/landing/CTASection"), {
//   ssr: false,
// });

// const Footer = dynamic(() => import("@/components/landing/Footer"), {
//   ssr: false,
// });

// // Loading component for sections
// const SectionLoader = () => (
//   <div className="w-full h-32 flex items-center justify-center">
//     <div className="animate-pulse flex space-x-4">
//       <div className="rounded-full bg-gray-300 h-10 w-10"></div>
//       <div className="flex-1 space-y-2 py-1">
//         <div className="h-4 bg-gray-300 rounded w-3/4"></div>
//         <div className="h-4 bg-gray-300 rounded w-1/2"></div>
//       </div>
//     </div>
//   </div>
// );

// export default function LandingPage() {
//   const router = useRouter();
//   const { user, isAuthenticated } = useAuth();

//   // Redirect authenticated users to their dashboard
//   useEffect(() => {
//     if (isAuthenticated && user) {
//       const dashboardRoute = getDashboardRoute(user.role);
//       router.push(dashboardRoute);
//     }
//   }, [isAuthenticated, user, router]);

//   // If authenticated, show redirecting state
//   if (isAuthenticated && user) {
//     return <PageLoader message="Redirecting to your dashboard..." />;
//   }

//   return (
//     <div className="min-h-screen bg-white">
//       {/* Header */}
//       <Suspense fallback={<div className="h-16 bg-white border-b"></div>}>
//         <Header />
//       </Suspense>

//       {/* Hero Section */}
//       <Suspense fallback={<SectionLoader />}>
//         <HeroSection />
//       </Suspense>

//       {/* Stats Section */}
//       <Suspense fallback={<SectionLoader />}>
//         <StatsSection />
//       </Suspense>

//       {/* Features Section */}
//       <Suspense fallback={<SectionLoader />}>
//         <FeaturesSection />
//       </Suspense>

//       {/* Benefits Section */}
//       <Suspense fallback={<SectionLoader />}>
//         <BenefitsSection />
//       </Suspense>

//       {/* Testimonials Section */}
//       <Suspense fallback={<SectionLoader />}>
//         <TestimonialsSection />
//       </Suspense>

//       {/* Pricing Section */}
//       <Suspense fallback={<SectionLoader />}>
//         <PricingSection />
//       </Suspense>

//       {/* CTA Section */}
//       <Suspense fallback={<SectionLoader />}>
//         <CTASection />
//       </Suspense>

//       {/* Footer */}
//       <Suspense fallback={<SectionLoader />}>
//         <Footer />
//       </Suspense>
//     </div>
//   );
// }

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
        div
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