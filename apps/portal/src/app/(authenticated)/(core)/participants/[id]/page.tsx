"use client";
import { SiteHeader } from "@/components/site-header";
import { SiteBreadcrumbs } from "@/components/site-breadcrumbs";
import { ParticipantCard } from "@/components/participant-card";
import { useParams } from "next/navigation";
import { api } from "@/trpc/react";
import { Skeleton } from "@refref/ui/components/skeleton";
import { Alert, AlertDescription } from "@refref/ui/components/alert";
import { AlertCircle } from "lucide-react";

export default function ParticipantPage() {
  const { id } = useParams();

  const {
    data: participant,
    isLoading,
    error,
  } = api.participants.getById.useQuery({
    id: id as string,
  });

  const breadcrumbs = [
    { label: "Participants", href: "/participants" },
    {
      label: participant?.name || participant?.email || "Participant",
      href: `/participants/${id}`,
    },
  ];

  if (isLoading) {
    return (
      <>
        <SiteHeader breadcrumbs={<SiteBreadcrumbs items={breadcrumbs} />} />
        <div className="flex-1 overflow-auto">
          <div className="p-4 lg:p-6 space-y-6">
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <SiteHeader breadcrumbs={<SiteBreadcrumbs items={breadcrumbs} />} />
        <div className="flex-1 overflow-auto">
          <div className="p-4 lg:p-6 space-y-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to load participant data. {error.message}
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </>
    );
  }

  if (!participant) {
    return (
      <>
        <SiteHeader breadcrumbs={<SiteBreadcrumbs items={breadcrumbs} />} />
        <div className="flex-1 overflow-auto">
          <div className="p-4 lg:p-6 space-y-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Participant not found.</AlertDescription>
            </Alert>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SiteHeader breadcrumbs={<SiteBreadcrumbs items={breadcrumbs} />} />
      <div className="flex-1 overflow-auto">
        <div className="p-4 lg:p-6 space-y-6">
          <ParticipantCard participant={participant} />
        </div>
      </div>
    </>
  );
}
