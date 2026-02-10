import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <h1 className="mb-4 text-5xl font-bold tracking-tight">LifePlanner</h1>
      <p className="mb-8 max-w-lg text-xl text-muted-foreground">
        One place to plan, track, and optimize every area of your life.
      </p>
      <div className="flex gap-4">
        <Button asChild size="lg">
          <Link href="/login">Login</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/signup">Sign Up</Link>
        </Button>
      </div>
    </div>
  );
}
