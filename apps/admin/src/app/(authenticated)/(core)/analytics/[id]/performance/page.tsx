"use client";
import * as React from "react";
import { SiteBreadcrumbs } from "@/components/site-breadcrumbs";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@refref/ui/components/card";
import { Badge } from "@refref/ui/components/badge";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { SiteHeader } from "@/components/site-header";
import { TrendingUpIcon, TrendingDownIcon } from "lucide-react";
import { DateRangePickerWithPresets } from "@/components/date-range-picker-with-presets";
import {
  today,
  getLocalTimeZone,
  type DateValue,
} from "@internationalized/date";
import { Avatar, AvatarFallback } from "@refref/ui/components/avatar";
import { ProgramSelector } from "@/components/program-selector";
import { api } from "@/trpc/react";
import { useParams } from "next/navigation";

// --- Components ---
function StatCard({
  label,
  value,
  trend,
  trendDirection,
  description,
  trendText,
}: {
  label: string;
  value: string;
  trend: string;
  trendDirection: "up" | "down";
  description: string;
  trendText: string;
}) {
  const TrendIcon = trendDirection === "up" ? TrendingUpIcon : TrendingDownIcon;
  const badgeColor =
    trendDirection === "up"
      ? "text-green-600 border-green-600"
      : "text-red-600 border-red-600";
  return (
    <Card className="@container/card">
      <CardHeader className="relative">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
          {value}
        </CardTitle>
        <div className="absolute right-4 top-4">
          <Badge
            variant="outline"
            className={`flex gap-1 rounded-lg text-xs ${badgeColor}`}
          >
            <TrendIcon className="size-3" />
            {trend}
          </Badge>
        </div>
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1 text-sm">
        <div className="line-clamp-1 flex gap-2 font-medium">
          {trendText} <TrendIcon className="size-4" />
        </div>
        <div className="text-muted-foreground">{description}</div>
      </CardFooter>
    </Card>
  );
}

function TopReferrersList({
  participants,
  loading,
}: {
  participants?: Array<{
    id: string;
    name: string;
    email: string;
    referralCount: number;
  }>;
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="space-y-8">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center">
            <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
            <div className="ml-4 space-y-1 flex-1">
              <div className="h-4 w-32 bg-muted animate-pulse rounded" />
              <div className="h-3 w-48 bg-muted animate-pulse rounded" />
            </div>
            <div className="h-4 w-20 bg-muted animate-pulse rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (!participants || participants.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No participants yet
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {participants.map((participant) => {
        const initials = participant.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2);

        return (
          <div key={participant.id} className="flex items-center">
            <Avatar className="h-9 w-9">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="ml-4 space-y-1">
              <p className="text-sm font-medium leading-none">
                {participant.name}
              </p>
              <p className="text-sm text-muted-foreground">
                {participant.email}
              </p>
            </div>
            <div className="ml-auto font-medium">
              {participant.referralCount}{" "}
              {participant.referralCount === 1 ? "Referral" : "Referrals"}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function AnalyticsPerformancePage() {
  const params = useParams();
  const programId = params.id as string;

  // Initialize with last 30 days
  const now = today(getLocalTimeZone());
  const [dateRange, setDateRange] = React.useState<{
    start: DateValue | null;
    end: DateValue | null;
  }>({
    start: now.subtract({ days: 29 }),
    end: now,
  });

  const { data: programs } = api.program.getAll.useQuery();
  const currentProgram = programs?.find((p) => p.id === programId);

  // Fetch real analytics data
  const { data: stats, isLoading: statsLoading } =
    api.analytics.getStats.useQuery(programId, { enabled: !!programId });

  const { data: timeSeriesData, isLoading: chartLoading } =
    api.analytics.getTimeSeriesData.useQuery(
      {
        programId,
        startDate: dateRange.start?.toString(),
        endDate: dateRange.end?.toString(),
      },
      { enabled: !!programId && !!dateRange.start && !!dateRange.end },
    );

  const { data: topParticipants, isLoading: participantsLoading } =
    api.analytics.getTopParticipants.useQuery(programId, {
      enabled: !!programId,
    });

  // Header meta with program selector and date range picker
  const meta = (
    <div className="flex items-center gap-2">
      <ProgramSelector />
      <DateRangePickerWithPresets value={dateRange} onChange={setDateRange} />
    </div>
  );

  const breadcrumbs = [
    { label: "Analytics", href: "/analytics" },
    { label: currentProgram?.name || "Loading..." },
    { label: "Performance" },
  ];

  return (
    <>
      {/* Header with breadcrumbs, program dropdown, and date picker */}
      <SiteHeader
        breadcrumbs={<SiteBreadcrumbs items={breadcrumbs} />}
        meta={meta}
      />

      <main className="p-6 space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {statsLoading ? (
            <>
              <div className="h-32 rounded-lg bg-muted animate-pulse" />
              <div className="h-32 rounded-lg bg-muted animate-pulse" />
            </>
          ) : stats ? (
            <>
              <StatCard
                label="Referrals"
                value={stats.referrals.total.toLocaleString()}
                trend={`${stats.referrals.trend >= 0 ? "+" : ""}${stats.referrals.trend.toFixed(1)}%`}
                trendDirection={stats.referrals.trendDirection as "up" | "down"}
                description="Referrals for the last 30 days"
                trendText={`Trending ${stats.referrals.trendDirection} this month`}
              />
              <StatCard
                label="Participants"
                value={stats.participants.total.toLocaleString()}
                trend={`${stats.participants.trend >= 0 ? "+" : ""}${stats.participants.trend.toFixed(1)}%`}
                trendDirection={
                  stats.participants.trendDirection as "up" | "down"
                }
                description="Participants for the last 30 days"
                trendText={`Trending ${stats.participants.trendDirection} this month`}
              />
            </>
          ) : null}
        </div>

        {/* Chart and Top Referrers Row */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ChartAreaInteractive
              data={timeSeriesData}
              loading={chartLoading}
            />
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Top Participants</CardTitle>
            </CardHeader>
            <CardContent>
              <TopReferrersList
                participants={topParticipants}
                loading={participantsLoading}
              />
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
