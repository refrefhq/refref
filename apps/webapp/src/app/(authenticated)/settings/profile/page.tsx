"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Avatar, AvatarFallback } from "@refref/ui/components/avatar";
import { Button } from "@refref/ui/components/button";
import { Card, CardContent } from "@refref/ui/components/card";
import { Input } from "@refref/ui/components/input";
import { Label } from "@refref/ui/components/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@refref/ui/components/alert-dialog";
import { api } from "@/trpc/react";
import { toast } from "sonner";

export default function ProfileSettings() {
  const { data: user, isLoading, refetch } = api.user.getProfile.useQuery();
  const { data: canLeaveProduct } = api.user.canLeaveProduct.useQuery();
  const updateProfileMutation = api.user.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("Profile updated successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update profile");
    },
  });
  const leaveProductMutation = api.user.leaveProduct.useMutation({
    onSuccess: () => {
      toast.success("Successfully left the product");
      // Redirect to onboarding or dashboard
      window.location.href = "/";
    },
    onError: (error) => {
      toast.error(error.message || "Failed to leave product");
    },
  });

  const [email, setEmail] = useState(user?.email || "");
  const [fullName, setFullName] = useState(user?.name || "");

  // Update local state when user data loads
  useEffect(() => {
    if (user) {
      setEmail(user.email);
      setFullName(user.name);
    }
  }, [user]);

  const handleSave = () => {
    if (!email || !fullName) {
      toast.error("Please fill in all fields");
      return;
    }

    updateProfileMutation.mutate({
      email,
      name: fullName,
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-xl font-bold">Profile</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage your profile information and account settings
          </p>
        </div>
        <div className="space-y-6">
          <Card>
            <CardContent className="space-y-4 p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-10 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-xl font-bold">Profile</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Manage your profile information and account settings
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardContent className="space-y-4">
            {/* Profile Picture Section */}
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium text-foreground">
                Profile picture
              </Label>
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-orange-500 text-white font-medium">
                  {user?.image ? (
                    <Image
                      src={user.image}
                      alt={user.name}
                      width={48}
                      height={48}
                    />
                  ) : (
                    getInitials(user?.name || "User")
                  )}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="border-t border-border" />

            {/* Email Section */}
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-base font-medium text-foreground"
              >
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                // onChange={(e) => setEmail(e.target.value)}
                className="bg-background border-border text-foreground"
                disabled={true}
              />
            </div>

            <div className="border-t border-border" />

            {/* Full Name Section */}
            <div className="space-y-2">
              <Label
                htmlFor="fullname"
                className="text-base font-medium text-foreground"
              >
                Full name
              </Label>
              <Input
                id="fullname"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="bg-background border-border text-foreground"
                disabled={updateProfileMutation.isPending}
              />
            </div>

            <div className="border-t border-border" />

            {/* Save Button */}
            <div className="flex justify-end">
              <Button
                onClick={handleSave}
                disabled={updateProfileMutation.isPending}
              >
                {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Workspace Access Section */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            Product access
          </h2>

          <Card>
            <CardContent className="">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-medium text-foreground">
                    Remove yourself from product
                  </h3>
                  {canLeaveProduct && !canLeaveProduct.canLeave && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {canLeaveProduct.reason}
                    </p>
                  )}
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      disabled={
                        !canLeaveProduct?.canLeave ||
                        leaveProductMutation.isPending
                      }
                    >
                      {leaveProductMutation.isPending
                        ? "Leaving..."
                        : "Leave Product"}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Leave Product</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to leave this product? You will
                        lose access to all product data and settings. This
                        action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => leaveProductMutation.mutate()}
                        disabled={leaveProductMutation.isPending}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {leaveProductMutation.isPending
                          ? "Leaving..."
                          : "Leave Product"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
