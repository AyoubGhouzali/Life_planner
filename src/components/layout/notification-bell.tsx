"use client";

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { markAsRead, markAllAsRead } from "@/actions/notification-actions";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function NotificationBell({
  notifications,
}: {
  notifications: { unread: any[]; recentRead: any[] };
}) {
  const [unread, setUnread] = useState(notifications.unread);
  const [recentRead, setRecentRead] = useState(notifications.recentRead);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setUnread(notifications.unread);
    setRecentRead(notifications.recentRead);
  }, [notifications]);

  const handleMarkAsRead = async (id: string, link?: string | null) => {
    const notification = unread.find((n: any) => n.id === id);
    if (notification) {
      const newUnread = unread.filter((n: any) => n.id !== id);
      setUnread(newUnread);
      setRecentRead(
        [{ ...notification, read_at: new Date() }, ...recentRead].slice(0, 5),
      );
    }

    markAsRead(id).catch((err) => {
      console.error("Failed to mark as read", err);
    });

    if (link) {
      setOpen(false);
      router.push(link);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (unread.length === 0) return;

    const userId = unread[0].user_id;
    const oldUnread = [...unread];

    setRecentRead(
      [
        ...unread.map((n) => ({ ...n, read_at: new Date() })),
        ...recentRead,
      ].slice(0, 5),
    );
    setUnread([]);

    try {
      await markAllAsRead(userId);
      toast.success("All notifications marked as read");
    } catch (error) {
      setUnread(oldUnread);
      toast.error("Failed to mark all as read");
    }
  };

  const bellButton = (
    <Button variant="ghost" size="icon" className="relative">
      <Bell className="h-5 w-5" />
      {unread.length > 0 && (
        <span className="absolute top-1.5 right-2 h-2 w-2 rounded-full bg-red-600" />
      )}
      <span className="sr-only">Notifications</span>
    </Button>
  );

  if (!mounted) return bellButton;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{bellButton}</PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between border-b p-4">
          <h4 className="font-semibold">Notifications</h4>
          {unread.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="text-xs h-auto py-1"
            >
              Mark all read
            </Button>
          )}
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          {unread.length === 0 && recentRead.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No notifications
            </div>
          ) : (
            <div className="grid">
              {unread.map((notification: any) => (
                <div
                  key={notification.id}
                  className="border-b px-4 py-3 hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() =>
                    handleMarkAsRead(notification.id, notification.link)
                  }
                >
                  <div className="flex items-start gap-3">
                    <div className="h-2 w-2 mt-1.5 rounded-full bg-blue-600 shrink-0" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {notification.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {notification.message}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {new Date(notification.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {recentRead.length > 0 && (
                <>
                  <div className="px-4 py-2 bg-muted/20 text-xs font-semibold text-muted-foreground">
                    Recent
                  </div>
                  {recentRead.map((notification: any) => (
                    <div
                      key={notification.id}
                      className="border-b px-4 py-3 opacity-60"
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {notification.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {notification.message}
                        </p>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
