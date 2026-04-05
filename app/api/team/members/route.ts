import { NextResponse } from "next/server";
import type { TeamMember } from "@/lib/api";

const members: TeamMember[] = [
  { id: "1", name: "Anna Schmidt", email: "anna.schmidt@company.com", role: "Administrator", status: "active", initials: "AS", avatar: "/user/chibi1.png", joinDate: "01.01.2024", department: "Frontend" },
  { id: "2", name: "Tom Weber", email: "tom.weber@company.com", role: "Mitglied", status: "active", initials: "TW", avatar: "/user/chibi2.png", joinDate: "15.02.2024", department: "Backend" },
  { id: "3", name: "Max Mustermann", email: "max.mustermann@company.com", role: "Mitglied", status: "invited", initials: "MM", avatar: "/user/minipix5.png", joinDate: "-", department: "Frontend" },
  { id: "4", name: "Lisa Müller", email: "lisa.mueller@company.com", role: "Mitglied", status: "active", initials: "LM", avatar: "/user/chibi3.png", joinDate: "03.03.2024", department: "Design" },
  { id: "5", name: "Sarah Klein", email: "sarah.klein@company.com", role: "Beobachter", status: "inactive", initials: "SK", avatar: "/user/minipix4.png", joinDate: "01.01.2024", department: "Marketing" },
];

export async function GET() {
  return NextResponse.json(members);
}
