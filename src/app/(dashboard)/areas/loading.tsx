import { Skeleton } from "@/components/ui/skeleton";
import { AreaSkeleton } from "@/components/shared/loading-skeleton";

export default function AreasLoading() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-[200px]" />
          <Skeleton className="h-4 w-[300px]" />
        </div>
        <Skeleton className="h-10 w-[120px]" />
      </div>
      <AreaSkeleton />
    </div>
  );
}
