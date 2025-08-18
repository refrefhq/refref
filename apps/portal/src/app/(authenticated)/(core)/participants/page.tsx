"use client";

import { SiteHeader } from "@/components/site-header";
import { SiteBreadcrumbs } from "@/components/site-breadcrumbs";
import { ParticipantsTable } from "@/components/participants-table/participants-table";

export default function ParticipantsPage() {
  const breadcrumbs = [{ label: "Participants", href: "/participants" }];

  return (
    <>
      <SiteHeader breadcrumbs={<SiteBreadcrumbs items={breadcrumbs} />} />
      <div className="flex-1 overflow-auto">
        <div className="p-4 lg:p-6 space-y-6">
          <ParticipantsTable />
        </div>
      </div>
    </>
  );
}
