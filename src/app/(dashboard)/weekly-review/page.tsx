import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  getWeeklySummary,
  getLifeBalanceScores,
} from "@/lib/db/queries/analytics";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, TrendingUp, Calendar } from "lucide-react";
import { LifeBalanceRadar } from "@/components/analytics/life-balance-radar";

export default async function WeeklyReviewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const summary = await getWeeklySummary(user.id);

  const now = new Date();
  const from = new Date();
  from.setDate(now.getDate() - 7);
  const balanceData = await getLifeBalanceScores(user.id, { from, to: now });

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Weekly Review</h2>
          <p className="text-muted-foreground">
            Reflect on the past 7 days and prepare for what&apos;s next.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tasks Completed
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.completedTasks.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Tasks</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.overdueTasks.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Habit Consistency
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.habitStats.length > 0
                ? (
                    summary.habitStats.reduce(
                      (acc, curr) => acc + curr.count,
                      0,
                    ) / summary.habitStats.length
                  ).toFixed(1)
                : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Avg completions per habit
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Areas Touched</CardTitle>
            <Calendar className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(summary.completedTasks.map((t) => t.areaName)).size}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Wins: Completed This Week</CardTitle>
              <CardDescription>
                Great job finishing these tasks!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {summary.completedTasks.slice(0, 10).map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between border-b pb-2 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium leading-none">
                        {task.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {task.areaName}
                      </p>
                    </div>
                    <Badge variant="outline">Done</Badge>
                  </div>
                ))}
                {summary.completedTasks.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No tasks completed this week yet.
                  </p>
                )}
                {summary.completedTasks.length > 10 && (
                  <p className="text-xs text-center text-muted-foreground pt-2">
                    And {summary.completedTasks.length - 10} more...
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Adjust: Overdue Tasks</CardTitle>
              <CardDescription>Items that need a new plan.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {summary.overdueTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between border-b pb-2 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium leading-none">
                        {task.title}
                      </p>
                      <p className="text-xs text-red-500 mt-1">
                        Due{" "}
                        {task.dueDate
                          ? new Date(task.dueDate).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {task.areaName}
                    </p>
                  </div>
                ))}
                {summary.overdueTasks.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No overdue tasks. Nice work!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-3 space-y-4">
          <LifeBalanceRadar data={balanceData} />

          <Card>
            <CardHeader>
              <CardTitle>Habit Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {summary.habitStats.map((habit, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm">{habit.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold">{habit.count}</span>
                      <span className="text-xs text-muted-foreground">
                        times
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
