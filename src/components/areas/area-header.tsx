"use client";

import { useState } from "react";
import * as Icons from "lucide-react";
import { Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EditAreaDialog } from "./edit-area-dialog";

interface AreaHeaderProps {
  area: any;
}

export function AreaHeader({ area }: AreaHeaderProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const Icon = (Icons as any)[area.icon || "Circle"] || Icons.Circle;

  return (
    <div className="flex items-center justify-between p-6 border-b shrink-0">
      <div className="flex items-center gap-3">
        <div
          className="p-2 rounded-lg"
          style={{ backgroundColor: `${area.color}20` }}
        >
          <Icon className="h-6 w-6" style={{ color: area.color }} />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{area.name}</h1>
          <p className="text-sm text-muted-foreground">
            {area.description || "Manage your projects and tasks"}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => setIsSettingsOpen(true)}>
          <Settings2 className="mr-2 h-4 w-4" />
          Area Settings
        </Button>
      </div>

      <EditAreaDialog
        area={area}
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
      />
    </div>
  );
}
