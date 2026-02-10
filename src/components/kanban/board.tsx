"use client";

import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  DefaultAnnouncements,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { KanbanColumn } from "./column";
import { ProjectCard } from "./project-card";

interface BoardProps {
  initialData: any; // We'll type this properly later
}

export function KanbanBoard({ initialData }: BoardProps) {
  const [board, setBoard] = useState(initialData);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeProject, setActiveProject] = useState<any>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    setActiveId(active.id as string);
    
    // Find the project being dragged
    for (const column of board.columns) {
      const project = column.projects.find((p: any) => p.id === active.id);
      if (project) {
        setActiveProject(project);
        break;
      }
    }
  }

  function handleDragOver(event: DragOverEvent) {
    // Logic for moving between columns
  }

  function handleDragEnd(event: DragEndEvent) {
    // Logic for persistence
    setActiveId(null);
    setActiveProject(null);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 h-full overflow-x-auto pb-4">
        {board.columns.map((column: any) => (
          <KanbanColumn key={column.id} column={column} />
        ))}
      </div>
      
      <DragOverlay>
        {activeId && activeProject ? (
          <ProjectCard project={activeProject} isOverlay />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
