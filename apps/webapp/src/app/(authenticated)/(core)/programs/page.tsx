"use client";

import { ProgramCard } from "./_components/program-card";
import { CreateProgramModalV2 } from "@/app/_components/create-program-modal";
import { api } from "@/trpc/react";
import { SiteHeader } from "@/components/site-header";
import { SiteBreadcrumbs } from "@/components/site-breadcrumbs";

export default function ProgramsPage() {
  const { data: programs, isLoading } = api.program.getAll.useQuery();

  const breadcrumbs = [{ label: "Programs", href: "/programs" }];

  return (
    <>
      <SiteHeader
        breadcrumbs={<SiteBreadcrumbs items={breadcrumbs} />}
        meta={<CreateProgramModalV2 />}
      />
      <div className="flex-1 overflow-auto">
        <div className="p-4 lg:p-6">
          <div className="max-w-4xl mx-auto space-y-4">
            {isLoading ? (
              <>
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="h-24 rounded-lg bg-muted animate-pulse"
                  />
                ))}
              </>
            ) : programs?.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium">No programs yet</h3>
                <p className="text-muted-foreground mt-1">
                  Create your first program to get started
                </p>
              </div>
            ) : (
              <>
                {programs?.map((program) => (
                  <ProgramCard
                    key={program.id}
                    program={{
                      id: program.id,
                      name: program.name,
                      status: program.status as
                        | "pending_setup"
                        | "active"
                        | "inactive",
                      createdAt: program.createdAt,
                      participantCount: program.participantCount,
                      referralCount: program.referralCount,
                    }}
                  />
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
