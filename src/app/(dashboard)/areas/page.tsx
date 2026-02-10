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
import * as Icons from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

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
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Area
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {areas.map((area) => {
          const Icon = (Icons as any)[area.icon || "Circle"] || Icons.Circle;
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
            <Link key={area.id} href={`/areas/${area.id}`}>
              <Card className="hover:border-primary/50 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {area.name}
                  </CardTitle>
                  <Icon className="h-4 w-4" style={{ color: area.color }} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{projectCount}</div>
                  <p className="text-xs text-muted-foreground">
                    Active projects across {area.boards.length} boards
                  </p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
