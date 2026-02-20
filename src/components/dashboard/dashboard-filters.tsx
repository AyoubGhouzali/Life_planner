"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useFilterStore } from "@/lib/stores/filter-store";
import { Filter, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Area {
  id: string;
  name: string;
}

interface DashboardFiltersProps {
  areas: Area[];
}

export function DashboardFilters({ areas }: DashboardFiltersProps) {
  const {
    areaId,
    status,
    priority,
    search,
    setAreaId,
    setStatus,
    setPriority,
    setSearch,
    clearFilters,
  } = useFilterStore();

  const activeFilterCount =
    (areaId ? 1 : 0) + status.length + priority.length + (search ? 1 : 0);

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center">
      <div className="flex-1">
        <Input
          placeholder="Search tasks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs bg-background"
        />
      </div>
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 border-dashed bg-background"
            >
              <Filter className="mr-2 h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <>
                  <Separator orientation="vertical" className="mx-2 h-4" />
                  <Badge
                    variant="secondary"
                    className="rounded-sm px-1 font-normal lg:hidden"
                  >
                    {activeFilterCount}
                  </Badge>
                  <div className="hidden space-x-1 lg:flex">
                    {activeFilterCount > 2 ? (
                      <Badge
                        variant="secondary"
                        className="rounded-sm px-1 font-normal"
                      >
                        {activeFilterCount} selected
                      </Badge>
                    ) : (
                      <>
                        {areaId && (
                          <Badge
                            variant="secondary"
                            className="rounded-sm px-1 font-normal"
                          >
                            Area
                          </Badge>
                        )}
                        {status.length > 0 && (
                          <Badge
                            variant="secondary"
                            className="rounded-sm px-1 font-normal"
                          >
                            Status
                          </Badge>
                        )}
                        {priority.length > 0 && (
                          <Badge
                            variant="secondary"
                            className="rounded-sm px-1 font-normal"
                          >
                            Priority
                          </Badge>
                        )}
                      </>
                    )}
                  </div>
                </>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            <DropdownMenuLabel>Life Area</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={areaId === null}
              onCheckedChange={() => setAreaId(null)}
            >
              All Areas
            </DropdownMenuCheckboxItem>
            {areas.map((area) => (
              <DropdownMenuCheckboxItem
                key={area.id}
                checked={areaId === area.id}
                onCheckedChange={() =>
                  setAreaId(areaId === area.id ? null : area.id)
                }
              >
                {area.name}
              </DropdownMenuCheckboxItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Priority</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {["low", "medium", "high", "urgent"].map((p) => (
              <DropdownMenuCheckboxItem
                key={p}
                checked={priority.includes(p)}
                onCheckedChange={(checked) => {
                  if (checked) setPriority([...priority, p]);
                  else setPriority(priority.filter((x) => x !== p));
                }}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </DropdownMenuCheckboxItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {["todo", "in_progress", "done"].map((s) => (
              <DropdownMenuCheckboxItem
                key={s}
                checked={status.includes(s)}
                onCheckedChange={(checked) => {
                  if (checked) setStatus([...status, s]);
                  else setStatus(status.filter((x) => x !== s));
                }}
              >
                {s.replace("_", " ").charAt(0).toUpperCase() +
                  s.replace("_", " ").slice(1)}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            onClick={clearFilters}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
