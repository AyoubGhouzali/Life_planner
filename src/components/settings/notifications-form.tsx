"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { updateSettings } from "@/actions/profile-actions";

const notificationsFormSchema = z.object({
  due_reminders: z.boolean().default(false).optional(),
  weekly_review: z.boolean().default(false).optional(),
  overdue_alerts: z.boolean().default(false).optional(),
});

type NotificationsFormValues = z.infer<typeof notificationsFormSchema>;

export function SettingsNotificationsForm({ profile }: { profile: any }) {
  const defaultValues: Partial<NotificationsFormValues> = {
    due_reminders: profile.settings?.notifications?.due_reminders ?? true,
    weekly_review: profile.settings?.notifications?.weekly_review ?? true,
    overdue_alerts: profile.settings?.notifications?.overdue_alerts ?? true,
  };

  const form = useForm<NotificationsFormValues>({
    resolver: zodResolver(notificationsFormSchema),
    defaultValues,
  });

  async function onSubmit(data: NotificationsFormValues) {
    try {
      await updateSettings(profile.id, {
        ...profile.settings,
        notifications: data,
      });
      toast.success("Notification preferences updated.");
    } catch (error) {
      toast.error("Failed to update notification preferences.");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>
          Configure how you receive notifications.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="due_reminders"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Due Reminders</FormLabel>
                    <FormDescription>
                      Receive notifications when tasks are due.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="weekly_review"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Weekly Review</FormLabel>
                    <FormDescription>
                      Get reminded to perform your weekly review on Sundays.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="overdue_alerts"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Overdue Alerts</FormLabel>
                    <FormDescription>
                      Get notified about tasks that are past their due date.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button type="submit">Update notifications</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
