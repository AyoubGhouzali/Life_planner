"use client";

import {
  useSortable,
  verticalListSortingStrategy,
  SortableContext,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ProjectCard } from "./project-card";
import { AddProject } from "./add-project";
import { cn } from "@/lib/utils";
import { ColumnHeader } from "./column-header";

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

  const isOverWipLimit =
    column.wip_limit && column.projects.length > column.wip_limit;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex flex-col w-[300px] shrink-0 bg-muted/50 rounded-xl border border-border transition-colors",
        isDragging && "opacity-50",
        isOverWipLimit && "bg-destructive/5 border-destructive/20",
      )}
    >
      <ColumnHeader
        column={column}
        projectCount={column.projects.length}
        dragHandleProps={{ ...attributes, ...listeners }}
      />

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
        <AddProject columnId={column.id} />
      </div>
    </div>
  );
}
