"use client";

import { useState, useEffect } from "react";
import { useIsMounted } from "@/hooks/use-mounted";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { toast } from "sonner";
import { reorderAreas } from "@/actions/area-actions";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import * as Icons from "lucide-react";
import { GripVertical, Circle } from "lucide-react";

interface Area {
  id: string;
  name: string;
  icon?: string | null;
  color?: string | null;
}

interface SidebarAreaListProps {
  areas: Area[];
}

function SortableAreaItem({
  area,
  isActive,
}: {
  area: Area;
  isActive: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: area.id });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
    zIndex: isDragging ? 10 : 0,
  };

  const IconComponent = (Icons as any)[area.icon || "Circle"] || Circle;

  return (
    <SidebarMenuItem
      ref={setNodeRef}
      style={style}
      className={cn(isDragging && "opacity-50")}
    >
      <SidebarMenuButton asChild isActive={isActive} tooltip={area.name}>
        <Link href={`/areas/${area.id}`}>
          <IconComponent
            className="h-4 w-4 shrink-0"
            style={{ color: area.color || undefined }}
          />
          <span className="truncate">{area.name}</span>
        </Link>
      </SidebarMenuButton>
      <SidebarMenuAction
        {...attributes}
        {...listeners}
        showOnHover
        className="cursor-grab active:cursor-grabbing"
        aria-label="Reorder area"
      >
        <GripVertical className="h-3.5 w-3.5" />
      </SidebarMenuAction>
    </SidebarMenuItem>
  );
}

export function SidebarAreaList({ areas: initialAreas }: SidebarAreaListProps) {
  const pathname = usePathname();
  const [areas, setAreas] = useState(initialAreas);
  const mounted = useIsMounted();

  useEffect(() => {
    setAreas(initialAreas);
  }, [initialAreas]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = areas.findIndex((a) => a.id === active.id);
      const newIndex = areas.findIndex((a) => a.id === over.id);

      const newAreas = arrayMove(areas, oldIndex, newIndex);
      setAreas(newAreas);

      try {
        await reorderAreas(newAreas.map((a) => a.id));
      } catch (error) {
        toast.error("Failed to reorder areas");
        setAreas(initialAreas);
      }
    }
  }

  if (!mounted) {
    return (
      <SidebarMenu>
        {areas.map((area) => {
          const IconComponent = (Icons as any)[area.icon || "Circle"] || Circle;
          const isActive = pathname === `/areas/${area.id}`;
          return (
            <SidebarMenuItem key={area.id}>
              <SidebarMenuButton
                asChild
                isActive={isActive}
                tooltip={area.name}
              >
                <Link href={`/areas/${area.id}`}>
                  <IconComponent
                    className="h-4 w-4 shrink-0"
                    style={{ color: area.color || undefined }}
                  />
                  <span className="truncate">{area.name}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragEnd={handleDragEnd}
    >
      <SidebarMenu>
        <SortableContext
          items={areas.map((a) => a.id)}
          strategy={verticalListSortingStrategy}
        >
          {areas.map((area) => (
            <SortableAreaItem
              key={area.id}
              area={area}
              isActive={pathname === `/areas/${area.id}`}
            />
          ))}
        </SortableContext>
      </SidebarMenu>
    </DndContext>
  );
}
