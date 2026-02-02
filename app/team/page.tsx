"use client";

import { Header } from "@/components/header";
import { InviteMemberDialog } from "@/components/invite-member-dialog";
import { TeamMember, TeamMemberTable } from "@/components/team-member-table";
import { StatsCard } from "@/components/stats-card";
import { Card } from "@/components/ui/card";
import { Shield, Users, Zap } from "@nsmr/pixelart-react";
import { useState } from "react";
import { toast } from "sonner";
import { EncryptedText } from "@/components/ui/encrypted-text";
import { FlickeringGrid } from "@/components/ui/flickering-grid";

// Mock Data
const initialMembers: TeamMember[] = [
  {
    id: "1",
    name: "Anna Schmidt",
    email: "anna.schmidt@company.com",
    role: "Administrator",
    status: "active",
    initials: "AS",
    avatar: "/user/chibi1.png",
    joinDate: "01.01.2024",
    department: "Frontend",
  },
  {
    id: "2",
    name: "Tom Weber",
    email: "tom.weber@company.com",
    role: "Mitglied",
    status: "active",
    initials: "TW",
    avatar: "/user/chibi2.png",
    joinDate: "15.02.2024",
    department: "Backend",
  },
  {
    id: "3",
    name: "Max Mustermann",
    email: "max.mustermann@company.com",
    role: "Mitglied",
    status: "invited",
    initials: "MM",
    avatar: "/user/minipix5.png",
    joinDate: "-",
    department: "Frontend",
  },
  {
    id: "4",
    name: "Lisa Müller",
    email: "lisa.mueller@company.com",
    role: "Mitglied",
    status: "active",
    initials: "LM",
    avatar: "/user/chibi3.png",
    joinDate: "03.03.2024",
    department: "Design",
  },
  {
    id: "5",
    name: "Sarah Klein",
    email: "sarah.klein@company.com",
    role: "Beobachter",
    status: "inactive",
    initials: "SK",
    avatar: "/user/minipix4.png",
    joinDate: "01.01.2024",
    department: "Marketing",
  },
];

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>(initialMembers);

  const handleEdit = (member: TeamMember) => {
    console.log("Edit member:", member);
    toast.info("Bearbeiten Funktion folgt bald.");
  };

  const handleRemove = (member: TeamMember) => {
    console.log("Remove member:", member);
    toast.error(`${member.name} wurde entfernt.`);
    setMembers((prev) => prev.filter((m) => m.id !== member.id));
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <FlickeringGrid
        className="absolute inset-0 z-0 mask-[radial-gradient(300px_circle_at_top,white,transparent)]"
        squareSize={6}
        gridGap={1}
        color="#A371F7"
        maxOpacity={0.2}
        flickerChance={0.1}
        height={300}
        width={1920}
      />
      {/* Ambient Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] h-150 w-150 bg-chart-5/15 blur-[120px] rounded-full opacity-50 mix-blend-screen" />
        <div className="absolute bottom-[-10%] left-[-5%] h-125 w-125 bg-chart-5/15 blur-[100px] rounded-full opacity-50 mix-blend-screen" />
      </div>

      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 relative">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-pixel uppercase tracking-tight mb-2">
              Team Verwaltung
            </h1>
            <EncryptedText
              text="Verwalte deine Mitarbeiter und Rollen."
              revealDelayMs={20}
              className="text-xl text-muted-foreground uppercase tracking-wide"
            />
          </div>
          <InviteMemberDialog />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <StatsCard
            title="Gesamt"
            value={members.length}
            description="Mitarbeiter im Konto"
            icon={Users}
          />
          <StatsCard
            title="Aktiv"
            value={members.filter((m) => m.status === "active").length}
            description="Aktive Nutzer"
            icon={Zap}
          />
          <StatsCard
            title="Admins"
            value={members.filter((m) => m.role === "Administrator").length}
            description="Administratoren"
            icon={Shield}
          />
        </div>

        <Card className="pixel-box bg-card border-none shadow-none">
          <TeamMemberTable
            members={members}
            onEdit={handleEdit}
            onRemove={handleRemove}
          />
        </Card>
      </main>
    </div>
  );
}
