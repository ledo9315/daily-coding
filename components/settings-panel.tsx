"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Notification, Lock, Trash } from "@nsmr/pixelart-react";
import { cn } from "@/lib/utils";
import { getEmailNotificationSetting, setEmailNotificationSetting } from "@/lib/api";

/** Sidebar entries; the id doubles as the key of the panel shown next to it. */
const SECTIONS = [
  { id: "notifications", label: "Benachrichtigungen", icon: Notification },
  { id: "security", label: "Sicherheit", icon: Lock },
  { id: "account", label: "Konto", icon: Trash },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

const CONFIRM_PHRASE = "KONTO LÖSCHEN";

export function SettingsPanel() {
  // Client state, not a route per section: the panels are three forms, and a URL per form
  // would mean three pages that all render the same shell.
  const [section, setSection] = useState<SectionId>("notifications");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  // null until loaded: rendering the switch as "off" first would tell the user their mails
  // are disabled for a moment, which is the opposite of the default.
  const [notifyByEmail, setNotifyByEmail] = useState<boolean | null>(null);

  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [deletingAccount, setDeletingAccount] = useState(false);

  useEffect(() => {
    getEmailNotificationSetting()
      .then((data) => setNotifyByEmail(data.notifyByEmail))
      .catch(() => {});
  }, []);

  async function onToggleEmails(next: boolean) {
    const previous = notifyByEmail;
    setNotifyByEmail(next);
    try {
      await setEmailNotificationSetting(next);
    } catch (error) {
      setNotifyByEmail(previous);
      toast.error(
        error instanceof Error ? error.message : "Einstellung konnte nicht gespeichert werden."
      );
    }
  }

  async function onChangePassword(e: React.FormEvent) {
    e.preventDefault();

    if (newPassword.length < 8) {
      toast.error("Neues Passwort ist zu kurz.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwort-Wiederholung stimmt nicht überein.");
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
            : "Passwort konnte nicht aktualisiert werden."
        );
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Passwort wurde erfolgreich aktualisiert.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Passwort-Änderung fehlgeschlagen.");
    } finally {
      setChangingPassword(false);
    }
  }

  async function onDeleteAccount(e: React.FormEvent) {
    e.preventDefault();

    if (deleteConfirmText !== CONFIRM_PHRASE) {
      toast.error("Bitte gib exakt KONTO LÖSCHEN ein.");
      return;
    }

    setDeletingAccount(true);
    try {
      const res = await fetch("/api/user/account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          confirmText: deleteConfirmText,
          currentPassword: deletePassword,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          typeof data.error === "string" ? data.error : "Konto konnte nicht gelöscht werden."
        );
      }

      await signOut({ callbackUrl: "/register?accountDeleted=1" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Konto-Löschung fehlgeschlagen.");
      setDeletingAccount(false);
    }
  }

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[15rem_1fr]">
      {/* Stacked above the panel on small screens, beside it from `lg` on. A scrolling row
          was the alternative and pushed the active entry out of sight on a phone. */}
      <nav aria-label="Bereiche" className="flex flex-col gap-2">
        {SECTIONS.map((entry) => {
          const active = section === entry.id;
          return (
            <button
              key={entry.id}
              type="button"
              aria-current={active ? "page" : undefined}
              onClick={() => setSection(entry.id)}
              className={cn(
                "flex w-full items-center gap-2 border-2 px-4 py-2.5 text-left text-lg uppercase tracking-wider transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                active
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-transparent text-muted-foreground hover:border-border hover:bg-secondary hover:text-foreground",
              )}
            >
              <entry.icon className="h-5 w-5 shrink-0" />
              {entry.label}
            </button>
          );
        })}
      </nav>

      {section === "notifications" && (
        <Card className="pixel-box bg-card">
          <CardHeader>
            <CardTitle className="font-sans uppercase tracking-wide">
              Benachrichtigungen
            </CardTitle>
            <CardDescription className="text-base leading-relaxed">
              Wenn jemand deine Lösung kommentiert oder bewertet, siehst du das immer in
              der Glocke im Kopfbereich. Zusätzlich per E-Mail:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between gap-4 border-2 border-border bg-background px-4 py-3">
              <Label htmlFor="notifyByEmail" className="text-lg">
                Benachrichtigungen per E-Mail
              </Label>
              <Switch
                id="notifyByEmail"
                checked={notifyByEmail ?? true}
                disabled={notifyByEmail === null}
                onCheckedChange={onToggleEmails}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {section === "security" && (
        <Card className="pixel-box bg-card">
          <CardHeader>
            <CardTitle className="font-sans uppercase tracking-wide">Passwort ändern</CardTitle>
            <CardDescription className="text-base leading-relaxed">
              Wenn dein Konto bereits ein Passwort hat, gib zuerst dein aktuelles Passwort ein.
              Mindestens 8 Zeichen.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="max-w-md space-y-5" onSubmit={onChangePassword}>
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Aktuelles Passwort</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">Neues Passwort</Label>
                <Input
                  id="newPassword"
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Neues Passwort wiederholen</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <Button type="submit" disabled={changingPassword}>
                {changingPassword ? "Speichert..." : "Passwort speichern"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {section === "account" && (
        <Card className="pixel-box border-destructive/40 bg-card">
          <CardHeader>
            <CardTitle className="font-sans uppercase tracking-wide text-destructive">
              Konto löschen
            </CardTitle>
            <CardDescription className="text-base leading-relaxed">
              Dieser Schritt ist endgültig: Abgaben, Achievements, Platzierungen und deine
              Serie werden gelöscht und lassen sich nicht wiederherstellen.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="max-w-md space-y-5" onSubmit={onDeleteAccount}>
              <div className="space-y-2">
                <Label htmlFor="deleteConfirmText">
                  Tippe <span className="font-code text-destructive">{CONFIRM_PHRASE}</span> zur
                  Bestätigung
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
                <Label htmlFor="deletePassword">Aktuelles Passwort</Label>
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
                  Bei einem Konto über GitHub oder Google ohne Passwort leer lassen.
                </p>
              </div>
              <Button
                type="submit"
                variant="destructive"
                disabled={deletingAccount || deleteConfirmText !== CONFIRM_PHRASE}
              >
                {deletingAccount ? "Löscht..." : "Konto endgültig löschen"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
