"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Notification, Lock, Trash, Chat, Check } from "@nsmr/pixelart-react";
import { cn } from "@/lib/utils";
import type { AppLocale } from "@/lib/locale";
import {
  getEmailNotificationSetting,
  setEmailNotificationSetting,
  type EmailNotificationSettings,
  setLocaleSetting,
} from "@/lib/api";

/** Sidebar entries; the id doubles as the key of the panel shown next to it and as its label key. */
const SECTIONS = [
  { id: "notifications", icon: Notification },
  { id: "language", icon: Chat },
  { id: "security", icon: Lock },
  { id: "account", icon: Trash },
] as const;

/** Endonyms - a language names itself the same way in every UI language. */
const LOCALE_OPTIONS: { id: AppLocale; label: string }[] = [
  { id: "de", label: "Deutsch" },
  { id: "en", label: "English" },
];

type SectionId = (typeof SECTIONS)[number]["id"];

export function SettingsPanel() {
  const t = useTranslations("profile");
  /**
   * Shown, typed and compared in the language of the panel. `DELETE /api/user/account`
   * accepts the phrase of either language, so a switch mid-dialog stays recoverable.
   */
  const confirmPhrase = t("settings.account.confirmPhrase");
  const router = useRouter();
  const { data: session, update } = useSession();

  // Client state, not a route per section: the panels are four forms, and a URL per form
  // would mean four pages that all render the same shell.
  const [section, setSection] = useState<SectionId>("notifications");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  // null until loaded: rendering the switches as "off" first would tell the user their
  // mails are disabled for a moment, which is the opposite of the default.
  const [notifications, setNotifications] = useState<EmailNotificationSettings | null>(null);

  /**
   * Only set while the session has not caught up yet - `update()` below writes the new
   * locale into the JWT, and from then on the session is the single source.
   */
  const [pendingLocale, setPendingLocale] = useState<AppLocale | null>(null);
  const [savingLocale, setSavingLocale] = useState(false);
  const activeLocale = pendingLocale ?? session?.user?.locale ?? null;

  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [deletingAccount, setDeletingAccount] = useState(false);

  useEffect(() => {
    getEmailNotificationSetting()
      .then(setNotifications)
      .catch(() => {});
  }, []);

  // Optimistic, and rolled back as a whole: the two switches share one request shape, so
  // a failed write must not leave the other one showing a value that was never stored.
  async function onToggleNotification(
    key: keyof EmailNotificationSettings,
    next: boolean
  ) {
    const previous = notifications;
    if (!previous) return;

    setNotifications({ ...previous, [key]: next });
    try {
      await setEmailNotificationSetting({ [key]: next });
    } catch (error) {
      setNotifications(previous);
      toast.error(
        error instanceof Error ? error.message : t("settings.notifications.saveFailed")
      );
    }
  }

  async function onSelectLocale(next: AppLocale) {
    if (next === activeLocale || savingLocale) return;

    setSavingLocale(true);
    setPendingLocale(next);
    try {
      await setLocaleSetting(next);
      // Without the token update the JWT keeps the old language for up to 30 days; without
      // the refresh the already rendered server components keep showing it.
      await update({ user: { locale: next } });
      router.refresh();
    } catch (error) {
      setPendingLocale(null);
      toast.error(
        error instanceof Error ? error.message : t("settings.language.saveFailed")
      );
    } finally {
      setSavingLocale(false);
    }
  }

  async function onChangePassword(e: React.FormEvent) {
    e.preventDefault();

    if (newPassword.length < 8) {
      toast.error(t("settings.security.tooShort"));
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error(t("settings.security.mismatch"));
      return;
    }

    setChangingPassword(true);
    try {
      const res = await fetch("/api/user/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          typeof data.error === "string"
            ? data.error
            : t("settings.security.updateFailed")
        );
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success(t("settings.security.updated"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("settings.security.changeFailed"));
    } finally {
      setChangingPassword(false);
    }
  }

  async function onDeleteAccount(e: React.FormEvent) {
    e.preventDefault();

    const typedPhrase = deleteConfirmText.trim();
    if (typedPhrase !== confirmPhrase) {
      toast.error(t("settings.account.confirmMismatch", { phrase: confirmPhrase }));
      return;
    }

    setDeletingAccount(true);
    try {
      const res = await fetch("/api/user/account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          confirmText: typedPhrase,
          currentPassword: deletePassword,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          typeof data.error === "string" ? data.error : t("settings.account.deleteFailed")
        );
      }

      await signOut({ callbackUrl: "/register?accountDeleted=1" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("settings.account.failed"));
      setDeletingAccount(false);
    }
  }

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[15rem_1fr]">
      {/* Stacked above the panel on small screens, beside it from `lg` on. A scrolling row
          was the alternative and pushed the active entry out of sight on a phone. */}
      <nav aria-label={t("settings.sectionsLabel")} className="flex flex-col gap-2">
        {SECTIONS.map((entry) => {
          const active = section === entry.id;
          return (
            <button
              key={entry.id}
              type="button"
              aria-current={active ? "page" : undefined}
              onClick={() => setSection(entry.id)}
              className={cn(
                "flex w-full items-center gap-2 border-2 px-4 py-2.5 text-left text-lg uppercase transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                active
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-transparent text-muted-foreground hover:border-border hover:bg-secondary hover:text-foreground",
              )}
            >
              <entry.icon className="h-5 w-5 shrink-0" />
              {t(`settings.sections.${entry.id}`)}
            </button>
          );
        })}
      </nav>

      {section === "notifications" && (
        <Card className="pixel-box bg-card">
          <CardHeader>
            <CardTitle className="font-sans uppercase">
              {t("settings.notifications.title")}
            </CardTitle>
            <CardDescription className="text-base leading-relaxed">
              {t("settings.notifications.description")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between gap-4 border-2 border-border bg-background px-4 py-3">
              <Label htmlFor="notifyByEmail" className="text-lg">
                {t("settings.notifications.emailLabel")}
              </Label>
              <Switch
                id="notifyByEmail"
                checked={notifications?.notifyByEmail ?? true}
                disabled={notifications === null}
                onCheckedChange={(next) => onToggleNotification("notifyByEmail", next)}
              />
            </div>

            <div className="border-2 border-border bg-background px-4 py-3">
              <div className="flex items-center justify-between gap-4">
                <Label htmlFor="notifyDailyReminder" className="text-lg">
                  {t("settings.notifications.reminderLabel")}
                </Label>
                <Switch
                  id="notifyDailyReminder"
                  checked={notifications?.notifyDailyReminder ?? true}
                  disabled={notifications === null}
                  onCheckedChange={(next) =>
                    onToggleNotification("notifyDailyReminder", next)
                  }
                />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {t("settings.notifications.reminderHint")}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {section === "language" && (
        <Card className="pixel-box bg-card">
          <CardHeader>
            <CardTitle className="font-sans uppercase">
              {t("settings.language.title")}
            </CardTitle>
            <CardDescription className="text-base leading-relaxed">
              {t("settings.language.description")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              role="radiogroup"
              aria-label={t("settings.language.groupLabel")}
              className="flex max-w-md flex-col gap-2"
            >
              {LOCALE_OPTIONS.map((option) => {
                const selected = activeLocale === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    disabled={savingLocale || activeLocale === null}
                    onClick={() => onSelectLocale(option.id)}
                    className={cn(
                      "flex w-full items-center justify-between gap-4 border-2 px-4 py-3 text-left text-lg uppercase transition-colors",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      "disabled:cursor-not-allowed disabled:opacity-60",
                      selected
                        ? "border-primary bg-primary/15 text-primary"
                        : "border-border bg-background text-muted-foreground hover:bg-secondary hover:text-foreground",
                    )}
                  >
                    {option.label}
                    {selected && <Check className="h-5 w-5 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {section === "security" && (
        <Card className="pixel-box bg-card">
          <CardHeader>
            <CardTitle className="font-sans uppercase">
              {t("settings.security.title")}
            </CardTitle>
            <CardDescription className="text-base leading-relaxed">
              {t("settings.security.description")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="max-w-md space-y-5" onSubmit={onChangePassword}>
              <div className="space-y-2">
                <Label htmlFor="currentPassword">{t("settings.security.currentPassword")}</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">{t("settings.security.newPassword")}</Label>
                <Input
                  id="newPassword"
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  {t("settings.security.confirmPassword")}
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <Button type="submit" disabled={changingPassword}>
                {changingPassword
                  ? t("settings.security.submitting")
                  : t("settings.security.submit")}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {section === "account" && (
        <Card className="pixel-box border-destructive/40 bg-card">
          <CardHeader>
            <CardTitle className="font-sans uppercase text-destructive">
              {t("settings.account.title")}
            </CardTitle>
            <CardDescription className="text-base leading-relaxed">
              {t("settings.account.description")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="max-w-md space-y-5" onSubmit={onDeleteAccount}>
              <div className="space-y-2">
                <Label htmlFor="deleteConfirmText">
                  {t.rich("settings.account.confirmLabel", {
                    phrase: confirmPhrase,
                    highlight: (chunks) => (
                      <span className="font-code text-destructive">{chunks}</span>
                    ),
                  })}
                </Label>
                {/* No placeholder repeating the phrase: it would turn the gate into something
                    to copy rather than something to mean. */}
                <Input
                  id="deleteConfirmText"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deletePassword">{t("settings.account.passwordLabel")}</Label>
                <Input
                  id="deletePassword"
                  type="password"
                  autoComplete="current-password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  aria-describedby="deletePasswordHint"
                />
                {/* Was a placeholder, where it vanished with the first keystroke. */}
                <p id="deletePasswordHint" className="text-sm text-muted-foreground">
                  {t("settings.account.passwordHint")}
                </p>
              </div>
              <Button
                type="submit"
                variant="destructive"
                disabled={deletingAccount || deleteConfirmText.trim() !== confirmPhrase}
              >
                {deletingAccount
                  ? t("settings.account.submitting")
                  : t("settings.account.submit")}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
