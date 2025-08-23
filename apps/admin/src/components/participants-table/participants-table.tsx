"use client";

import * as React from "react";
import { useState, useMemo } from "react";
import { api } from "@/trpc/react";
import {
  getParticipantsTableColumns,
  Participant,
} from "./participants-table-columns";
import { DataTable } from "@refref/ui/components/data-table/data-table";
import { DataTableToolbar } from "@refref/ui/components/data-table/data-table-toolbar";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
} from "@tanstack/react-table";
import { Input } from "@refref/ui/components/input";
import { Skeleton } from "@refref/ui/components/skeleton";
import { DataTableFilterMenu } from "@refref/ui/components/data-table/data-table-filter-menu";
import { DataTableSortList } from "@refref/ui/components/data-table/data-table-sort-list";
import { DataTableAdvancedToolbar } from "@refref/ui/components/data-table/data-table-advanced-toolbar";
import { useQueryState } from "nuqs";
import { getFiltersStateParser } from "@refref/ui/lib/parsers";

export function ParticipantsTable() {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);

  const columns = useMemo(() => getParticipantsTableColumns(), []);

  // Read filters from URL (as managed by DataTableFilterMenu)
  const [filters] = useQueryState(
    "filters",
    getFiltersStateParser(columns.map((col) => col.id as string)).withDefault(
      [],
    ),
  );

  // Fetch data from TRPC
  const { data, isLoading, isError } = api.participants.getAll.useQuery(
    {
      page: pageIndex + 1,
      pageSize,
      filters, // <-- pass the array directly
      sort: sorting[0]
        ? {
            field: sorting[0].id as "name" | "email" | "createdAt",
            direction: sorting[0].desc ? "desc" : "asc",
          }
        : undefined,
    },
    {
      placeholderData: (prev) => prev,
    },
  );

  // Map data to ensure createdAt is a string
  const participants: Participant[] = (data?.data ?? []).map((p) => ({
    ...p,
    createdAt:
      typeof p.createdAt === "string" ? p.createdAt : p.createdAt.toISOString(),
  }));

  const table = useReactTable<Participant>({
    data: participants,
    columns,
    pageCount: data ? Math.ceil(data.total / pageSize) : -1,
    state: {
      pagination: { pageIndex, pageSize },
      sorting,
    },
    manualPagination: true,
    manualSorting: true,
    onPaginationChange: (updater) => {
      const next =
        typeof updater === "function"
          ? updater({ pageIndex, pageSize })
          : updater;
      setPageIndex(next.pageIndex);
      setPageSize(next.pageSize);
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <DataTableAdvancedToolbar table={table}>
          <DataTableSortList table={table} align="start" />
          <DataTableFilterMenu table={table} />
        </DataTableAdvancedToolbar>
      </div>
      {isLoading && !data ? (
        <Skeleton className="h-64 w-full" />
      ) : isError ? (
        <div className="text-destructive">Failed to load participants.</div>
      ) : (
        <DataTable table={table}></DataTable>
      )}
    </div>
  );
}
