"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createColumn } from "@/actions/column-actions";
import { toast } from "sonner";

interface AddColumnProps {
  boardId: string;
}

export function AddColumn({ boardId }: AddColumnProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setIsPending(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("boardId", boardId);

      await createColumn(formData);
      toast.success("Column created");
      setName("");
      setIsEditing(false);
    } catch (error) {
      toast.error("Failed to create column");
    } finally {
      setIsPending(false);
    }
  }

  if (isEditing) {
    return (
      <div className="w-[300px] shrink-0 bg-muted/50 rounded-xl border border-border p-2 h-fit">
        <form onSubmit={handleSubmit} className="space-y-2">
          <Input
            autoFocus
            placeholder="Column name..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-9 text-sm"
            disabled={isPending}
          />
          <div className="flex items-center gap-2">
            <Button size="sm" type="submit" disabled={isPending}>
              {isPending ? "Adding..." : "Add Column"}
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => setIsEditing(false)}
              disabled={isPending}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      className="w-[300px] shrink-0 h-[52px] justify-start text-muted-foreground border-dashed border-2 bg-transparent hover:bg-muted/50 hover:text-foreground"
      onClick={() => setIsEditing(true)}
    >
      <Plus className="mr-2 h-4 w-4" />
      Add Column
    </Button>
  );
}
