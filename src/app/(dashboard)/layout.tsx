import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
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
import { Separator } from "@/components/ui/separator";

import { GlobalQuickAdd } from "@/components/layout/global-quick-add";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Trigger notification generation
  await generateNotifications(user.id);

  const [areas, runningTimer, notifications] = await Promise.all([
    getAreas(user.id),
    getRunningTimer(user.id),
    getNotifications(user.id),
  ]);

  return (
    <SidebarProvider>
      <AppSidebar areas={areas} />
      <GlobalQuickAdd areas={areas} />
      <SidebarInset className="flex flex-col">
        <TimerInitializer timer={runningTimer} />
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 !h-4" />
          </div>
          <div className="flex-1 flex justify-center">
            <CommandMenu />
          </div>
          <div className="flex items-center gap-3">
            <GlobalTimer />
            <NotificationBell notifications={notifications} />
            <ThemeToggle />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
