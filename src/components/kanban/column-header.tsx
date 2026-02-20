"use client";

import { useState } from "react";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { EditColumnDialog } from "./edit-column-dialog";
import { deleteColumn } from "@/actions/column-actions";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ColumnHeaderProps {
  column: any;
  projectCount: number;
  dragHandleProps?: any;
}

export function ColumnHeader({
  column,
  projectCount,
  dragHandleProps,
}: ColumnHeaderProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isOverWipLimit = column.wip_limit && projectCount > column.wip_limit;

  async function handleDelete() {
    setIsDeleting(true);
    try {
      await deleteColumn(column.id);
      toast.success("Column deleted");
    } catch (error) {
      toast.error("Failed to delete column");
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  }

  return (
    <>
      <div className="flex items-center justify-between p-3 border-b bg-background/50 rounded-t-xl">
        <div
          className="flex items-center gap-2 flex-1 min-w-0"
          {...dragHandleProps}
        >
          <h3 className="font-semibold text-sm truncate">{column.name}</h3>
          <span
            className={cn(
              "text-xs px-1.5 py-0.5 rounded-full font-medium shrink-0",
              isOverWipLimit
                ? "bg-destructive text-destructive-foreground"
                : "bg-muted text-muted-foreground",
            )}
          >
            {projectCount}
            {column.wip_limit && ` / ${column.wip_limit}`}
          </span>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <EditColumnDialog
        column={column}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Column</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the column &apos;{column.name}
              &apos;? Any projects in this column will also be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
