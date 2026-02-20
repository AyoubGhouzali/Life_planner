"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { Activity, CheckSquare, Folder } from "lucide-react";
import { useFilterStore } from "@/lib/stores/filter-store";

interface ActivityItem {
  id: string;
  type: string; // 'task' | 'project'
  title: string;
  updatedAt: Date;
  status: string;
  parentId: string;
  parentTitle: string | null;
}

interface RecentActivityProps {
  items: ActivityItem[];
}

export function RecentActivity({ items }: RecentActivityProps) {
  const { search } = useFilterStore();

  const filteredItems = items.filter((item) => {
    if (search && !item.title.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {filteredItems.length === 0 ? (
          <div className="flex h-32 flex-col items-center justify-center text-muted-foreground">
            <p>No recent activity found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredItems.map((item) => (
              <div
                key={`${item.type}-${item.id}`}
                className="flex items-start gap-4 border-b pb-4 last:border-0 last:pb-0"
              >
                <div className="mt-1 rounded-full bg-muted p-2">
                  {item.type === "task" ? (
                    <CheckSquare className="h-4 w-4 text-primary" />
                  ) : (
                    <Folder className="h-4 w-4 text-primary" />
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {item.type === "task" ? "Updated task" : "Updated project"}{" "}
                    <span className="font-semibold">&quot;{item.title}&quot;</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    in {item.parentTitle} •{" "}
                    {formatDistanceToNow(item.updatedAt, { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
