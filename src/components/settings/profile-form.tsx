"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { updateProfile } from "@/actions/profile-actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState } from "react";

const profileFormSchema = z.object({
  displayName: z.string().min(2, {
    message: "Display name must be at least 2 characters.",
  }),
  email: z.string().email().optional(),
  avatarUrl: z.union([z.string().url(), z.literal("")]).optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export function SettingsProfileForm({ profile }: { profile: any }) {
  const [loading, setLoading] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: profile.display_name || "",
      email: profile.email || "",
      avatarUrl: profile.avatar_url || "",
    },
    mode: "onChange",
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  async function onSubmit(data: ProfileFormValues) {
    setLoading(true);
    try {
      const result = await updateProfile(profile.id, {
        displayName: data.displayName,
        avatarUrl: data.avatarUrl || undefined,
      });

      if (result.success) {
        toast.success("Profile updated.");
      } else {
        toast.error("Failed to update profile.");
      }
    } catch (error) {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>
          This is how others will see you on the site.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input id="displayName" {...register("displayName")} />
            {errors.displayName && (
              <p className="text-sm text-red-500">
                {errors.displayName.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" {...register("email")} disabled />
            <p className="text-[0.8rem] text-muted-foreground">
              Your email address is managed via your account settings.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="avatarUrl">Avatar URL</Label>
            <Input
              id="avatarUrl"
              {...register("avatarUrl")}
              placeholder="https://example.com/avatar.png"
            />
            {errors.avatarUrl && (
              <p className="text-sm text-red-500">{errors.avatarUrl.message}</p>
            )}
            <p className="text-[0.8rem] text-muted-foreground">
              Currently only URL avatars are supported. Upload functionality
              coming soon.
            </p>
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Updating..." : "Update profile"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
