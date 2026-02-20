import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getGoals } from "@/lib/db/queries/goals";
import { GoalCard } from "@/components/goals/goal-card";
import { CreateGoalDialog } from "@/components/goals/create-goal-dialog";

export default async function GoalsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const goals = await getGoals(user.id);

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Goals</h1>
          <p className="text-muted-foreground">
            Set ambitious targets and track your progress across projects.
          </p>
        </div>
        <CreateGoalDialog />
      </div>

      {goals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground mb-4">
            You haven't set any goals yet.
          </p>
          <CreateGoalDialog />
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>
      )}
    </div>
  );
}
