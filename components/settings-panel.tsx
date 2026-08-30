"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { getEmailNotificationSetting, setEmailNotificationSetting } from "@/lib/api";

export function SettingsPanel() {
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

    if (deleteConfirmText !== "KONTO LÖSCHEN") {
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
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="pixel-box bg-card">
        <CardHeader>
          <CardTitle className="font-sans uppercase tracking-wide">Passwort ändern</CardTitle>
          <CardDescription>
            Wenn dein Konto bereits ein Passwort hat, gib zuerst dein aktuelles Passwort ein.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onChangePassword}>
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Aktuelles Passwort</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">Neues Passwort</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Neues Passwort wiederholen</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-background"
              />
            </div>
            <Button type="submit" className="w-full" disabled={changingPassword}>
              {changingPassword ? "Speichert..." : "Passwort speichern"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="pixel-box bg-card">
        <CardHeader>
          <CardTitle className="font-sans uppercase tracking-wide">
            Benachrichtigungen
          </CardTitle>
          <CardDescription>
            Wenn jemand deine Lösung kommentiert oder bewertet, siehst du das immer in der
            Glocke im Kopfbereich. Zusätzlich per E-Mail:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-4">
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

      <Card className="pixel-box bg-card border-destructive/40 flex flex-col">
        <CardHeader>
          <CardTitle className="font-sans uppercase tracking-wide text-destructive">
            Konto löschen
          </CardTitle>
          <CardDescription>
            Dieser Schritt ist endgültig. Alle Submissions, Achievements und Rankings werden entfernt.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col">
          <form className="flex flex-1 flex-col space-y-4" onSubmit={onDeleteAccount}>
            <div className="space-y-2">
              <Label htmlFor="deleteConfirmText">Zur Bestätigung KONTO LÖSCHEN eingeben</Label>
              <Input
                id="deleteConfirmText"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="bg-background"
                placeholder="KONTO LÖSCHEN"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deletePassword">Aktuelles Passwort</Label>
              <Input
                id="deletePassword"
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                className="bg-background"
                placeholder="Bei OAuth ohne Passwort ggf. leer lassen"
              />
            </div>
            <Button
              type="submit"
              variant="destructive"
              className="mt-auto w-full"
              disabled={deletingAccount}
            >
              {deletingAccount ? "Löscht..." : "Konto endgültig löschen"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
