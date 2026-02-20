"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { DateRange } from "react-day-picker";

export function PeriodSelector({ defaultValue }: { defaultValue: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");

  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    fromParam && toParam
      ? { from: new Date(fromParam), to: new Date(toParam) }
      : undefined,
  );
  const [open, setOpen] = useState(false);

  const isCustom = defaultValue === "custom";

  function onValueChange(value: string) {
    const params = new URLSearchParams(searchParams);
    params.set("period", value);
    params.delete("from");
    params.delete("to");
    router.push(`${pathname}?${params.toString()}`);
  }

  function applyCustomRange() {
    if (!dateRange?.from || !dateRange?.to) return;
    const params = new URLSearchParams(searchParams);
    params.set("period", "custom");
    params.set("from", dateRange.from.toISOString().split("T")[0]);
    params.set("to", dateRange.to.toISOString().split("T")[0]);
    router.push(`${pathname}?${params.toString()}`);
    setOpen(false);
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Tabs
        defaultValue={isCustom ? undefined : defaultValue}
        onValueChange={onValueChange}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="week">This Week</TabsTrigger>
          <TabsTrigger value="month">This Month</TabsTrigger>
          <TabsTrigger value="last30">Last 30 Days</TabsTrigger>
          <TabsTrigger value="last90">Last 90 Days</TabsTrigger>
        </TabsList>
      </Tabs>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={isCustom ? "default" : "outline"}
            size="sm"
            className="gap-2"
          >
            <CalendarIcon className="h-4 w-4" />
            {isCustom && dateRange?.from && dateRange?.to ? (
              <span>
                {format(dateRange.from, "MMM d, yyyy")} –{" "}
                {format(dateRange.to, "MMM d, yyyy")}
              </span>
            ) : (
              <span>Custom Range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-3 space-y-3">
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={setDateRange}
              numberOfMonths={2}
              disabled={{ after: new Date() }}
            />
            <div className="flex justify-end gap-2 px-3 pb-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setDateRange(undefined);
                  setOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={!dateRange?.from || !dateRange?.to}
                onClick={applyCustomRange}
              >
                Apply
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
