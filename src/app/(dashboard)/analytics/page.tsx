import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  getCompletionOverTime,
  getAreaDistribution,
  getLifeBalanceScores,
  getStreakSummary,
  getTimeDistribution,
  AnalyticsPeriod,
} from "@/lib/db/queries/analytics";
import { CompletionChart } from "@/components/analytics/completion-chart";
import { AreaDistribution } from "@/components/analytics/area-distribution";
import { LifeBalanceRadar } from "@/components/analytics/life-balance-radar";
import { TimeDistribution } from "@/components/analytics/time-distribution";
import { StreakOverview } from "@/components/analytics/streak-overview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { PeriodSelector } from "@/components/analytics/period-selector";

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { period = "last30" } = await searchParams;
  const analyticsPeriod = period as AnalyticsPeriod;

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
      </div>

      <PeriodSelector defaultValue={analyticsPeriod} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Suspense fallback={<StatsSkeleton />}>
            <SummaryStats userId={user.id} period={analyticsPeriod} />
          </Suspense>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <div className="col-span-4">
            <Suspense fallback={<ChartSkeleton />}>
              <CompletionChartWrapper userId={user.id} period={analyticsPeriod} />
            </Suspense>
          </div>
          <div className="col-span-3">
            <Suspense fallback={<ChartSkeleton />}>
              <AreaDistributionWrapper userId={user.id} period={analyticsPeriod} />
            </Suspense>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <div className="col-span-3">
            <Suspense fallback={<ChartSkeleton />}>
              <LifeBalanceRadarWrapper userId={user.id} period={analyticsPeriod} />
            </Suspense>
          </div>
          <div className="col-span-4">
            <Suspense fallback={<ChartSkeleton />}>
              <TimeDistributionWrapper userId={user.id} period={analyticsPeriod} />
            </Suspense>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-1">
          <Suspense fallback={<ChartSkeleton />}>
            <StreakOverviewWrapper userId={user.id} />
          </Suspense>
        </div>
      </div>
  );
}

async function SummaryStats({ userId, period }: { userId: string, period: AnalyticsPeriod }) {
  // We can calculate some summary stats here
  const completions = await getCompletionOverTime(userId, period);
  const totalCompleted = completions.reduce((acc, curr) => acc + curr.count, 0);
  const avgDaily = completions.length > 0 ? (totalCompleted / completions.length).toFixed(1) : 0;

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Completed</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalCompleted}</div>
          <p className="text-xs text-muted-foreground">
            Tasks finished in this period
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Daily Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{avgDaily}</div>
          <p className="text-xs text-muted-foreground">
            Consistent output
          </p>
        </CardContent>
      </Card>
    </>
  );
}

async function CompletionChartWrapper({ userId, period }: { userId: string, period: AnalyticsPeriod }) {
  const data = await getCompletionOverTime(userId, period);
  return <CompletionChart data={data} />;
}

async function AreaDistributionWrapper({ userId, period }: { userId: string, period: AnalyticsPeriod }) {
  const now = new Date();
  const from = new Date();
  if (period === "week") from.setDate(now.getDate() - 7);
  else if (period === "last30") from.setDate(now.getDate() - 30);
  else from.setDate(now.getDate() - 90);

  const data = await getAreaDistribution(userId, { from, to: now });
  return <AreaDistribution data={data} />;
}

async function LifeBalanceRadarWrapper({ userId, period }: { userId: string, period: AnalyticsPeriod }) {
  const now = new Date();
  const from = new Date();
  if (period === "week") from.setDate(now.getDate() - 7);
  else if (period === "last30") from.setDate(now.getDate() - 30);
  else from.setDate(now.getDate() - 90);

  const data = await getLifeBalanceScores(userId, { from, to: now });
  return <LifeBalanceRadar data={data} />;
}

async function TimeDistributionWrapper({ userId, period }: { userId: string, period: AnalyticsPeriod }) {
  const now = new Date();
  const from = new Date();
  if (period === "week") from.setDate(now.getDate() - 7);
  else if (period === "last30") from.setDate(now.getDate() - 30);
  else from.setDate(now.getDate() - 90);

  const data = await getTimeDistribution(userId, { from, to: now });
  return <TimeDistribution data={data} />;
}

async function StreakOverviewWrapper({ userId }: { userId: string }) {
  const data = await getStreakSummary(userId);
  return <StreakOverview data={data} />;
}

function StatsSkeleton() {
  return (
    <>
      <Card><CardHeader className="h-20" /><CardContent className="h-10" /></Card>
      <Card><CardHeader className="h-20" /><CardContent className="h-10" /></Card>
    </>
  );
}

function ChartSkeleton() {
  return (
    <Card className="w-full h-[350px]">
      <CardHeader>
        <Skeleton className="h-6 w-[150px]" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[250px] w-full" />
      </CardContent>
    </Card>
  );
}
