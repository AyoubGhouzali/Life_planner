"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

interface OverdueBreakdownProps {
  data: { areaName: string; overdueCount: number }[];
}

export function OverdueBreakdown({ data }: OverdueBreakdownProps) {
  if (data.length === 0) {
    return (
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Overdue Tasks by Area</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
            <AlertTriangle className="h-10 w-10 mb-2 opacity-50" />
            <p className="text-sm">No overdue tasks!</p>
            <p className="text-xs mt-1">
              You&apos;re on top of your deadlines.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalOverdue = data.reduce((sum, item) => sum + item.overdueCount, 0);

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Overdue Tasks by Area</span>
          <span className="text-sm font-normal text-red-500">
            {totalOverdue} total overdue
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical">
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={true}
                vertical={false}
              />
              <XAxis
                type="number"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <YAxis
                dataKey="areaName"
                type="category"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                width={100}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="flex flex-col">
                          <span className="text-[0.70rem] uppercase text-muted-foreground">
                            {payload[0].payload.areaName}
                          </span>
                          <span className="font-bold text-red-500">
                            {payload[0].value} overdue tasks
                          </span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="overdueCount"
                fill="hsl(var(--destructive, 0 84% 60%))"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
