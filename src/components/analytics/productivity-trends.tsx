"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface ProductivityTrendsProps {
  data: { thisWeek: number; lastWeek: number };
}

export function ProductivityTrends({ data }: ProductivityTrendsProps) {
  const { thisWeek, lastWeek } = data;
  const diff = thisWeek - lastWeek;
  const percentChange =
    lastWeek > 0 ? Math.round((diff / lastWeek) * 100) : thisWeek > 0 ? 100 : 0;

  const chartData = [
    { name: "Last Week", tasks: lastWeek },
    { name: "This Week", tasks: thisWeek },
  ];

  if (thisWeek === 0 && lastWeek === 0) {
    return (
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Productivity Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
            <TrendingUp className="h-10 w-10 mb-2 opacity-50" />
            <p className="text-sm">No completed tasks to compare yet.</p>
            <p className="text-xs mt-1">
              Complete some tasks to see your trends.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Productivity Trends</span>
          <span className="flex items-center gap-1 text-sm font-normal">
            {diff > 0 ? (
              <>
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-green-500">+{percentChange}%</span>
              </>
            ) : diff < 0 ? (
              <>
                <TrendingDown className="h-4 w-4 text-red-500" />
                <span className="text-red-500">{percentChange}%</span>
              </>
            ) : (
              <>
                <Minus className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">No change</span>
              </>
            )}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="name"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                fontSize={12}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                content={({ active, payload }: any) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="flex flex-col">
                          <span className="text-[0.70rem] uppercase text-muted-foreground">
                            {payload[0].payload.name}
                          </span>
                          <span className="font-bold">
                            {payload[0].value} tasks completed
                          </span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="tasks"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
