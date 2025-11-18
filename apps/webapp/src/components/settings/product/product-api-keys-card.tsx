"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { Button } from "@refref/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@refref/ui/components/card";
import { Key, Plus, Trash2, KeyRound } from "lucide-react";
import { CreateApiKeyDialog } from "./create-api-key-dialog";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@refref/ui/components/alert-dialog";
import { DateDisplay } from "@/components/date-display";

export function ProductApiKeysCard() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [keyToDelete, setKeyToDelete] = useState<string | null>(null);

  const { data: apiKeys, isLoading } = api.apiKeys.list.useQuery();
  const utils = api.useUtils();

  const revokeKeyMutation = api.apiKeys.revoke.useMutation({
    onSuccess: () => {
      toast.success("API key revoked successfully");
      utils.apiKeys.list.invalidate();
      setKeyToDelete(null);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to revoke API key");
    },
  });

  const handleRevoke = async () => {
    if (!keyToDelete) return;
    await revokeKeyMutation.mutateAsync({ keyId: keyToDelete });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            API Keys
          </CardTitle>
          <CardDescription>Loading API keys...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                API Keys
              </CardTitle>
              <CardDescription>
                Manage API keys for authenticating API requests. These are
                different from OAuth client credentials.
              </CardDescription>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Create Key
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!apiKeys || apiKeys.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Key className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground mb-4">
                No API keys found. Create your first API key to get started.
              </p>
              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                variant="outline"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Key
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {apiKeys.map((key) => (
                <Card
                  key={key.id}
                  className="flex-row items-center gap-3 truncate px-4 py-3"
                >
                  <KeyRound className="size-4 flex-shrink-0" />
                  <div className="flex flex-col truncate">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-semibold text-sm">
                        {key.name || "Unnamed"}
                      </span>
                      <span className="flex-1 truncate text-muted-foreground text-sm">
                        {key.start}
                        {"******"}
                      </span>
                    </div>
                    <div className="truncate text-muted-foreground text-xs">
                      {key.expiresAt ? (
                        <>
                          Expires <DateDisplay date={key.expiresAt} />
                        </>
                      ) : (
                        "Never expires"
                      )}
                    </div>
                  </div>
                  <Button
                    className="ms-auto"
                    size="sm"
                    variant="outline"
                    onClick={() => setKeyToDelete(key.id)}
                  >
                    Delete
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <CreateApiKeyDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />

      <AlertDialog
        open={!!keyToDelete}
        onOpenChange={() => setKeyToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke API Key</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to revoke this API key? This action cannot
              be undone and any applications using this key will lose access
              immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setKeyToDelete(null)}
              disabled={revokeKeyMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleRevoke}
              disabled={revokeKeyMutation.isPending}
            >
              Revoke Key
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
