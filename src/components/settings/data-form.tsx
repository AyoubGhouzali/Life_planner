"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { exportUserData } from "@/actions/profile-actions";
import { useState } from "react";

export function SettingsDataForm({ profile }: { profile: any }) {
  const [loading, setLoading] = useState(false);

  const onExportJSON = async () => {
    setLoading(true);
    try {
      const result = await exportUserData(profile.id);
      if (result.success && result.data) {
        const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
          JSON.stringify(result.data, null, 2)
        )}`;
        const link = document.createElement("a");
        link.href = jsonString;
        link.download = `life_planner_data_${new Date().toISOString().slice(0, 10)}.json`;
        link.click();
        toast.success("Data export ready.");
      } else {
        toast.error("Failed to export data.");
      }
    } catch (error) {
      toast.error("Something went wrong during export.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Export</CardTitle>
        <CardDescription>
          Download a copy of your data in JSON format.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col space-y-2">
           <Button onClick={onExportJSON} disabled={loading} variant="outline" className="w-full sm:w-auto">
            {loading ? "Exporting..." : "Export All Data (JSON)"}
          </Button>
           <p className="text-sm text-muted-foreground">
            Your export will include your profile, areas, boards, projects, tasks, habits, and goals.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
