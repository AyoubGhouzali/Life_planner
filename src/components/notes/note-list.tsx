"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Pin, Trash2, Edit2, FileText, PinOff } from "lucide-react";
import { deleteNote, togglePinNote } from "@/actions/note-actions";
import { toast } from "sonner";
import { NoteEditor } from "./note-editor";
import { formatDistanceToNow } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Note {
  id: string;
  title: string;
  content: string | null;
  is_pinned: boolean;
  updated_at: Date;
}

interface NoteListProps {
  projectId: string;
  notes: Note[];
}

export function NoteList({ projectId, notes }: NoteListProps) {
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    try {
      await deleteNote(id);
      toast.success("Note deleted");
      setDeletingId(null);
    } catch (error) {
      toast.error("Failed to delete note");
    }
  };

  const handleTogglePin = async (id: string) => {
    try {
      await togglePinNote(id);
      // toast.success("Note updated"); // Optional, could be noisy
    } catch (error) {
        toast.error("Failed to update note");
    }
  };

  if (isCreating) {
    return (
      <NoteEditor
        projectId={projectId}
        onCancel={() => setIsCreating(false)}
        onSuccess={() => setIsCreating(false)}
      />
    );
  }

  if (editingNoteId) {
    const note = notes.find((n) => n.id === editingNoteId);
    if (!note) return null;
    return (
      <NoteEditor
        projectId={projectId}
        note={note}
        onCancel={() => setEditingNoteId(null)}
        onSuccess={() => setEditingNoteId(null)}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Notes
        </h3>
        <Button size="sm" variant="ghost" onClick={() => setIsCreating(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Add Note
        </Button>
      </div>
      
      {notes.length === 0 ? (
        <div className="text-center text-sm text-muted-foreground py-8 border rounded-md border-dashed">
            No notes yet.
        </div>
      ) : (
          <div className="grid gap-3">
            {notes.map((note) => (
                <Card key={note.id} className="relative group overflow-hidden transition-all hover:shadow-md">
                    <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                            <div className="space-y-1 w-full">
                                <h4 className="font-semibold text-sm flex items-center gap-2">
                                    {note.title}
                                    {note.is_pinned && <Pin className="h-3 w-3 text-orange-500 fill-orange-500" />}
                                </h4>
                                {note.content && (
                                    <p className="text-xs text-muted-foreground line-clamp-3 whitespace-pre-wrap">
                                        {note.content}
                                    </p>
                                )}
                                <p className="text-[10px] text-muted-foreground pt-1">
                                    {formatDistanceToNow(new Date(note.updated_at), { addSuffix: true })}
                                </p>
                            </div>
                            <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2 bg-background/90 rounded-md p-1 shadow-sm border">
                                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => handleTogglePin(note.id)}>
                                    {note.is_pinned ? <PinOff className="h-3 w-3" /> : <Pin className="h-3 w-3" />}
                                </Button>
                                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setEditingNoteId(note.id)}>
                                    <Edit2 className="h-3 w-3" />
                                </Button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive hover:text-destructive">
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Delete Note?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDelete(note.id)}>Delete</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
          </div>
      )}
    </div>
  );
}
