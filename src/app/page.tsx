import { Button } from "@/components/atoms/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-between p-24">
      <Button asChild>
        <Link href="/auth/sign-in">Sign In</Link>
      </Button>
    </div>
  );
}
