import { createClient } from "@/lib/supabase/server";
import { getAreas } from "@/lib/db/queries/areas";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CreateAreaDialog } from "@/components/areas/create-area-dialog";
import { AreaCard } from "@/components/areas/area-card";

export default async function AreasPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const areas = await getAreas(user.id);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Life Areas</h1>
          <p className="text-muted-foreground">
            Manage the different domains of your life.
          </p>
        </div>
        <CreateAreaDialog>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Area
          </Button>
        </CreateAreaDialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {areas.map((area) => {
          const projectCount = area.boards.reduce(
            (acc, board) =>
              acc +
              board.columns.reduce(
                (cAcc, column) => cAcc + column.projects.length,
                0
              ),
            0
          );

          return (
            <AreaCard key={area.id} area={area} projectCount={projectCount} />
          );
        })}
      </div>
    </div>
  );
}
