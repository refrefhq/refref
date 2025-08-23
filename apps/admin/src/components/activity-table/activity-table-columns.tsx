import { createColumnHelper } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@refref/ui/components/data-table/data-table-column-header";
import { MoreHorizontal, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { Button } from "@refref/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@refref/ui/components/dropdown-menu";
import { api } from "@/trpc/react";
import { toast } from "sonner";

export interface Activity {
  id: string;
  projectId: string;
  programId: string | null;
  programName: string | null;
  participantId: string | null;
  participantEmail: string | null;
  participantExternalId: string | null;
  participantName: string | null;
  referralId: string | null;
  eventType: string | null;
  eventName: string | null;
  status: string;
  metadata: any;
  ipHash: string | null;
  visitorFingerprint: string | null;
  deduplicationKey: string | null;
  createdAt: string;
  updatedAt: string;
}

const columnHelper = createColumnHelper<Activity>();

export function getActivityTableColumns() {
  return [
    columnHelper.accessor("eventType", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Event Type" />
      ),
      cell: ({ getValue }) => getValue() || "-",
      enableSorting: true,
      enableColumnFilter: true,
      meta: {
        label: "Event Type",
        variant: "text",
      },
    }),
    columnHelper.accessor("eventName", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Event Name" />
      ),
      cell: ({ getValue }) => getValue() || "-",
      enableSorting: false,
      enableColumnFilter: true,
      meta: {
        label: "Event Name",
        variant: "text",
      },
    }),
    columnHelper.accessor("status", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ getValue }) => {
        const status = getValue();
        const statusColors: Record<string, string> = {
          pending: "text-yellow-600",
          processed: "text-green-600",
          failed: "text-red-600",
        };
        return <span className={statusColors[status] || ""}>{status}</span>;
      },
      enableSorting: true,
      enableColumnFilter: true,
      meta: {
        label: "Status",
        variant: "text",
      },
    }),
    columnHelper.accessor("participantEmail", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Participant" />
      ),
      cell: ({ getValue, row }) => {
        const email = getValue();
        const name = row.original.participantName;
        const externalId = row.original.participantExternalId;

        if (email) {
          return (
            <div>
              <div>{email}</div>
              {name && (
                <div className="text-sm text-muted-foreground">{name}</div>
              )}
            </div>
          );
        } else if (externalId) {
          return (
            <div>
              <div className="text-sm text-muted-foreground">
                ID: {externalId}
              </div>
            </div>
          );
        }
        return "-";
      },
      enableSorting: false,
      enableColumnFilter: true,
      meta: {
        label: "Participant Email",
        variant: "text",
      },
    }),
    columnHelper.accessor("programName", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Program" />
      ),
      cell: ({ getValue }) => getValue() || "-",
      enableSorting: false,
      enableColumnFilter: true,
      meta: {
        label: "Program",
        variant: "text",
      },
    }),
    columnHelper.accessor("referralId", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Referral ID" />
      ),
      cell: ({ getValue }) => {
        const referralId = getValue();
        return referralId ? <code className="text-xs">{referralId}</code> : "-";
      },
      enableSorting: false,
      enableColumnFilter: true,
      meta: {
        label: "Referral ID",
        variant: "text",
      },
    }),
    columnHelper.accessor("metadata", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Metadata" />
      ),
      cell: ({ getValue }) => {
        const metadata = getValue();
        if (!metadata || Object.keys(metadata).length === 0) return "-";

        const displayItems = [];
        if (metadata.orderAmount) {
          displayItems.push(`Amount: $${metadata.orderAmount}`);
        }
        if (metadata.source) {
          displayItems.push(`Source: ${metadata.source}`);
        }
        if (metadata.schemaVersion) {
          displayItems.push(`v${metadata.schemaVersion}`);
        }

        return (
          <div className="text-sm text-muted-foreground">
            {displayItems.join(" • ") ||
              JSON.stringify(metadata).substring(0, 50) + "..."}
          </div>
        );
      },
      enableSorting: false,
      enableColumnFilter: false,
    }),
    columnHelper.accessor("createdAt", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created At" />
      ),
      cell: ({ getValue }) => new Date(getValue()).toLocaleString(),
      enableSorting: true,
      enableColumnFilter: true,
      meta: {
        label: "Created At",
        variant: "date",
      },
    }),
    columnHelper.display({
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const activity = row.original;
        const utils = api.useUtils();

        const { mutate: updateStatus, isPending: isUpdatingStatus } =
          api.events.updateStatus.useMutation({
            onSuccess: (data) => {
              if (data) {
                toast.success(
                  `Event ${data.id} status updated to ${data.status}`,
                );
              }
              utils.events.getAll.invalidate();
            },
            onError: (error) => {
              toast.error(
                `Failed to update status: ${error.message || "Unknown error"}`,
              );
            },
          });

        const canProcess = activity.status === "pending";
        const canRetry = activity.status === "failed";

        return (
          <div className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {canProcess && (
                  <DropdownMenuItem
                    onClick={() =>
                      updateStatus({
                        eventId: activity.id,
                        status: "processed",
                      })
                    }
                    disabled={isUpdatingStatus}
                  >
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    Mark as Processed
                  </DropdownMenuItem>
                )}
                {canRetry && (
                  <DropdownMenuItem
                    onClick={() =>
                      updateStatus({
                        eventId: activity.id,
                        status: "pending",
                      })
                    }
                    disabled={isUpdatingStatus}
                  >
                    <RefreshCw className="mr-2 h-4 w-4 text-blue-500" />
                    Retry Processing
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() =>
                    updateStatus({
                      eventId: activity.id,
                      status: "failed",
                    })
                  }
                  disabled={isUpdatingStatus}
                >
                  <XCircle className="mr-2 h-4 w-4 text-red-500" />
                  Mark as Failed
                </DropdownMenuItem>
                {!canProcess &&
                  !canRetry &&
                  activity.status === "processed" && (
                    <DropdownMenuItem disabled>
                      No actions available
                    </DropdownMenuItem>
                  )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
      enableSorting: false,
      enableColumnFilter: false,
    }),
  ];
}
