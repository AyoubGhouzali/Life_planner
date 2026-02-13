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

  const [areas, runningTimer] = await Promise.all([
    getAreas(user.id),
    getRunningTimer(user.id)
  ]);

  return (
    <SidebarProvider>
      <TimerInitializer timer={runningTimer} />
      <AppSidebar areas={areas} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
          </div>
          <div className="flex-1 flex justify-center">
            <CommandMenu />
          </div>
          <div className="flex items-center gap-4">
            <GlobalTimer />
            <ThemeToggle />
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
