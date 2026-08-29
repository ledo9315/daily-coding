import { Header } from "@/components/header";
import { Skeleton } from "@/components/ui/skeleton";

// Without this file app/challenge/loading.tsx applies and the editor skeleton flashes here.
export default function ChallengeResultLoading() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
        <Skeleton className="mt-6 h-72 w-full" />
        <Skeleton className="mt-6 h-48 w-full" />
      </main>
    </div>
  );
}
