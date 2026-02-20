"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { areaSchema, type AreaInput } from "@/lib/validations/area";
import { updateArea } from "@/actions/area-actions";
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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Briefcase,
  Home,
  Dumbbell,
  PiggyBank,
  GraduationCap,
  Heart,
  Users,
  Plane,
  Music,
  Code,
  Circle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ICONS = [
  { name: "Briefcase", icon: Briefcase },
  { name: "Home", icon: Home },
  { name: "Dumbbell", icon: Dumbbell },
  { name: "PiggyBank", icon: PiggyBank },
  { name: "GraduationCap", icon: GraduationCap },
  { name: "Heart", icon: Heart },
  { name: "Users", icon: Users },
  { name: "Plane", icon: Plane },
  { name: "Music", icon: Music },
  { name: "Code", icon: Code },
  { name: "Circle", icon: Circle },
];

const COLORS = [
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#eab308",
  "#84cc16",
  "#22c55e",
  "#10b981",
  "#14b8a6",
  "#06b6d4",
  "#0ea5e9",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#a855f7",
  "#d946ef",
  "#ec4899",
  "#f43f5e",
  "#64748b",
];

interface EditAreaDialogProps {
  area: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditAreaDialog({
  area,
  open,
  onOpenChange,
}: EditAreaDialogProps) {
  const [isPending, setIsPending] = useState(false);

  const form = useForm<AreaInput>({
    resolver: zodResolver(areaSchema),
    defaultValues: {
      name: area.name,
      description: area.description || "",
      icon: area.icon || "Circle",
      color: area.color || "#3b82f6",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: area.name,
        description: area.description || "",
        icon: area.icon || "Circle",
        color: area.color || "#3b82f6",
      });
    }
  }, [open, area, form]);

  async function onSubmit(data: AreaInput) {
    setIsPending(true);
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      if (data.description) formData.append("description", data.description);
      if (data.icon) formData.append("icon", data.icon);
      if (data.color) formData.append("color", data.color);

      await updateArea(area.id, formData);
      toast.success("Area updated successfully");
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to update area");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Life Area</DialogTitle>
          <DialogDescription>
            Update the details of your life area.
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
                    <Input
                      placeholder="e.g. Work, Health, Finance"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What does this area cover?"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Icon</FormLabel>
                  <div className="flex flex-wrap gap-2">
                    {ICONS.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Button
                          key={item.name}
                          type="button"
                          variant="outline"
                          size="icon"
                          className={cn(
                            "h-9 w-9",
                            field.value === item.name &&
                              "border-2 border-primary",
                          )}
                          onClick={() => field.onChange(item.name)}
                        >
                          <Icon className="h-4 w-4" />
                        </Button>
                      );
                    })}
                  </div>
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
                    {COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={cn(
                          "h-6 w-6 rounded-full border border-black/10 transition-transform hover:scale-110",
                          field.value === color &&
                            "ring-2 ring-primary ring-offset-2",
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
