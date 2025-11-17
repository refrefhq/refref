"use client";

import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  ExternalLink,
  PauseCircle,
  Settings,
  Users,
  Link2,
  TrendingUp,
  MoreVertical,
  BarChart,
} from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@refref/ui/components/card";
import { Button } from "@refref/ui/components/button";
import { Badge } from "@refref/ui/components/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@refref/ui/components/dropdown-menu";
import { DateDisplay } from "@/components/date-display";

// Define the types for our referral program
export type ProgramStatus = "pending_setup" | "active" | "inactive";

interface Program {
  id: string;
  name: string;
  status: ProgramStatus;
  participantCount?: number;
  referralCount?: number;
  createdAt: Date;
}

interface ProgramCardProps {
  program: Program;
}

// Individual card component
export function ProgramCard({ program }: ProgramCardProps) {
  const router = useRouter();

  // Status badge styling and content based on status
  const getStatusBadge = (status: ProgramStatus) => {
    switch (status) {
      case "active":
        return (
          <Badge
            variant="outline"
            className="bg-green-100 text-green-800 hover:bg-green-200 border-green-200"
          >
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
            Active
          </Badge>
        );
      case "pending_setup":
        return (
          <Badge
            variant="outline"
            className="bg-amber-50 text-amber-800 hover:bg-amber-100 border-amber-200"
          >
            <Clock className="w-3.5 h-3.5 mr-1" />
            Setup Pending
          </Badge>
        );
      case "inactive":
        return (
          <Badge
            variant="secondary"
            className="bg-slate-100 text-slate-800 hover:bg-slate-200"
          >
            <PauseCircle className="w-3.5 h-3.5 mr-1" />
            Inactive
          </Badge>
        );
      default:
        return null;
    }
  };

  const handleCardClick = () => {
    if (program.status === "pending_setup") {
      router.push(`/programs/${program.id}/setup`);
    } else {
      router.push(`/programs/${program.id}`);
    }
  };

  const conversionRate =
    program.participantCount && program.participantCount > 0
      ? (
          ((program.referralCount || 0) / program.participantCount) *
          100
        ).toFixed(1)
      : "0";

  return (
    <Card
      onClick={handleCardClick}
      className="transition-all duration-200 hover:shadow-md cursor-pointer flex flex-col"
    >
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <CardTitle className="text-lg font-semibold">
                {program.name}
              </CardTitle>
              {getStatusBadge(program.status)}
            </div>
            <CardDescription className="mt-1">
              Created <DateDisplay date={program.createdAt} />
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {program.status !== "pending_setup" && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/programs/${program.id}`);
                    }}
                  >
                    <BarChart className="mr-2 h-4 w-4" />
                    View Analytics
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/programs/${program.id}?step=installation`);
                    }}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-grow">
        {program.status === "active" && (
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Participants
              </span>
              <span className="text-sm font-semibold">
                {program.participantCount || 0}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Link2 className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Referrals</span>
              <span className="text-sm font-semibold">
                {program.referralCount || 0}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Conversion Rate
              </span>
              <span className="text-sm font-semibold">{conversionRate}%</span>
            </div>
          </div>
        )}

        {program.status === "pending_setup" && (
          <p className="text-sm text-muted-foreground">
            Complete the setup to activate your referral program
          </p>
        )}

        {program.status === "inactive" && (
          <p className="text-sm text-muted-foreground">
            This program is currently inactive
          </p>
        )}
      </CardContent>

      {program.status === "pending_setup" && (
        <CardFooter className="justify-end">
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/programs/${program.id}/setup`);
            }}
          >
            <Settings className="w-4 h-4 mr-2" />
            Continue Setup
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
