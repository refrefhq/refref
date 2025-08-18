"use client";

import { useState } from "react";

import { api } from "@/trpc/react";

import { Button } from "@refref/ui/components/button";
import { UsersTable } from "./_components/users-table";
import { InvitationsTable } from "./_components/invitations-table";
import { InviteMemberDialog } from "./_components/invite-member-dialog";
import { RemoveUserDialog } from "./_components/remove-user-dialog";
import { CancelInvitationDialog } from "./_components/cancel-invitation-dialog";

import { User, Invitation, UserRole } from "./data";

export default function MembersPage() {
  // Dialog state handlers (UI only)
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [cancelInvitationDialogOpen, setCancelInvitationDialogOpen] =
    useState(false);
  const [userToRemove, setUserToRemove] = useState<User | null>(null);
  const [invitationToCancel, setInvitationToCancel] =
    useState<Invitation | null>(null);

  // TRPC hooks
  const utils = api.useUtils();

  const membersQuery = api.projectMembers.listMembers.useQuery();
  const invitationsQuery = api.projectMembers.listInvitations.useQuery();

  const inviteMutation = api.projectMembers.invite.useMutation({
    onSuccess: () => {
      utils.projectMembers.listInvitations.invalidate();
    },
  });

  const changeRoleMutation = api.projectMembers.changeRole.useMutation({
    onSuccess: () => utils.projectMembers.listMembers.invalidate(),
  });

  const removeMutation = api.projectMembers.remove.useMutation({
    onSuccess: () => {
      utils.projectMembers.listMembers.invalidate();
      setRemoveDialogOpen(false);
      setUserToRemove(null);
    },
  });

  const cancelInvitationMutation =
    api.projectMembers.cancelInvitation.useMutation({
      onSuccess: () => {
        utils.projectMembers.listInvitations.invalidate();
        setCancelInvitationDialogOpen(false);
        setInvitationToCancel(null);
      },
    });

  const resendInvitationMutation =
    api.projectMembers.resendInvitation.useMutation({
      onSuccess: () => utils.projectMembers.listInvitations.invalidate(),
    });

  // Get members data with proper structure
  const membersData = membersQuery.data;
  const users = (membersData?.members ?? []) as User[];
  const currentUserId = membersData?.currentUserId;
  const currentUserRole = membersData?.currentUserRole;
  const memberCounts = membersData?.counts;

  // Handler wrappers
  const handleInviteMember = async (email: string, role: UserRole) => {
    inviteMutation.mutate({ email, role });
    setInviteDialogOpen(false);
  };

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    changeRoleMutation.mutate({ userId, role: newRole });
  };

  const handleRemoveUser = (userId: string) => {
    const user = users.find((u) => u.id === userId) ?? null;
    if (user) {
      setUserToRemove(user);
      setRemoveDialogOpen(true);
    }
  };

  const handleConfirmRemoveUser = () => {
    if (userToRemove) {
      removeMutation.mutate({ userId: userToRemove.id });
    }
  };

  const handleResendInvitation = (email: string, role: UserRole) => {
    resendInvitationMutation.mutate({ email, role });
  };

  const handleCancelInvitation = (invitationId: string) => {
    const invitation =
      invitationsQuery.data?.find((inv) => inv.id === invitationId) ?? null;
    if (invitation) {
      setInvitationToCancel(invitation);
      setCancelInvitationDialogOpen(true);
    }
  };

  const handleConfirmCancelInvitation = () => {
    if (invitationToCancel) {
      cancelInvitationMutation.mutate({ id: invitationToCancel.id });
    }
  };

  // Loading states
  const isInviting = inviteMutation.isPending;
  const isRemoving = removeMutation.isPending;
  const isCancelingInvitation = cancelInvitationMutation.isPending;

  const invitations = (invitationsQuery.data ?? []) as Invitation[];

  return (
    <div className="container mx-auto max-w-7xl p-6">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-xl font-bold">Members</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your project members and settings
        </p>
      </div>

      {/* Invite Button */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Team Members ({users.length})
          </h2>
          <p className="text-sm text-muted-foreground">
            Manage who has access to your project
          </p>
        </div>
        {currentUserRole && currentUserRole !== "member" && (
          <Button onClick={() => setInviteDialogOpen(true)}>
            Invite Member
          </Button>
        )}
      </div>

      {/* Users Table */}
      <UsersTable
        users={users}
        isLoading={membersQuery.isLoading}
        onRoleChange={handleRoleChange}
        onRemoveUser={handleRemoveUser}
        currentUserId={currentUserId}
        memberCounts={memberCounts}
      />

      {/* Invitations Section */}
      <div className="mt-12 space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Pending Invitations ({" "}
            {invitations.filter((inv) => inv.status === "pending").length} )
          </h2>
          <p className="text-sm text-muted-foreground">
            Manage invitations that have been sent but not yet accepted
          </p>
        </div>

        <InvitationsTable
          invitations={invitations}
          isLoading={invitationsQuery.isLoading}
          onResendInvitation={handleResendInvitation}
          onCancelInvitation={handleCancelInvitation}
          currentUserRole={currentUserRole}
        />
      </div>

      {/* Invite Member Dialog */}
      <InviteMemberDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
        onInvite={handleInviteMember}
        isLoading={isInviting}
      />

      {/* Remove User Dialog */}
      <RemoveUserDialog
        open={removeDialogOpen}
        onOpenChange={setRemoveDialogOpen}
        user={userToRemove}
        onConfirm={handleConfirmRemoveUser}
        isLoading={isRemoving}
      />

      {/* Cancel Invitation Dialog */}
      <CancelInvitationDialog
        open={cancelInvitationDialogOpen}
        onOpenChange={setCancelInvitationDialogOpen}
        invitation={invitationToCancel}
        onConfirm={handleConfirmCancelInvitation}
        isLoading={isCancelingInvitation}
      />
    </div>
  );
}
