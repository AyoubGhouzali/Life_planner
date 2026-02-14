import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  getDashboardStats,
  getTodaysTasks,
  getUpcomingTasks,
  getRecentActivity
} from "@/lib/db/queries/dashboard";
import { getAreas } from "@/lib/db/queries/areas";
import { getTodaysHabits } from "@/lib/db/queries/habits";
import { SummaryStats } from "@/components/dashboard/summary-stats";
import { TodayTasks } from "@/components/dashboard/today-tasks";
import { UpcomingDeadlines } from "@/components/dashboard/upcoming-deadlines";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { QuickAddTask } from "@/components/dashboard/quick-add-task";
import { DashboardFilters } from "@/components/dashboard/dashboard-filters";
import { HabitChecklist } from "@/components/habits/habit-checklist";
import { ClientOnly } from "@/components/client-only";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [
    stats,
    todaysTasks,
    upcomingTasks,
    recentActivity,
    areas,
    todaysHabits
  ] = await Promise.all([
    getDashboardStats(user.id),
    getTodaysTasks(user.id),
    getUpcomingTasks(user.id),
    getRecentActivity(user.id),
    getAreas(user.id),
    getTodaysHabits(user.id)
  ]);

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, here&apos;s your overview for today.
          </p>
        </div>
        <ClientOnly>
          <DashboardFilters areas={areas} />
        </ClientOnly>
      </div>

      <SummaryStats stats={stats} />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-1 lg:col-span-4 flex flex-col gap-6">
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-4 -my-4 border-b">
              <ClientOnly>
                <QuickAddTask areas={areas} />
              </ClientOnly>
            </div>

            <TodayTasks tasks={todaysTasks} />
        </div>

        <div className="col-span-1 lg:col-span-3 flex flex-col gap-6">
          <HabitChecklist habits={todaysHabits} />
          <UpcomingDeadlines tasks={upcomingTasks} />
          <RecentActivity items={recentActivity} />
        </div>
      </div>
    </div>
  );
}
