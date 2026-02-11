import { AreaSkeleton } from "@/components/shared/loading-skeleton";

export default function Loading() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Life Areas</h1>
          <p className="text-muted-foreground">
            Manage the different domains of your life.
          </p>
        </div>
      </div>
      <AreaSkeleton />
    </div>
  );
}
