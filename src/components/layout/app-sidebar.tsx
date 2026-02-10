"use client";

import * as Icons from "lucide-react";
import {
  LayoutDashboard,
  Layers,
  CheckCircle2,
  Target,
  BarChart3,
  Settings,
  Plus,
  LogOut,
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
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/actions/auth-actions";
import { cn } from "@/lib/utils";

const navItems = [
  { title: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { title: "Life Areas", icon: Layers, href: "/areas" },
  { title: "Habits", icon: CheckCircle2, href: "/habits" },
  { title: "Goals", icon: Target, href: "/goals" },
  { title: "Analytics", icon: BarChart3, href: "/analytics" },
  { title: "Settings", icon: Settings, href: "/settings" },
];

interface AppSidebarProps {
  areas: any[];
}

export function AppSidebar({ areas }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <Sidebar variant="inset">
      <SidebarHeader className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2 font-bold text-xl">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
            L
          </div>
          <span>LifePlanner</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
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

        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center justify-between pr-2">
            <span>Life Areas</span>
            <Link href="/areas" className="hover:bg-muted p-1 rounded">
              <Plus className="h-3 w-3" />
            </Link>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {areas.length > 0 ? (
                areas.map((area) => {
                  const Icon = (Icons as any)[area.icon || "Circle"] || Icons.Circle;
                  return (
                    <SidebarMenuItem key={area.id}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === `/areas/${area.id}`}
                        tooltip={area.name}
                      >
                        <Link href={`/areas/${area.id}`}>
                          <Icon className="h-4 w-4" style={{ color: area.color }} />
                          <span>{area.name}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })
              ) : (
                <div className="px-4 py-2 text-xs text-muted-foreground italic">
                  No areas yet
                </div>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => signOut()}>
              <LogOut className="h-4 w-4" />
              <span>Log out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
