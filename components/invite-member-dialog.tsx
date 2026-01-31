"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { UserPlus } from "@nsmr/pixelart-react";

export function InviteMemberDialog() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call
    console.log("Inviting user:", { email, role });

    toast.success("Einladung gesendet!", {
      description: `Eine Einladung wurde an ${email} gesendet.`,
    });

    setOpen(false);
    setEmail("");
    setRole("member");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="pixel-btn gap-2 bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer">
          <UserPlus className="h-4 w-4" />
          MITARBEITER EINLADEN
        </Button>
      </DialogTrigger>
      <DialogContent className="pixel-box sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-pixel text-xl">
            NEUES MITGLIED
          </DialogTitle>
          <DialogDescription>
            Lade einen neuen Mitarbeiter in dein Team ein. Er erhaelt eine
            E-Mail mit dem Zugangslink.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="email">E-Mail Adresse</Label>
            <Input
              id="email"
              type="email"
              placeholder="mitarbeiter@firma.de"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-background"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="role">Rolle</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Wähle eine Rolle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Mitglied</SelectItem>
                <SelectItem value="admin">Administrator</SelectItem>
                <SelectItem value="viewer">Beobachter</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="submit" className="pixel-btn w-full">
              EINLADUNG SENDEN
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
