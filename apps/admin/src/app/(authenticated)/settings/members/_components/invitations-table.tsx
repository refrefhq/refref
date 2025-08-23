"use client";

import { Card, CardContent } from "@refref/ui/components/card";
import { Button } from "@refref/ui/components/button";
import { Badge } from "@refref/ui/components/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@refref/ui/components/dropdown-menu";
import { MoreHorizontal, Mail, X, Clock } from "lucide-react";
import { Skeleton } from "@refref/ui/components/skeleton";
import {
  Invitation,
  getRoleLabel,
  getInvitationStatusColor,
  UserRole,
} from "../data";

interface InvitationsTableProps {
  invitations: Invitation[];
  onResendInvitation?: (email: string, role: UserRole) => void;
  onCancelInvitation?: (invitationId: string) => void;
  isLoading: boolean;
  currentUserRole?: "owner" | "admin" | "member";
}

export function InvitationsTable({
  invitations,
  onResendInvitation,
  onCancelInvitation,
  isLoading,
  currentUserRole,
}: InvitationsTableProps) {
  const getStatusIcon = (status: Invitation["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "accepted":
        return <Mail className="h-4 w-4" />;
      case "expired":
        return <X className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusLabel = (status: Invitation["status"]) => {
    switch (status) {
      case "pending":
        return "Pending";
      case "accepted":
        return "Accepted";
      case "expired":
        return "Expired";
      default:
        return "Unknown";
    }
  };

  return (
    <Card className="bg-card border-border py-0">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 font-medium text-muted-foreground">
                  Email
                </th>
                <th className="text-left p-4 font-medium text-muted-foreground">
                  Role
                </th>
                <th className="text-left p-4 font-medium text-muted-foreground">
                  Invited By
                </th>
                <th className="text-left p-4 font-medium text-muted-foreground">
                  Status
                </th>
                <th className="text-left p-4 font-medium text-muted-foreground">
                  Expires
                </th>
                <th className="text-right p-4 font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? // Loading skeleton rows
                  Array.from({ length: 2 }).map((_, index) => (
                    <tr
                      key={`skeleton-${index}`}
                      className="border-b border-border last:border-b-0"
                    >
                      {/* Email Column Skeleton */}
                      <td className="p-4">
                        <Skeleton className="h-4 w-48" />
                      </td>

                      {/* Role Column Skeleton */}
                      <td className="p-4">
                        <Skeleton className="h-4 w-16" />
                      </td>

                      {/* Invited By Column Skeleton */}
                      <td className="p-4">
                        <Skeleton className="h-4 w-24" />
                      </td>

                      {/* Status Column Skeleton */}
                      <td className="p-4">
                        <Skeleton className="h-6 w-20 rounded-full" />
                      </td>

                      {/* Expires Column Skeleton */}
                      <td className="p-4">
                        <Skeleton className="h-4 w-20" />
                      </td>

                      {/* Actions Column Skeleton */}
                      <td className="p-4">
                        <div className="flex justify-end">
                          <Skeleton className="h-8 w-8" />
                        </div>
                      </td>
                    </tr>
                  ))
                : invitations.map((invitation) => (
                    <tr
                      key={invitation.id}
                      className="border-b border-border last:border-b-0"
                    >
                      {/* Email Column */}
                      <td className="p-4">
                        <span className="font-medium text-foreground">
                          {invitation.email}
                        </span>
                      </td>

                      {/* Role Column */}
                      <td className="p-4">
                        <span className="text-foreground">
                          {getRoleLabel(invitation.role)}
                        </span>
                      </td>

                      {/* Invited By Column */}
                      <td className="p-4">
                        <span className="text-foreground">
                          {invitation.invitedBy}
                        </span>
                      </td>

                      {/* Status Column */}
                      <td className="p-4">
                        <Badge
                          variant="secondary"
                          className={`${getInvitationStatusColor(
                            invitation.status,
                          )} border-0`}
                        >
                          <div className="flex items-center gap-1">
                            {getStatusIcon(invitation.status)}
                            {getStatusLabel(invitation.status)}
                          </div>
                        </Badge>
                      </td>

                      {/* Expires Column */}
                      <td className="p-4">
                        <span className="text-foreground">
                          {invitation.expiresAt}
                        </span>
                      </td>

                      {/* Actions Column */}
                      <td className="p-4">
                        <div className="flex justify-end">
                          {currentUserRole && currentUserRole !== "member" ? (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {invitation.status === "pending" && (
                                  <>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        onResendInvitation?.(
                                          invitation.email,
                                          invitation.role,
                                        )
                                      }
                                    >
                                      <Mail className="mr-2 h-4 w-4" />
                                      Resend invitation
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        onCancelInvitation?.(invitation.id)
                                      }
                                      className="text-destructive focus:text-destructive"
                                    >
                                      <X className="mr-2 h-4 w-4" />
                                      Cancel invitation
                                    </DropdownMenuItem>
                                  </>
                                )}
                                {invitation.status === "expired" && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      onResendInvitation?.(
                                        invitation.email,
                                        invitation.role,
                                      )
                                    }
                                  >
                                    <Mail className="mr-2 h-4 w-4" />
                                    Resend invitation
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              -
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {!isLoading && invitations.length === 0 && (
          <div className="p-8 text-center">
            <Mail className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              No pending invitations
            </h3>
            <p className="text-muted-foreground">
              All invitations have been accepted or expired.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
