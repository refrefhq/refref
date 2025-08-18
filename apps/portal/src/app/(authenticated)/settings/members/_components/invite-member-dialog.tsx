"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@refref/ui/components/dialog";
import { Button } from "@refref/ui/components/button";
import { Input } from "@refref/ui/components/input";
import { Label } from "@refref/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@refref/ui/components/select";
import { UserRole, roleOptions } from "../data";

interface InviteMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInvite: (email: string, role: UserRole) => void;
  isLoading?: boolean;
}

export function InviteMemberDialog({
  open,
  onOpenChange,
  onInvite,
  isLoading = false,
}: InviteMemberDialogProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("member");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() && role) {
      onInvite(email.trim(), role);
    }
  };

  const handleClose = () => {
    setEmail("");
    setRole("member");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite Team Member</DialogTitle>
          <DialogDescription>
            Send an invitation to join your organization.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="member@example.com"
              required
              disabled={isLoading}
            />
          </div>

          {/* Role Selection */}
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select
              value={role}
              onValueChange={(value: UserRole) => setRole(value)}
            >
              <SelectTrigger>
                <span>
                  {roleOptions.find((option) => option.value === role)?.label ||
                    role}
                </span>
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map((roleOption) => (
                  <SelectItem key={roleOption.value} value={roleOption.value}>
                    <div className="flex flex-col">
                      <span className="font-medium">{roleOption.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {roleOption.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !email.trim()}
              className="min-w-[120px]"
            >
              {isLoading ? "Sending..." : "Send Invitation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
