"use client";

import * as React from "react";
import { useState, useMemo } from "react";
import { api } from "@/trpc/react";
import {
  getActivityTableColumns,
  type Activity,
} from "./activity-table-columns";
import { DataTable } from "@refref/ui/components/data-table/data-table";
import { DataTableToolbar } from "@refref/ui/components/data-table/data-table-toolbar";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
} from "@tanstack/react-table";
import { Skeleton } from "@refref/ui/components/skeleton";
import { DataTableFilterMenu } from "@refref/ui/components/data-table/data-table-filter-menu";
import { DataTableSortList } from "@refref/ui/components/data-table/data-table-sort-list";
import { DataTableAdvancedToolbar } from "@refref/ui/components/data-table/data-table-advanced-toolbar";
import { useQueryState } from "nuqs";
import { getFiltersStateParser } from "@refref/ui/lib/parsers";

export function ActivityTable() {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);

  const columns = useMemo(() => getActivityTableColumns(), []);

  const [filters] = useQueryState(
    "filters",
    getFiltersStateParser(columns.map((col) => col.id as string)).withDefault(
      [],
    ),
  );

  const { data, isLoading, isError } = api.events.getAll.useQuery(
    {
      page: pageIndex + 1,
      pageSize,
      filters,
      sort: sorting[0]
        ? {
            field: sorting[0].id as "eventType" | "status" | "createdAt",
            direction: sorting[0].desc ? "desc" : "asc",
          }
        : undefined,
    },
    {
      placeholderData: (prev) => prev,
    },
  );

  const activityData: Activity[] = (data?.data ?? []).map((e: any) => ({
    ...e,
    createdAt:
      e.createdAt instanceof Date ? e.createdAt.toISOString() : e.createdAt,
    updatedAt:
      e.updatedAt instanceof Date ? e.updatedAt.toISOString() : e.updatedAt,
  }));

  const table = useReactTable<Activity>({
    data: activityData,
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
        <div className="text-destructive">Failed to load activity.</div>
      ) : (
        <DataTable table={table}></DataTable>
      )}
    </div>
  );
}
