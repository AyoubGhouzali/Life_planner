"use client";

import { useState, useMemo, useEffect, useTransition } from "react";
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
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { KanbanColumn } from "./column";
import { ProjectCard } from "./project-card";
import { moveProject } from "@/actions/project-actions";
import { reorderColumns } from "@/actions/column-actions";
import { toast } from "sonner";
import { AddColumn } from "./add-column";

interface BoardProps {
  initialData: any;
}

export function KanbanBoard({ initialData }: BoardProps) {
  const [board, setBoard] = useState(initialData);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setBoard(initialData);
  }, [initialData]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [, startTransition] = useTransition();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeProject, setActiveProject] = useState<any>(null);

  const columnIds = useMemo(
    () => board.columns.map((col: any) => col.id),
    [board.columns],
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    setActiveId(active.id as string);

    for (const column of board.columns) {
      const project = column.projects.find((p: any) => p.id === active.id);
      if (project) {
        setActiveProject(project);
        break;
      }
    }
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveAProject = active.data.current?.type === "Project";
    const isOverAProject = over.data.current?.type === "Project";
    const isOverAColumn = over.data.current?.type === "Column";

    if (!isActiveAProject) return;

    // Moving a project over another project
    if (isActiveAProject && isOverAProject) {
      setBoard((prev: any) => {
        const activeColumn = prev.columns.find((col: any) =>
          col.projects.some((p: any) => p.id === activeId),
        );
        const overColumn = prev.columns.find((col: any) =>
          col.projects.some((p: any) => p.id === overId),
        );

        if (!activeColumn || !overColumn) return prev;

        if (activeColumn.id !== overColumn.id) {
          const activeIndex = activeColumn.projects.findIndex(
            (p: any) => p.id === activeId,
          );
          const overIndex = overColumn.projects.findIndex(
            (p: any) => p.id === overId,
          );

          const newActiveProjects = [...activeColumn.projects];
          const [movedProject] = newActiveProjects.splice(activeIndex, 1);
          movedProject.column_id = overColumn.id;

          const newOverProjects = [...overColumn.projects];
          newOverProjects.splice(overIndex, 0, movedProject);

          return {
            ...prev,
            columns: prev.columns.map((col: any) => {
              if (col.id === activeColumn.id)
                return { ...col, projects: newActiveProjects };
              if (col.id === overColumn.id)
                return { ...col, projects: newOverProjects };
              return col;
            }),
          };
        }

        return prev;
      });
    }

    // Moving a project over a column
    if (isActiveAProject && isOverAColumn) {
      setBoard((prev: any) => {
        const activeColumn = prev.columns.find((col: any) =>
          col.projects.some((p: any) => p.id === activeId),
        );
        const overColumnId = overId;

        if (!activeColumn || activeColumn.id === overColumnId) return prev;

        const activeIndex = activeColumn.projects.findIndex(
          (p: any) => p.id === activeId,
        );
        const newActiveProjects = [...activeColumn.projects];
        const [movedProject] = newActiveProjects.splice(activeIndex, 1);
        movedProject.column_id = overColumnId;

        return {
          ...prev,
          columns: prev.columns.map((col: any) => {
            if (col.id === activeColumn.id)
              return { ...col, projects: newActiveProjects };
            if (col.id === overColumnId)
              return { ...col, projects: [...col.projects, movedProject] };
            return col;
          }),
        };
      });
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    setActiveProject(null);

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveAColumn = active.data.current?.type === "Column";

    if (isActiveAColumn) {
      setBoard((prev: any) => {
        const activeIndex = prev.columns.findIndex(
          (col: any) => col.id === activeId,
        );
        const overIndex = prev.columns.findIndex(
          (col: any) => col.id === overId,
        );
        const newColumns = arrayMove(prev.columns, activeIndex, overIndex);
        return { ...prev, columns: newColumns };
      });

      // Persist to DB outside the setState callback, wrapped in startTransition
      const activeIndex = board.columns.findIndex(
        (col: any) => col.id === activeId,
      );
      const overIndex = board.columns.findIndex(
        (col: any) => col.id === overId,
      );
      const newColumns = arrayMove(board.columns, activeIndex, overIndex);
      startTransition(async () => {
        try {
          await reorderColumns(newColumns.map((col: any) => col.id));
        } catch {
          toast.error("Failed to reorder columns");
        }
      });
      return;
    }

    const isActiveAProject = active.data.current?.type === "Project";
    const isOverAProject = over.data.current?.type === "Project";

    if (isActiveAProject) {
      const activeColumn = board.columns.find((col: any) =>
        col.projects.some((p: any) => p.id === activeId),
      );

      if (!activeColumn) return;

      const activeIndex = activeColumn.projects.findIndex(
        (p: any) => p.id === activeId,
      );
      let overIndex = -1;

      if (isOverAProject) {
        overIndex = activeColumn.projects.findIndex(
          (p: any) => p.id === overId,
        );
      } else {
        // If it was dropped over a column, it's already at the end of that column from handleDragOver
        overIndex = activeColumn.projects.length - 1;
      }

      if (activeIndex !== overIndex) {
        setBoard((prev: any) => ({
          ...prev,
          columns: prev.columns.map((col: any) => {
            if (col.id === activeColumn.id) {
              return {
                ...col,
                projects: arrayMove(col.projects, activeIndex, overIndex),
              };
            }
            return col;
          }),
        }));
      }

      // Persist to DB
      try {
        await moveProject(activeId as string, activeColumn.id, overIndex);
      } catch (error) {
        toast.error("Failed to move project");
        // We might want to revert the state here if we want strict consistency
      }
    }
  }

  if (!mounted) {
    return (
      <div className="flex gap-4 h-full overflow-x-auto pb-4">
        {board.columns.map((column: any) => (
          <KanbanColumn key={column.id} column={column} />
        ))}
        <AddColumn boardId={board.id} />
      </div>
    );
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
        <SortableContext
          items={columnIds}
          strategy={horizontalListSortingStrategy}
        >
          {board.columns.map((column: any) => (
            <KanbanColumn key={column.id} column={column} />
          ))}
        </SortableContext>
        <AddColumn boardId={board.id} />
      </div>

      <DragOverlay>
        {activeId && activeProject ? (
          <ProjectCard project={activeProject} isOverlay />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
