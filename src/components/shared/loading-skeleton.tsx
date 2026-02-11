import { Skeleton } from "@/components/ui/skeleton";

export function AreaSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="border rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-4 rounded-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-8 w-12" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function KanbanSkeleton() {
  return (
    <div className="flex gap-4 h-full overflow-hidden">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="w-[300px] shrink-0 bg-muted/50 rounded-xl border border-border flex flex-col">
          <div className="p-3 border-b bg-background/50 rounded-t-xl flex items-center justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-4" />
          </div>
          <div className="p-2 space-y-2">
            {Array.from({ length: 3 }).map((_, j) => (
              <div key={j} className="bg-background border rounded-lg p-3 space-y-3">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-3 w-10" />
                </div>
                <Skeleton className="h-4 w-full" />
                <div className="space-y-1">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-1.5 w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
