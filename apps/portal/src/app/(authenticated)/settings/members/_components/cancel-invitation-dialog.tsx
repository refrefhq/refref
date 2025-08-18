"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@refref/ui/components/dialog";
import { Button } from "@refref/ui/components/button";
import { Mail, User } from "lucide-react";
import { Invitation, getRoleLabel } from "../data";

interface CancelInvitationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invitation: Invitation | null;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function CancelInvitationDialog({
  open,
  onOpenChange,
  invitation,
  onConfirm,
  isLoading = false,
}: CancelInvitationDialogProps) {
  if (!invitation) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cancel Invitation</DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel this invitation? The user will no
            longer be able to accept it.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Invitation Info */}
          <div className="p-4 border border-border rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-primary/10 rounded-full">
                <Mail className="h-4 w-4 text-primary" />
              </div>
              <div>
                <div className="font-medium text-foreground">
                  {invitation.email}
                </div>
                <div className="text-sm text-muted-foreground">
                  Invited as {getRoleLabel(invitation.role)}
                </div>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <User className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">
                  Invited by:{" "}
                  <span className="text-foreground">
                    {invitation.invitedBy}
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">
                  Expires:{" "}
                  <span className="text-foreground">
                    {invitation.expiresAt}
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive">
              <strong>Note:</strong> If you cancel this invitation, you'll need
              to send a new one if you want to invite this person again.
            </p>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Keep Invitation
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
            className="min-w-[100px]"
          >
            {isLoading ? "Canceling..." : "Cancel Invitation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
