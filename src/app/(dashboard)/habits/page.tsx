import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getHabits } from "@/lib/db/queries/habits";
import { getAreas } from "@/lib/db/queries/areas";
import { HabitCard } from "@/components/habits/habit-card";
import { CreateHabitDialog } from "@/components/habits/create-habit-dialog";

export default async function HabitsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [habits, areas] = await Promise.all([
    getHabits(user.id),
    getAreas(user.id)
  ]);

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Habits</h1>
          <p className="text-muted-foreground">
            Track your daily routines and build consistent streaks.
          </p>
        </div>
        <CreateHabitDialog areas={areas} />
      </div>

      {habits.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground mb-4">You haven't created any habits yet.</p>
          <CreateHabitDialog areas={areas} />
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {habits.map((habit) => (
            <HabitCard key={habit.id} habit={habit} />
          ))}
        </div>
      )}
    </div>
  );
}
