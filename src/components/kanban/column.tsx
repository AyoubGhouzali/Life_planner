"use client";

import { useSortable, verticalListSortingStrategy, SortableContext } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ProjectCard } from "./project-card";
import { MoreHorizontal, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ColumnProps {
  column: any;
}

export function KanbanColumn({ column }: ColumnProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: {
      type: "Column",
      column,
    },
  });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex flex-col w-[300px] shrink-0 bg-muted/50 rounded-xl border border-border"
    >
      {/* Column Header */}
      <div className="flex items-center justify-between p-3 border-b bg-background/50 rounded-t-xl">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm">{column.name}</h3>
          <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
            {column.projects.length}
          </span>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {/* Projects List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        <SortableContext
          items={column.projects.map((p: any) => p.id)}
          strategy={verticalListSortingStrategy}
        >
          {column.projects.map((project: any) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </SortableContext>
      </div>

      {/* Column Footer */}
      <div className="p-2 border-t mt-auto">
        <Button variant="ghost" className="w-full justify-start text-muted-foreground h-9" size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Project
        </Button>
      </div>
    </div>
  );
}
