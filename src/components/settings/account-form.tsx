"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { toast } from "sonner";
import { deleteAccount } from "@/actions/profile-actions";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function SettingsAccountForm({ profile }: { profile: any }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onDeleteAccount = async () => {
    setLoading(true);
    try {
      const result = await deleteAccount(profile.id);
      if (result.success) {
        toast.success("Account deleted.");
        router.push("/login");
      } else {
        toast.error("Failed to delete account.");
      }
    } catch (error) {
      toast.error("Something went wrong during account deletion.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-red-500/20 bg-red-500/5">
      <CardHeader>
        <CardTitle className="text-red-500">Danger Zone</CardTitle>
        <CardDescription className="text-red-500/80">
          Permanent actions that cannot be undone.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col space-y-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                disabled={loading}
                className="w-full sm:w-auto"
              >
                {loading ? "Deleting..." : "Delete Account"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  your account and remove your data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={onDeleteAccount}
                  className="bg-red-500 hover:bg-red-600 focus:ring-red-500"
                >
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <p className="text-sm text-red-500/80">
            Deleting your account will remove all your data, including tasks,
            projects, habits, and goals.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
