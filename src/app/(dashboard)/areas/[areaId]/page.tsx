import { createClient } from "@/lib/supabase/server";
import { getAreaById } from "@/lib/db/queries/areas";
import { getBoardWithData } from "@/lib/db/queries/boards";
import { redirect, notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { KanbanBoard } from "@/components/kanban/board";
import { AreaHeader } from "@/components/areas/area-header";

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

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <AreaHeader area={area} />
      
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
