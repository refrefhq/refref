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
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@refref/ui/components/avatar";
import { User } from "../data";

interface RemoveUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function RemoveUserDialog({
  open,
  onOpenChange,
  user,
  onConfirm,
  isLoading = false,
}: RemoveUserDialogProps) {
  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Remove Team Member</DialogTitle>
          <DialogDescription>
            Are you sure you want to remove this user from your organization?
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* User Info */}
          <div className="flex items-center gap-3 p-4 border border-border rounded-lg">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium text-foreground">{user.name}</div>
              <div className="text-sm text-muted-foreground">{user.email}</div>
              <div className="text-xs text-muted-foreground">
                Joined {user.joinedAt}
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive">
              <strong>Warning:</strong> This user will lose access to all
              organization data and programs. They will need to be re-invited if
              you want them to rejoin later.
            </p>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
            className="min-w-[100px]"
          >
            {isLoading ? "Removing..." : "Remove User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
