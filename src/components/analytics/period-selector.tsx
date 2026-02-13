"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function PeriodSelector({ defaultValue }: { defaultValue: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function onValueChange(value: string) {
    const params = new URLSearchParams(searchParams);
    params.set("period", value);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <Tabs defaultValue={defaultValue} onValueChange={onValueChange} className="space-y-4">
      <TabsList>
        <TabsTrigger value="week">This Week</TabsTrigger>
        <TabsTrigger value="last30">Last 30 Days</TabsTrigger>
        <TabsTrigger value="last90">Last 90 Days</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
