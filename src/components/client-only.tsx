"use client";

import { type ReactNode } from "react";
import { useIsMounted } from "@/hooks/use-mounted";

export function ClientOnly({ children }: { children: ReactNode }) {
  const mounted = useIsMounted();
  if (!mounted) return null;
  return <>{children}</>;
}
