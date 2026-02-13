import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  getCompletionOverTime,
  getAreaDistribution,
  getLifeBalanceScores,
  getProductivityTrends,
  getOverdueAnalysis,
  getStreakSummary,
  getTimeDistribution,
  type AnalyticsPeriod,
} from "@/lib/db/queries/analytics";
import { CompletionChart } from "@/components/analytics/completion-chart";
import { AreaDistribution } from "@/components/analytics/area-distribution";
import { LifeBalanceRadar } from "@/components/analytics/life-balance-radar";
import { TimeDistribution } from "@/components/analytics/time-distribution";
import { StreakOverview } from "@/components/analytics/streak-overview";
import { ProductivityTrends } from "@/components/analytics/productivity-trends";
import { OverdueBreakdown } from "@/components/analytics/overdue-breakdown";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PeriodSelector } from "@/components/analytics/period-selector";
import {
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  Flame,
} from "lucide-react";

const VALID_PERIODS = new Set<AnalyticsPeriod>(["week", "month", "last30", "last90", "custom"]);

function getDateRange(
  period: AnalyticsPeriod,
  customFrom?: string,
  customTo?: string
): { from: Date; to: Date } {
  const now = new Date();
  const from = new Date();

  if (period === "custom" && customFrom && customTo) {
    return { from: new Date(customFrom), to: new Date(customTo) };
  }

  switch (period) {
    case "week":
      from.setDate(now.getDate() - 7);
      break;
    case "month":
      from.setMonth(now.getMonth() - 1);
      from.setDate(1);
      break;
    case "last30":
      from.setDate(now.getDate() - 30);
      break;
    case "last90":
      from.setDate(now.getDate() - 90);
      break;
    default:
      from.setDate(now.getDate() - 30);
  }

  return { from, to: now };
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; from?: string; to?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const params = await searchParams;
  const rawPeriod = params.period ?? "last30";
  const analyticsPeriod: AnalyticsPeriod = VALID_PERIODS.has(rawPeriod as AnalyticsPeriod)
    ? (rawPeriod as AnalyticsPeriod)
    : "last30";
  const customFrom = params.from;
  const customTo = params.to;

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
      </div>

      <PeriodSelector defaultValue={analyticsPeriod} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Suspense fallback={<StatsSkeleton />}>
          <SummaryStats
            userId={user.id}
            period={analyticsPeriod}
            customFrom={customFrom}
            customTo={customTo}
          />
        </Suspense>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-full lg:col-span-4">
          <Suspense fallback={<ChartSkeleton />}>
            <CompletionChartWrapper
              userId={user.id}
              period={analyticsPeriod}
              customFrom={customFrom}
              customTo={customTo}
            />
          </Suspense>
        </div>
        <div className="col-span-full lg:col-span-3">
          <Suspense fallback={<ChartSkeleton />}>
            <AreaDistributionWrapper
              userId={user.id}
              period={analyticsPeriod}
              customFrom={customFrom}
              customTo={customTo}
            />
          </Suspense>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-full lg:col-span-3">
          <Suspense fallback={<ChartSkeleton />}>
            <ProductivityTrendsWrapper userId={user.id} />
          </Suspense>
        </div>
        <div className="col-span-full lg:col-span-4">
          <Suspense fallback={<ChartSkeleton />}>
            <OverdueBreakdownWrapper userId={user.id} />
          </Suspense>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-full lg:col-span-3">
          <Suspense fallback={<ChartSkeleton />}>
            <LifeBalanceRadarWrapper
              userId={user.id}
              period={analyticsPeriod}
              customFrom={customFrom}
              customTo={customTo}
            />
          </Suspense>
        </div>
        <div className="col-span-full lg:col-span-4">
          <Suspense fallback={<ChartSkeleton />}>
            <TimeDistributionWrapper
              userId={user.id}
              period={analyticsPeriod}
              customFrom={customFrom}
              customTo={customTo}
            />
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

// --- Wrapper props ---
interface WrapperProps {
  userId: string;
  period: AnalyticsPeriod;
  customFrom?: string;
  customTo?: string;
}

// --- Summary Stats ---
async function SummaryStats({ userId, period, customFrom, customTo }: WrapperProps) {
  const dateRange = getDateRange(period, customFrom, customTo);
  const [completions, trends, streaks, overdue] = await Promise.all([
    getCompletionOverTime(userId, period, period === "custom" ? dateRange : undefined),
    getProductivityTrends(userId),
    getStreakSummary(userId),
    getOverdueAnalysis(userId),
  ]);

  const totalCompleted = completions.reduce((acc, curr) => acc + curr.count, 0);
  const avgDaily = completions.length > 0 ? (totalCompleted / completions.length).toFixed(1) : "0";

  const percentChange = trends.lastWeek > 0
    ? Math.round(((trends.thisWeek - trends.lastWeek) / trends.lastWeek) * 100)
    : trends.thisWeek > 0 ? 100 : 0;

  const activeStreaks = streaks.filter((h) => h.completionCount > 0).length;
  const totalOverdue = overdue.reduce((acc, curr) => acc + curr.overdueCount, 0);

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Completed</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
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
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{avgDaily}</div>
          <p className="text-xs text-muted-foreground">
            {percentChange > 0 ? `+${percentChange}%` : percentChange < 0 ? `${percentChange}%` : "No change"} vs last week
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Streaks</CardTitle>
          <Flame className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeStreaks}</div>
          <p className="text-xs text-muted-foreground">
            Habits with activity this month
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Overdue Tasks</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalOverdue}</div>
          <p className="text-xs text-muted-foreground">
            {totalOverdue === 0 ? "You're all caught up!" : "Tasks past their due date"}
          </p>
        </CardContent>
      </Card>
    </>
  );
}

// --- Chart Wrappers ---
async function CompletionChartWrapper({ userId, period, customFrom, customTo }: WrapperProps) {
  const dateRange = getDateRange(period, customFrom, customTo);
  const data = await getCompletionOverTime(userId, period, period === "custom" ? dateRange : undefined);
  return <CompletionChart data={data} />;
}

async function AreaDistributionWrapper({ userId, period, customFrom, customTo }: WrapperProps) {
  const dateRange = getDateRange(period, customFrom, customTo);
  const data = await getAreaDistribution(userId, dateRange);
  return <AreaDistribution data={data} />;
}

async function ProductivityTrendsWrapper({ userId }: { userId: string }) {
  const data = await getProductivityTrends(userId);
  return <ProductivityTrends data={data} />;
}

async function OverdueBreakdownWrapper({ userId }: { userId: string }) {
  const data = await getOverdueAnalysis(userId);
  return <OverdueBreakdown data={data} />;
}

async function LifeBalanceRadarWrapper({ userId, period, customFrom, customTo }: WrapperProps) {
  const dateRange = getDateRange(period, customFrom, customTo);
  const data = await getLifeBalanceScores(userId, dateRange);
  return <LifeBalanceRadar data={data} />;
}

async function TimeDistributionWrapper({ userId, period, customFrom, customTo }: WrapperProps) {
  const dateRange = getDateRange(period, customFrom, customTo);
  const data = await getTimeDistribution(userId, dateRange);
  return <TimeDistribution data={data} />;
}

async function StreakOverviewWrapper({ userId }: { userId: string }) {
  const data = await getStreakSummary(userId);
  return <StreakOverview data={data} />;
}

// --- Skeletons ---
function StatsSkeleton() {
  return (
    <>
      <Card><CardHeader className="h-20"><Skeleton className="h-4 w-24" /></CardHeader><CardContent><Skeleton className="h-8 w-16" /></CardContent></Card>
      <Card><CardHeader className="h-20"><Skeleton className="h-4 w-24" /></CardHeader><CardContent><Skeleton className="h-8 w-16" /></CardContent></Card>
      <Card><CardHeader className="h-20"><Skeleton className="h-4 w-24" /></CardHeader><CardContent><Skeleton className="h-8 w-16" /></CardContent></Card>
      <Card><CardHeader className="h-20"><Skeleton className="h-4 w-24" /></CardHeader><CardContent><Skeleton className="h-8 w-16" /></CardContent></Card>
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
