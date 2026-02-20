import { Metadata } from "next";
import { Separator } from "@/components/ui/separator";
import { SettingsProfileForm } from "@/components/settings/profile-form";
import { SettingsAccountForm } from "@/components/settings/account-form";
import { SettingsAppearanceForm } from "@/components/settings/appearance-form";
import { SettingsNotificationsForm } from "@/components/settings/notifications-form";
import { SettingsDataForm } from "@/components/settings/data-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getProfile } from "@/lib/db/queries/profiles";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your account settings and preferences.",
};

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await getProfile(user.id);

  if (!profile) {
    return <div>Error loading profile</div>;
  }

  return (
    <div className="space-y-6 p-10 pb-16 md:block">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage your account settings and set e-mail preferences.
        </p>
      </div>
      <Separator className="my-6" />
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="-mx-4 lg:w-1/5">
          {/* Sidebar navigation could go here if using sidebar layout for settings */}
        </aside>
        <div className="flex-1 lg:max-w-2xl">
          <Tabs defaultValue="profile" className="space-y-4">
            <TabsList>
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="data">Data</TabsTrigger>
              <TabsTrigger value="account">Account</TabsTrigger>
            </TabsList>
            <TabsContent value="profile" className="space-y-4">
              <SettingsProfileForm profile={profile} />
            </TabsContent>
            <TabsContent value="appearance" className="space-y-4">
              <SettingsAppearanceForm profile={profile} />
            </TabsContent>
            <TabsContent value="notifications" className="space-y-4">
              <SettingsNotificationsForm profile={profile} />
            </TabsContent>
            <TabsContent value="data" className="space-y-4">
              <SettingsDataForm profile={profile} />
            </TabsContent>
            <TabsContent value="account" className="space-y-4">
              <SettingsAccountForm profile={profile} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
