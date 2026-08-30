"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Notification as Bell } from "@nsmr/pixelart-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  getNotifications,
  markNotificationsRead,
  type NotificationItem,
} from "@/lib/api";
import { avatarImageSrc } from "@/lib/avatar-src";
import { formatDate } from "@/lib/format";

const SHOWN = 10;

export function NotificationBell() {
  const pathname = usePathname();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unread, setUnread] = useState(0);
  /** Which input closed the menu; see `onCloseAutoFocus` below. */
  const usedPointer = useRef(false);

  const load = useCallback(() => {
    getNotifications(SHOWN)
      .then((page) => {
        setItems(page.items);
        setUnread(page.unreadCount);
      })
      .catch(() => {});
  }, []);

  // Loaded on mount and on every navigation, like the header's streak. There is no polling:
  // a bell that updates on the next page view is enough for a comment on yesterday's code.
  useEffect(load, [load, pathname]);

  function onOpenChange(open: boolean) {
    if (!open) return;
    load();
    if (unread === 0) return;
    // Optimistic: the badge is gone the moment the list is on screen, and a failed request
    // only means the next load brings the count back.
    setUnread(0);
    markNotificationsRead().catch(() => {});
  }

  return (
    <DropdownMenu onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          aria-label={
            unread > 0 ? `Benachrichtigungen, ${unread} ungelesen` : "Benachrichtigungen"
          }
          onPointerDown={() => (usedPointer.current = true)}
          onKeyDown={() => (usedPointer.current = false)}
          /* Shaped like the streak chip next to it, and coloured like it once there is
             something to report - a lone grey square read as an unfinished button.
             `hover:text-*` is spelled out because the ghost variant's `accent-foreground`
             is near-black on this card and swallowed the bell on hover. */
          className={cn(
            "pixel-box flex h-12 items-center gap-1.5 border-2 px-2 py-2 sm:px-3 cursor-pointer rounded-none",
            "hover:bg-card dark:hover:bg-card hover:border-primary hover:text-primary",
            // The base button paints a blue `ring` border on focus, which has nothing to do
            // with this palette.
            "focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-primary outline-none",
            unread > 0
              ? "border-primary/20 text-primary"
              : "border-border text-muted-foreground",
          )}
        >
          <Bell className="size-5 shrink-0" />
          {unread > 0 && (
            <span className="font-sans text-xl leading-none">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-80 max-w-[calc(100vw-2rem)] border-2 border-border rounded-none"
        align="end"
        forceMount
        /**
         * Radix hands focus back to the trigger when the menu closes, which left the focus
         * border standing after a click. Kept for the keyboard, where losing the place would
         * be worse than a visible ring.
         */
        onCloseAutoFocus={(event) => {
          if (usedPointer.current) event.preventDefault();
        }}
      >
        <p className="border-b-2 border-border p-3 font-sans text-sm uppercase tracking-wider text-muted-foreground">
          Benachrichtigungen
        </p>
        {items.length === 0 ? (
          <p className="p-4 text-base text-muted-foreground">
            Noch nichts passiert. Sobald jemand deine Lösung kommentiert oder bewertet,
            steht es hier.
          </p>
        ) : (
          items.map((item) => (
            <DropdownMenuItem
              key={item.id}
              asChild
              /* The menu item's default highlight is `bg-primary`, and the coloured spans
                 inside keep their own text colour on top of it - green on green, unreadable.
                 A grey row is what the rest of the header uses anyway. */
              className="rounded-none whitespace-normal items-start gap-3 py-3 focus:bg-secondary focus:text-foreground"
            >
              <Link href={item.href} className="cursor-pointer">
                <Avatar className="h-8 w-8 shrink-0 border-2 border-border bg-card">
                  <AvatarImage src={avatarImageSrc(item.actor.avatar)} alt="" />
                  <AvatarFallback className="text-xs">
                    {item.actor.initials}
                  </AvatarFallback>
                </Avatar>
                <span className="min-w-0 flex-1">
                  <span
                    className={`block text-base leading-snug ${
                      item.read ? "text-muted-foreground" : "text-foreground"
                    }`}
                  >
                    {item.text}
                  </span>
                  <span className="mt-1 block text-xs uppercase tracking-wider text-muted-foreground">
                    {formatDate(new Date(item.createdAt))}
                  </span>
                </span>
              </Link>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
