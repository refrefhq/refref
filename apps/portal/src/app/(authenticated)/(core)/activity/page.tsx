"use client";

import { SiteHeader } from "@/components/site-header";
import { SiteBreadcrumbs } from "@/components/site-breadcrumbs";
import { ActivityTable } from "@/components/activity-table/activity-table";

export default function ActivityPage() {
  const breadcrumbs = [{ label: "Activity", href: "/activity" }];

  return (
    <>
      <SiteHeader breadcrumbs={<SiteBreadcrumbs items={breadcrumbs} />} />
      <div className="flex-1 overflow-auto">
        <div className="p-4 lg:p-6 space-y-6">
          <ActivityTable />
        </div>
      </div>
    </>
  );
}
