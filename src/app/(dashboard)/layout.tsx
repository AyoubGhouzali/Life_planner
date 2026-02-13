import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { getAreas } from "@/lib/db/queries/areas";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CommandMenu } from "@/components/layout/command-menu";
import { GlobalTimer } from "@/components/layout/global-timer";
import { getRunningTimer } from "@/actions/time-actions";
import { TimerInitializer } from "@/components/layout/timer-initializer";
import { generateNotifications } from "@/actions/notification-actions";
import { NotificationBell } from "@/components/layout/notification-bell";
import { getNotifications } from "@/lib/db/queries/notifications";

import { GlobalQuickAdd } from "@/components/layout/global-quick-add";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Trigger notification generation
  await generateNotifications(user.id);

  const [areas, runningTimer, notifications] = await Promise.all([
    getAreas(user.id),
    getRunningTimer(user.id),
    getNotifications(user.id)
  ]);

  return (
    <SidebarProvider>
      <AppSidebar areas={areas} />
      <GlobalQuickAdd areas={areas} />
      <SidebarInset className="flex flex-col">
        <TimerInitializer timer={runningTimer} />
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
          </div>
          <div className="flex-1 flex justify-center">
            <CommandMenu />
          </div>
          <div className="flex items-center gap-4">
            <GlobalTimer />
            <NotificationBell notifications={notifications} />
            <ThemeToggle />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
