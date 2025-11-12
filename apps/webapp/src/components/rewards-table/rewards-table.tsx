"use client";

import * as React from "react";
import { useState, useMemo } from "react";
import { api } from "@/trpc/react";
import { getRewardsTableColumns, type Reward } from "./rewards-table-columns"; // Adjusted import
import { DataTable } from "@refref/ui/components/data-table/data-table";
import { DataTableToolbar } from "@refref/ui/components/data-table/data-table-toolbar";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState, // Corrected import for SortingState
} from "@tanstack/react-table";
import { Skeleton } from "@refref/ui/components/skeleton";
import { DataTableFilterMenu } from "@refref/ui/components/data-table/data-table-filter-menu";
import { DataTableSortList } from "@refref/ui/components/data-table/data-table-sort-list";
import { DataTableAdvancedToolbar } from "@refref/ui/components/data-table/data-table-advanced-toolbar";
import { useQueryState } from "nuqs";
import { getFiltersStateParser } from "@refref/ui/lib/parsers";

export function RewardsTable() {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true }, // Default sort
  ]);

  const columns = useMemo(() => getRewardsTableColumns(), []);

  const [filters] = useQueryState(
    "filters", // URL query param for filters
    getFiltersStateParser(columns.map((col) => col.id as string)).withDefault(
      [],
    ),
  );

  const { data, isLoading, isError } = api.rewards.getAll.useQuery(
    {
      page: pageIndex + 1,
      pageSize,
      filters, // Pass filters from URL state
      sort: sorting[0]
        ? {
            field: sorting[0].id as  // Type assertion for sort field
              | "rewardType"
              | "amount"
              | "currency"
              | "status"
              | "createdAt"
              | "disbursedAt",
            direction: sorting[0].desc ? "desc" : "asc",
          }
        : undefined,
    },
    {
      placeholderData: (prev) => prev, // Keep previous data while loading new
    },
  );

  // Ensure data types are consistent for the table (e.g., dates to strings)
  const rewardsData: Reward[] = (data?.data ?? []).map((r: any) => ({
    ...r,
    amount: r.amount?.toString() ?? null, // Ensure amount is string or null
    disbursedAt:
      r.disbursedAt instanceof Date
        ? r.disbursedAt.toISOString()
        : r.disbursedAt,
    createdAt:
      r.createdAt instanceof Date ? r.createdAt.toISOString() : r.createdAt,
  }));

  const table = useReactTable<Reward>({
    data: rewardsData,
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
      <DataTableAdvancedToolbar table={table}>
        <DataTableSortList table={table} align="start" />
        <DataTableFilterMenu table={table} />
      </DataTableAdvancedToolbar>
      {isLoading && !data ? (
        <Skeleton className="h-64 w-full" />
      ) : isError ? (
        <div className="text-destructive">Failed to load rewards.</div>
      ) : (
        <DataTable table={table}></DataTable>
      )}
    </div>
  );
}
