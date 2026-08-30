import { Header } from "@/components/header";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PageAmbience } from "@/components/page-ambience";

function TableRowSkeleton() {
  return (
    <div className="flex items-center gap-4 border-b border-border px-4 py-4">
      <Skeleton className="h-8 w-8 rounded-full shrink-0" />
      <Skeleton className="h-10 w-10 rounded-full shrink-0" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="h-5 w-16" />
    </div>
  );
}

export default function RankingLoading() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <PageAmbience />

      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 relative">
        <div className="mb-8 space-y-2">
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-5 w-72" />
        </div>

        {/* Tabs */}
        <Skeleton className="h-10 w-64 mb-6" />

        {/* Podium Card */}
        <Card className="mb-8 shadow-[0_0_40px_-10px_rgba(163,113,247,0.3)] border-chart-5/50">
          <CardHeader>
            <Skeleton className="h-6 w-32 mx-auto" />
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-center gap-4">
              {/* 2nd */}
              <div className="flex flex-col items-center gap-2">
                <Skeleton className="h-12 w-12 rounded-full" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-16 w-24" />
              </div>
              {/* 1st */}
              <div className="flex flex-col items-center gap-2">
                <Skeleton className="h-14 w-14 rounded-full" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-24 w-24" />
              </div>
              {/* 3rd */}
              <div className="flex flex-col items-center gap-2">
                <Skeleton className="h-12 w-12 rounded-full" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-12 w-24" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <div className="border border-border overflow-hidden">
          <div className="flex gap-4 border-b border-border bg-secondary/50 px-4 py-3">
            <Skeleton className="h-4 w-10" />
            <Skeleton className="h-4 w-20" />
          </div>
          {Array.from({ length: 8 }).map((_, i) => (
            <TableRowSkeleton key={i} />
          ))}
        </div>
      </main>
    </div>
  );
}
