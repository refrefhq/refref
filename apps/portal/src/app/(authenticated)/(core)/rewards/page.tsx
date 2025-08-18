"use client";

import { SiteHeader } from "@/components/site-header";
import { SiteBreadcrumbs } from "@/components/site-breadcrumbs";
import { RewardsTable } from "@/components/rewards-table/rewards-table";

export default function RewardsPage() {
  const breadcrumbs = [{ label: "Rewards", href: "/rewards" }];

  return (
    <>
      <SiteHeader breadcrumbs={<SiteBreadcrumbs items={breadcrumbs} />} />
      <div className="flex-1 overflow-auto">
        <div className="p-4 lg:p-6 space-y-6">
          <RewardsTable />
        </div>
      </div>
    </>
  );
}
