import { Button } from "@/components/shadcn-ui/button";
import Link from "next/link";
import { Logo } from "@/components/atoms/logo";

export default function Home() {
  return (
    <div className="min-h-screen  p-4 bg-gray-50">
      <div className="flex items-center justify-between">
        <Logo size="xl" />
        <Button asChild>
          <Link href="/login">Go to Login</Link>
        </Button>
      </div>
    </div>
  );
}
