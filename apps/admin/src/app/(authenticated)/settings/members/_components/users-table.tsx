"use client";

import { useState } from "react";
import { Card, CardContent } from "@refref/ui/components/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@refref/ui/components/avatar";
import { Button } from "@refref/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@refref/ui/components/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@refref/ui/components/select";
import { MoreHorizontal, UserMinus, AlertCircle } from "lucide-react";
import { Skeleton } from "@refref/ui/components/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@refref/ui/components/tooltip";
import { User, UserRole, getRoleLabel, roleOptions } from "../data";

interface MemberCounts {
  total: number;
  owners: number;
  admins: number;
}

interface UsersTableProps {
  users: User[];
  isLoading: boolean;
  onRoleChange?: (userId: string, newRole: UserRole) => void;
  onRemoveUser?: (userId: string) => void;
  currentUserId?: string;
  memberCounts?: MemberCounts;
}

export function UsersTable({
  users,
  isLoading,
  onRoleChange,
  onRemoveUser,
  currentUserId,
  memberCounts,
}: UsersTableProps) {
  const [roleChanges, setRoleChanges] = useState<Record<string, UserRole>>({});

  // Helper to check if role change should be disabled
  const isRoleChangeDisabled = (user: User, newRole: UserRole): boolean => {
    if (!memberCounts) return false;

    // Prevent demoting last owner
    if (
      user.role === "owner" &&
      memberCounts.owners === 1 &&
      newRole !== "owner"
    ) {
      return true;
    }

    // Prevent demoting last admin when no owners
    if (
      user.role === "admin" &&
      memberCounts.admins === 1 &&
      memberCounts.owners === 0 &&
      newRole === "member"
    ) {
      return true;
    }

    return false;
  };

  // Helper to check if user removal should be disabled
  const isRemovalDisabled = (user: User): boolean => {
    if (!memberCounts) return false;

    // Can't remove last member
    if (memberCounts.total === 1) return true;

    // Can't remove last owner
    if (user.role === "owner" && memberCounts.owners === 1) return true;

    // Can't remove last admin when no owners
    if (
      user.role === "admin" &&
      memberCounts.admins === 1 &&
      memberCounts.owners === 0
    )
      return true;

    return false;
  };

  // Get tooltip message for disabled actions
  const getDisabledRoleChangeMessage = (user: User): string => {
    if (!memberCounts) return "";

    if (user.role === "owner" && memberCounts.owners === 1) {
      return "Cannot demote the last owner. Promote another member to owner first.";
    }

    if (
      user.role === "admin" &&
      memberCounts.admins === 1 &&
      memberCounts.owners === 0
    ) {
      return "Cannot demote the last admin when there are no owners.";
    }

    return "";
  };

  const getDisabledRemovalMessage = (user: User): string => {
    if (!memberCounts) return "";

    if (memberCounts.total === 1) {
      return "Cannot remove the last member of the product.";
    }

    if (user.role === "owner" && memberCounts.owners === 1) {
      return "Cannot remove the last owner. Promote another member to owner first.";
    }

    if (
      user.role === "admin" &&
      memberCounts.admins === 1 &&
      memberCounts.owners === 0
    ) {
      return "Cannot remove the last admin when there are no owners.";
    }

    return "";
  };

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    setRoleChanges((prev) => ({ ...prev, [userId]: newRole }));
    onRoleChange?.(userId, newRole);
  };

  const handleRemoveUser = (userId: string) => {
    onRemoveUser?.(userId);
  };

  return (
    <Card className="bg-card border-border py-0">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 font-medium text-muted-foreground">
                  User
                </th>
                <th className="text-left p-4 font-medium text-muted-foreground">
                  Email
                </th>
                <th className="text-left p-4 font-medium text-muted-foreground">
                  Role
                </th>
                <th className="text-left p-4 font-medium text-muted-foreground">
                  Joined
                </th>
                <th className="text-right p-4 font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? // Loading skeleton rows
                  Array.from({ length: 3 }).map((_, index) => (
                    <tr
                      key={`skeleton-${index}`}
                      className="border-b border-border last:border-b-0"
                    >
                      {/* User Column Skeleton */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-8 w-8 rounded-full" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      </td>

                      {/* Email Column Skeleton */}
                      <td className="p-4">
                        <Skeleton className="h-4 w-32" />
                      </td>

                      {/* Role Column Skeleton */}
                      <td className="p-4">
                        <Skeleton className="h-8 w-32" />
                      </td>

                      {/* Joined Column Skeleton */}
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
                : users.map((user) => {
                    const isCurrentUser = user.id === currentUserId;
                    const displayRole = roleChanges[user.id] || user.role;
                    const roleChangeDisabled =
                      isCurrentUser ||
                      getDisabledRoleChangeMessage(user) !== "";
                    const removalDisabled =
                      isCurrentUser || isRemovalDisabled(user);

                    return (
                      <tr
                        key={user.id}
                        className="border-b border-border last:border-b-0"
                      >
                        {/* User Column */}
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user.avatar} alt={user.name} />
                              <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                                {user.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-foreground">
                                {user.name}
                              </span>
                              {isCurrentUser && (
                                <span className="text-xs text-muted-foreground">
                                  (You)
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Email Column */}
                        <td className="p-4">
                          <span className="text-foreground">{user.email}</span>
                        </td>

                        {/* Role Column */}
                        <td className="p-4">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="inline-flex items-center gap-2">
                                  <Select
                                    value={displayRole}
                                    onValueChange={(value: UserRole) =>
                                      handleRoleChange(user.id, value)
                                    }
                                    disabled={roleChangeDisabled}
                                  >
                                    <SelectTrigger className="w-32">
                                      <SelectValue>
                                        {getRoleLabel(displayRole)}
                                      </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                      {roleOptions.map((option) => (
                                        <SelectItem
                                          key={option.value}
                                          value={option.value}
                                          disabled={isRoleChangeDisabled(
                                            user,
                                            option.value,
                                          )}
                                        >
                                          <div className="flex flex-col">
                                            <span className="font-medium">
                                              {option.label}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                              {option.description}
                                            </span>
                                          </div>
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  {getDisabledRoleChangeMessage(user) && (
                                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                                  )}
                                </div>
                              </TooltipTrigger>
                              {getDisabledRoleChangeMessage(user) && (
                                <TooltipContent
                                  side="left"
                                  className="max-w-xs"
                                >
                                  <p>{getDisabledRoleChangeMessage(user)}</p>
                                </TooltipContent>
                              )}
                            </Tooltip>
                          </TooltipProvider>
                        </td>

                        {/* Joined Column */}
                        <td className="p-4">
                          <span className="text-foreground">
                            {user.joinedAt}
                          </span>
                        </td>

                        {/* Actions Column */}
                        <td className="p-4">
                          <div className="flex justify-end">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div>
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
                                        <DropdownMenuItem
                                          onClick={() =>
                                            handleRemoveUser(user.id)
                                          }
                                          disabled={removalDisabled}
                                          className={
                                            removalDisabled
                                              ? "opacity-50 cursor-not-allowed"
                                              : "text-destructive focus:text-destructive"
                                          }
                                        >
                                          <UserMinus className="mr-2 h-4 w-4" />
                                          Remove user
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                </TooltipTrigger>
                                {getDisabledRemovalMessage(user) && (
                                  <TooltipContent
                                    side="left"
                                    className="max-w-xs"
                                  >
                                    <p>{getDisabledRemovalMessage(user)}</p>
                                  </TooltipContent>
                                )}
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
