"use client";

import { useEffect } from "react";
import {
  LayoutDashboard,
  Layers,
  CheckCircle2,
  Target,
  BarChart3,
  Calendar,
  Settings,
  Plus,
  LogOut,
  ChevronsLeft,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarRail,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/actions/auth-actions";
import { SidebarAreaList } from "@/components/layout/sidebar-area-list";
import { cn } from "@/lib/utils";

const navItems = [
  { title: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { title: "Life Areas", icon: Layers, href: "/areas" },
  { title: "Habits", icon: CheckCircle2, href: "/habits" },
  { title: "Goals", icon: Target, href: "/goals" },
  { title: "Analytics", icon: BarChart3, href: "/analytics" },
  { title: "Weekly Review", icon: Calendar, href: "/weekly-review" },
  { title: "Settings", icon: Settings, href: "/settings" },
];

interface AppSidebarProps {
  areas: any[];
}

export function AppSidebar({ areas }: AppSidebarProps) {
  const pathname = usePathname();
  const { setOpenMobile, isMobile, toggleSidebar, state } = useSidebar();

  // Close mobile sidebar on route change
  useEffect(() => {
    if (isMobile) {
      setOpenMobile(false);
    }
  }, [pathname, setOpenMobile, isMobile]);

  return (
    <Sidebar collapsible="icon">
      {/* Header with logo and collapse toggle */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              tooltip="LifePlanner"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
                L
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">LifePlanner</span>
                <span className="truncate text-xs text-muted-foreground">
                  Plan your life
                </span>
              </div>
              <ChevronsLeft
                className={cn(
                  "ml-auto h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
                  state === "collapsed" && "rotate-180"
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSidebar();
                }}
              />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarSeparator />

      {/* Main navigation */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={
                      pathname === item.href ||
                      (item.href !== "/dashboard" &&
                        pathname.startsWith(item.href))
                    }
                    tooltip={item.title}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Life Areas section */}
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center justify-between pr-2">
            <span>Life Areas</span>
            <Link
              href="/areas"
              className="hover:bg-sidebar-accent p-1 rounded-md transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
            </Link>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {areas.length > 0 ? (
              <SidebarAreaList areas={areas} />
            ) : (
              <div className="px-4 py-2 text-xs text-muted-foreground italic">
                No areas yet
              </div>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer with logout */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => signOut()} tooltip="Log out">
              <LogOut className="h-4 w-4" />
              <span>Log out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      {/* Rail - hover edge to toggle sidebar */}
      <SidebarRail />
    </Sidebar>
  );
}
