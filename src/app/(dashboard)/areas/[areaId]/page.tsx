import { createClient } from "@/lib/supabase/server";
import { getAreaById } from "@/lib/db/queries/areas";
import { getBoardWithData } from "@/lib/db/queries/boards";
import { redirect, notFound } from "next/navigation";
import * as Icons from "lucide-react";
import { Button } from "@/components/ui/button";
import { Settings2 } from "lucide-react";
import { KanbanBoard } from "@/components/kanban/board";

interface AreaPageProps {
  params: Promise<{
    areaId: string;
  }>;
}

export default async function AreaPage({ params }: AreaPageProps) {
  const { areaId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const area = await getAreaById(areaId, user.id);

  if (!area) {
    notFound();
  }

  const defaultBoardId = area.boards[0]?.id;
  const boardData = defaultBoardId ? await getBoardWithData(defaultBoardId) : null;

  const Icon = (Icons as any)[area.icon || "Circle"] || Icons.Circle;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between p-6 border-b shrink-0">
        <div className="flex items-center gap-3">
          <div 
            className="p-2 rounded-lg"
            style={{ backgroundColor: `${area.color}20` }}
          >
            <Icon className="h-6 w-6" style={{ color: area.color }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{area.name}</h1>
            <p className="text-sm text-muted-foreground">{area.description || "Manage your projects and tasks"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Settings2 className="mr-2 h-4 w-4" />
            Area Settings
          </Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden">
        {boardData ? (
          <div className="h-full p-6">
            <KanbanBoard initialData={boardData} />
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center">
            <p className="text-muted-foreground mb-4">No boards found for this area.</p>
            <Button>Create Board</Button>
          </div>
        )}
      </div>
    </div>
  );
}
