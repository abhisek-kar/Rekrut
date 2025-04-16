import Link from "next/link";
import { ArrowLeft } from "lucide-react"; // Assuming you have lucide-react installed
import { Button } from "@/components/shadcn-ui/button";

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-12 bg-gradient-to-b from-white to-gray-50 sm:px-6">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="space-y-4">
          <h1 className="   text-gray-900  font-bold">
            <span className="block animate-bounce  text-clamp-3xl">404</span>
            <span className="block text-clamp-lg  mt-2">Page Not Found</span>
          </h1>
          <p className="text-clamp-sm  text-gray-600">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <Button variant={"ghost"} asChild>
          <Link href="/" className="">
            <ArrowLeft size={18} />
            Back to Home{" "}
          </Link>
        </Button>
      </div>
    </div>
  );
}
