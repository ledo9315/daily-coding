"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { USER_AVATAR_PATHS } from "@/lib/user-avatars";

interface ProfileAvatarPickerProps {
  currentAvatar: string;
  initials: string;
  name: string;
}

export function ProfileAvatarPicker({
  currentAvatar,
  initials,
  name,
}: ProfileAvatarPickerProps) {
  const t = useTranslations("profile");
  const router = useRouter();
  const { update } = useSession();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<string | null>(null);

  async function selectAvatar(path: string) {
    setPending(path);
    try {
      const res = await fetch("/api/user/avatar", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatar: path }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(
          typeof err.error === "string" ? err.error : t("avatarPicker.saveFailed")
        );
      }
      await update({ user: { image: path } });
      toast.success(t("avatarPicker.updated"));
      setOpen(false);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("avatarPicker.updateFailed"));
    } finally {
      setPending(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className={cn(
            "group relative shrink-0 rounded-none border-4 border-zinc-700 transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            "hover:border-primary/80"
          )}
          aria-label={t("avatarPicker.ariaLabel")}
        >
          <Avatar className="h-20 w-20 rounded-none">
            <AvatarImage src={currentAvatar || undefined} alt={name} />
            <AvatarFallback className="text-2xl rounded-none">{initials}</AvatarFallback>
          </Avatar>
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-background/70 text-xs font-bold uppercase tracking-wider text-primary opacity-0 transition-opacity group-hover:opacity-100">
            {t("avatarPicker.trigger")}
          </span>
        </button>
      </DialogTrigger>
      <DialogContent
        className="max-w-lg border-border bg-card sm:max-w-xl"
        closeLabel={t("closeDialog")}
      >
        <DialogHeader>
          <DialogTitle className="font-sans uppercase tracking-wide">
            {t("avatarPicker.dialogTitle")}
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
          {USER_AVATAR_PATHS.map((path) => {
            const active = currentAvatar === path;
            return (
              <button
                key={path}
                type="button"
                disabled={pending !== null}
                onClick={() => void selectAvatar(path)}
                className={cn(
                  "relative aspect-square overflow-hidden border-2 border-border bg-secondary transition-colors",
                  "hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  active && "border-primary ring-2 ring-primary/50",
                  pending === path && "opacity-60"
                )}
                aria-label={path}
                aria-pressed={active}
              >
                <img
                  src={path}
                  alt=""
                  className="h-full w-full object-cover [image-rendering:pixelated]"
                />
              </button>
            );
          })}
        </div>
        <Button
          type="button"
          variant="outline"
          className="w-full border-border text-foreground hover:bg-secondary hover:text-foreground"
          onClick={() => setOpen(false)}
        >
          {t("avatarPicker.close")}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
