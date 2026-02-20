"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target } from "lucide-react";
import { useIsMounted } from "@/hooks/use-mounted";

interface LifeBalanceRadarProps {
  data: { name: string; score: number }[];
}

export function LifeBalanceRadar({ data }: LifeBalanceRadarProps) {
  const mounted = useIsMounted();

  const hasActivity = data.some((d) => d.score > 0);

  if (data.length === 0 || !hasActivity) {
    return (
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Life Balance Radar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
            <Target className="h-10 w-10 mb-2 opacity-50" />
            <p className="text-sm">No activity data for this period.</p>
            <p className="text-xs mt-1">
              Complete tasks, log habits, or track time to see your balance.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Life Balance Radar</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          {mounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                <PolarGrid />
                <PolarAngleAxis dataKey="name" fontSize={12} />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, "auto"]}
                  fontSize={10}
                />
                <Radar
                  name="Score"
                  dataKey="score"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.6}
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
                              Score: {payload[0].value}
                            </span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full w-full bg-muted/20 animate-pulse rounded-md" />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
