"use client";

import * as Icons from "lucide-react";
import {
  LayoutDashboard,
  Layers,
  CheckCircle2,
  Target,
  BarChart3,
  Calendar,
  Settings,
  Plus,
  LogOut,
  GripVertical,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/actions/auth-actions";
import { reorderAreas } from "@/actions/area-actions";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
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

const navItems = [
  { title: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { title: "Life Areas", icon: Layers, href: "/areas" },
  { title: "Habits", icon: CheckCircle2, href: "/habits" },
  { title: "Goals", icon: Target, href: "/goals" },
  { title: "Analytics", icon: BarChart3, href: "/analytics" },
  { title: "Weekly Review", icon: Calendar, href: "/weekly-review" },
  { title: "Settings", icon: Settings, href: "/settings" },
];

interface AppSidebarProps {
  areas: any[];
}

function SortableAreaItem({ area, isActive }: { area: any, isActive: boolean }) {
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

  const Icon = (Icons as any)[area.icon || "Circle"] || Icons.Circle;

  return (
    <SidebarMenuItem 
      ref={setNodeRef} 
      style={style}
      className={cn(isDragging && "opacity-50")}
    >
      <div className="flex items-center group/item w-full">
        <button
          {...attributes}
          {...listeners}
          className="opacity-0 group-hover/item:opacity-100 transition-opacity p-1 cursor-grab active:cursor-grabbing shrink-0"
        >
          <GripVertical className="h-3 w-3 text-muted-foreground" />
        </button>
        <SidebarMenuButton
          asChild
          isActive={isActive}
          tooltip={area.name}
          className="flex-1"
        >
          <Link href={`/areas/${area.id}`}>
            <Icon className="h-4 w-4 shrink-0" style={{ color: area.color }} />
            <span className="truncate">{area.name}</span>
          </Link>
        </SidebarMenuButton>
      </div>
    </SidebarMenuItem>
  );
}

function StaticAreaItem({ area, isActive }: { area: any; isActive: boolean }) {
  const Icon = (Icons as any)[area.icon || "Circle"] || Icons.Circle;

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={isActive}
        tooltip={area.name}
      >
        <Link href={`/areas/${area.id}`}>
          <Icon className="h-4 w-4 shrink-0" style={{ color: area.color }} />
          <span className="truncate">{area.name}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function AppSidebar({ areas: initialAreas }: AppSidebarProps) {
  const pathname = usePathname();
  const [areas, setAreas] = useState(initialAreas);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setAreas(initialAreas);
  }, [initialAreas]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
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
        setAreas(initialAreas); // Revert
      }
    }
  }

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2 font-bold text-xl">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shrink-0">
            L
          </div>
          <span className="truncate group-data-[collapsible=icon]:hidden">LifePlanner</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={item.title}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center justify-between pr-2">
            <span>Life Areas</span>
            <Link href="/areas" className="hover:bg-muted p-1 rounded">
              <Plus className="h-3 w-3" />
            </Link>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {mounted ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragEnd={handleDragEnd}
              >
                <SidebarMenu>
                  {areas.length > 0 ? (
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
                  ) : (
                    <div className="px-4 py-2 text-xs text-muted-foreground italic">
                      No areas yet
                    </div>
                  )}
                </SidebarMenu>
              </DndContext>
            ) : (
              <SidebarMenu>
                {areas.length > 0 ? (
                  areas.map((area) => (
                    <StaticAreaItem
                      key={area.id}
                      area={area}
                      isActive={pathname === `/areas/${area.id}`}
                    />
                  ))
                ) : (
                  <div className="px-4 py-2 text-xs text-muted-foreground italic">
                    No areas yet
                  </div>
                )}
              </SidebarMenu>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => signOut()}>
              <LogOut className="h-4 w-4" />
              <span>Log out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}