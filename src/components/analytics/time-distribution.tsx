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

interface TimeDistributionProps {
  data: { areaName: string; totalDuration: number | null }[];
}

export function TimeDistribution({ data }: TimeDistributionProps) {
  const formattedData = data.map(item => ({
    ...item,
    hours: item.totalDuration ? (item.totalDuration / 3600).toFixed(1) : 0
  }));

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Time Distribution (Hours)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={formattedData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
              <XAxis type="number" fontSize={12} tickLine={false} axisLine={false} />
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
                          <span className="font-bold">
                            {payload[0].value} hours
                          </span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="hours"
                fill="hsl(var(--primary))"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
