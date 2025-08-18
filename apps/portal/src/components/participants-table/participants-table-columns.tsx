import type { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@refref/ui/components/data-table/data-table-column-header";

export interface Participant {
  id: string;
  name: string | null;
  email: string | null;
  createdAt: string;
}

// example @link https://github.com/sadmann7/shadcn-table/blob/main/src/app/_components/tasks-table-columns.tsx
export function getParticipantsTableColumns(): ColumnDef<Participant>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) =>
        row.getValue("name") || (
          <span className="text-muted-foreground italic">No name</span>
        ),
      enableSorting: true,
      enableColumnFilter: true,
      meta: {
        label: "Name",
        variant: "text",
      },
    },
    {
      accessorKey: "email",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Email" />
      ),
      cell: ({ row }) =>
        row.getValue("email") || (
          <span className="text-muted-foreground italic">No email</span>
        ),
      enableSorting: true,
      enableColumnFilter: true,
      meta: {
        label: "Email",
        variant: "text",
      },
    },
    {
      accessorKey: "externalId",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="External ID" />
      ),
      cell: ({ row }) => row.getValue("externalId"),
      enableSorting: true,
      enableColumnFilter: true,
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created At" />
      ),
      cell: ({ row }) => new Date(row.getValue("createdAt")).toLocaleString(),
      enableSorting: true,
      enableColumnFilter: true,
      meta: {
        label: "Created At",
        variant: "date",
      },
    },
  ];
}
