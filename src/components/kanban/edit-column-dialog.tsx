"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { columnSchema, type ColumnInput } from "@/lib/validations/column";
import { updateColumn } from "@/actions/column-actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const COLORS = [
  "#ef4444", "#f97316", "#f59e0b", "#eab308", "#84cc16", "#22c55e",
  "#10b981", "#14b8a6", "#06b6d4", "#0ea5e9", "#3b82f6", "#6366f1",
  "#8b5cf6", "#a855f7", "#d946ef", "#ec4899", "#f43f5e", "#64748b",
];

interface EditColumnDialogProps {
  column: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditColumnDialog({ column, open, onOpenChange }: EditColumnDialogProps) {
  const [isPending, setIsPending] = useState(false);

  const form = useForm<ColumnInput>({
    resolver: zodResolver(columnSchema),
    defaultValues: {
      name: column.name,
      color: column.color || null,
      boardId: column.board_id,
      wipLimit: column.wip_limit || null,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: column.name,
        color: column.color || null,
        boardId: column.board_id,
        wipLimit: column.wip_limit || null,
      });
    }
  }, [open, column, form]);

  async function onSubmit(data: ColumnInput) {
    setIsPending(true);
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("boardId", data.boardId);
      if (data.color) formData.append("color", data.color);
      if (data.wipLimit !== null && data.wipLimit !== undefined) {
        formData.append("wipLimit", data.wipLimit.toString());
      }

      await updateColumn(column.id, formData);
      toast.success("Column updated");
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to update column");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Column</DialogTitle>
          <DialogDescription>
            Update column settings and WIP limits.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. To Do, Done" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="wipLimit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>WIP Limit (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="No limit" 
                      {...field} 
                      value={field.value || ""}
                      onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className={cn(
                        "h-6 w-6 rounded-full border border-black/10 flex items-center justify-center text-[10px]",
                        !field.value && "ring-2 ring-primary ring-offset-2"
                      )}
                      onClick={() => field.onChange(null)}
                    >
                      None
                    </button>
                    {COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={cn(
                          "h-6 w-6 rounded-full border border-black/10 transition-transform hover:scale-110",
                          field.value === color && "ring-2 ring-primary ring-offset-2"
                        )}
                        style={{ backgroundColor: color }}
                        onClick={() => field.onChange(color)}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
