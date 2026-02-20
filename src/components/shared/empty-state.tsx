"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FileQuestion } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: React.ElementType;
  className?: string;
  children?: React.ReactNode;
}

export function EmptyState({
  title,
  description,
  action,
  icon: Icon = FileQuestion,
  className,
  children,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center animate-in fade-in-50 zoom-in-95 duration-500",
        className,
      )}
    >
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted/50 mb-4">
        <Icon className="h-10 w-10 text-muted-foreground/50" />
      </div>
      <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground max-w-sm text-balance">
        {description}
      </p>
      {action && (
        <Button onClick={action.onClick} className="mt-6" size="lg">
          {action.label}
        </Button>
      )}
      {children && <div className="mt-6">{children}</div>}
    </div>
  );
}
