"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Shield, User } from "@nsmr/pixelart-react";
import { cn } from "@/lib/utils";

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "Administrator" | "Mitglied" | "Beobachter";
  status: "active" | "invited" | "inactive";
  avatar?: string;
  initials: string;
  joinDate: string;
  department?: string;
}

interface TeamMemberTableProps {
  members: TeamMember[];
  onEdit?: (member: TeamMember) => void;
  onRemove?: (member: TeamMember) => void;
}

export function TeamMemberTable({
  members,
  onEdit,
  onRemove,
}: TeamMemberTableProps) {
  const getRoleIcon = (role: string) => {
    switch (role) {
      case "Administrator":
        return <Shield className="h-3 w-3 text-red-500" />;
      case "Mitglied":
        return <User className="h-3 w-3 text-blue-500" />;
      default:
        return <Shield className="h-3 w-3 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge
            variant="outline"
            className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
          >
            Aktiv
          </Badge>
        );
      case "invited":
        return (
          <Badge
            variant="outline"
            className="bg-amber-500/10 text-amber-500 border-amber-500/20"
          >
            Eingeladen
          </Badge>
        );
      case "inactive":
        return (
          <Badge variant="outline" className="bg-muted text-muted-foreground">
            Inaktiv
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="overflow-hidden rounded-none border border-border">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Mitarbeiter
              </th>
              <th className="hidden px-4 py-3 text-left text-sm font-medium text-muted-foreground sm:table-cell">
                Rolle
              </th>
              <th className="hidden px-4 py-3 text-left text-sm font-medium text-muted-foreground md:table-cell">
                Abteilung
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Status
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground w-[50px]"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {members.map((member) => (
              <tr
                key={member.id}
                className="transition-colors hover:bg-secondary/30"
              >
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={member.avatar || "/placeholder.svg"}
                        alt={member.name}
                      />
                      <AvatarFallback>{member.initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{member.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {member.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="hidden px-4 py-4 sm:table-cell">
                  <div className="flex items-center gap-2">
                    {getRoleIcon(member.role)}
                    <span className="capitalize">{member.role}</span>
                  </div>
                </td>
                <td className="hidden px-4 py-4 md:table-cell">
                  <div className="text-sm">{member.department || "-"}</div>
                </td>
                <td className="px-4 py-4">{getStatusBadge(member.status)}</td>
                <td className="px-4 py-4 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="h-8 w-8 p-0 cursor-pointer hover:bg-foreground/20 hover:text-foreground"
                      >
                        <span className="sr-only">Menü öffnen</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Aktionen</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => onEdit?.(member)}>
                        Bearbeiten
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-500 focus:text-red-500"
                        onClick={() => onRemove?.(member)}
                      >
                        Entfernen
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
