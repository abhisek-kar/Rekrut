import Link from "next/link";
import { ArrowLeft } from "lucide-react"; // Assuming you have lucide-react installed

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-12 bg-gradient-to-b from-white to-gray-50 sm:px-6">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="space-y-4">
          <h1 className="text-6xl font-bold  text-gray-900 sm:text-7xl">
            <span className="block animate-bounce  text-clamp-3xl">404</span>
            <span className="block text-clamp-lg mt-2">Page Not Found</span>
          </h1>
          <p className="text-clamp-sm text-gray-600">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-gray-900 px-6 text-sm font-medium text-white shadow-sm transition-all hover:bg-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950"
          >
            <ArrowLeft size={18} />
            Back to Home
          </Link>
          <Link
            href="/contact"
            className="inline-flex h-12 items-center justify-center rounded-md border border-gray-300 bg-white px-6 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}
