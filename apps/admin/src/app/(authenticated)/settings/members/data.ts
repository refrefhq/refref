export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  joinedAt: string;
  avatar?: string;
}

export interface Invitation {
  id: string;
  email: string;
  role: UserRole;
  invitedBy: string;
  invitedAt: string;
  expiresAt: string;
  status: "pending" | "accepted" | "expired";
}

export type UserRole = "admin" | "member" | "owner";

export interface RoleOption {
  value: UserRole;
  label: string;
  description: string;
}

export const roleOptions: RoleOption[] = [
  {
    value: "admin",
    label: "Admin",
    description: "Can manage all settings and invite members",
  },
  {
    value: "member",
    label: "Member",
    description: "Can create and manage referral programs",
  },
  {
    value: "owner",
    label: "Owner",
    description: "Full access to all features and settings",
  },
];

export const getRoleLabel = (role: UserRole): string => {
  return roleOptions.find((option) => option.value === role)?.label || role;
};

export const getRoleDescription = (role: UserRole): string => {
  return roleOptions.find((option) => option.value === role)?.description || "";
};

export const getInvitationStatusColor = (status: Invitation["status"]) => {
  switch (status) {
    case "pending":
      return "text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20";
    case "accepted":
      return "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20";
    case "expired":
      return "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20";
    default:
      return "text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20";
  }
};
