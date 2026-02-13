"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createNote, updateNote } from "@/actions/note-actions";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface NoteEditorProps {
  projectId: string;
  note?: {
    id: string;
    title: string;
    content: string | null;
  };
  onCancel: () => void;
  onSuccess: () => void;
}

export function NoteEditor({ projectId, note, onCancel, onSuccess }: NoteEditorProps) {
  const [title, setTitle] = useState(note?.title || "");
  const [content, setContent] = useState(note?.content || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      
      if (note) {
        await updateNote(note.id, formData);
        toast.success("Note updated");
      } else {
        formData.append("projectId", projectId);
        await createNote(formData);
        toast.success("Note created");
      }
      onSuccess();
    } catch (error) {
      toast.error("Failed to save note");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-md bg-muted/20">
      <Input
        placeholder="Note Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="font-medium bg-background"
      />
      <Textarea
        placeholder="Write your note here..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="min-h-[150px] bg-background"
      />
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading || !title}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Note
        </Button>
      </div>
    </form>
  );
}
