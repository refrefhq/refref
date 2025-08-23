"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@refref/ui/components/card";
import { Badge } from "@refref/ui/components/badge";
import { Button } from "@refref/ui/components/button";
import { Avatar, AvatarFallback } from "@refref/ui/components/avatar";

import {
  Copy,
  ExternalLink,
  Users,
  Activity,
  Calendar,
  Mail,
  User,
  Hash,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ParticipantCardProps {
  participant: {
    id: string;
    name: string | null;
    email: string | null;
    externalId: string | null;
    createdAt: string | Date;
    referralLink?: {
      id: string;
      slug: string;
    } | null;
    referralCount: number;
    eventsCount: number;
    recentReferrals: Array<{
      id: string;
      name: string | null;
      email: string | null;
      externalId: string;
      createdAt: string | Date;
    }>;
  };
}

export function ParticipantCard({ participant }: ParticipantCardProps) {
  const [copied, setCopied] = useState(false);

  const getInitials = (name: string | null, email: string | null) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return "??";
  };

  const copyReferralLink = async () => {
    if (!participant.referralLink || typeof window === "undefined") return;

    const baseUrl = window.location.origin;
    const referralUrl = `${baseUrl}/r/${participant.referralLink.slug}`;

    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      toast.success("Referral link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy referral link");
    }
  };

  const openReferralLink = () => {
    if (!participant.referralLink || typeof window === "undefined") return;

    const baseUrl = window.location.origin;
    const referralUrl = `${baseUrl}/r/${participant.referralLink.slug}`;
    window.open(referralUrl, "_blank");
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const referralUrl =
    participant.referralLink && typeof window !== "undefined"
      ? `${window.location.origin}/r/${participant.referralLink.slug}`
      : null;

  return (
    <div className="space-y-6">
      {/* Main Participant Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-lg">
                  {getInitials(participant.name, participant.email)}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">
                  {participant.name || "Unnamed Participant"}
                </CardTitle>
                <CardDescription className="text-base">
                  {participant.email || "No email provided"}
                </CardDescription>
                {participant.externalId && (
                  <div className="flex items-center gap-2 mt-1">
                    <Hash className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      ID: {participant.externalId}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-sm">
                <Calendar className="w-3 h-3 mr-1" />
                Joined {formatDate(participant.createdAt)}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
              <div className="p-2 rounded-full bg-blue-100">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {participant.referralCount}
                </p>
                <p className="text-sm text-muted-foreground">Referrals</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
              <div className="p-2 rounded-full bg-green-100">
                <Activity className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{participant.eventsCount}</p>
                <p className="text-sm text-muted-foreground">Events</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
              <div className="p-2 rounded-full bg-purple-100">
                <User className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {participant.recentReferrals.length}
                </p>
                <p className="text-sm text-muted-foreground">Recent</p>
              </div>
            </div>
          </div>

          {/* Referral Link Section */}
          {referralUrl && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-semibold">Referral Link</h3>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-lg border bg-muted/50">
                <code className="flex-1 text-sm break-all">{referralUrl}</code>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyReferralLink}
                    className="shrink-0"
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={openReferralLink}
                    className="shrink-0"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Open
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Recent Referrals */}
          {participant.recentReferrals.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-semibold">Recent Referrals</h3>
              </div>
              <div className="space-y-2">
                {participant.recentReferrals.map((referral) => (
                  <div
                    key={referral.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {getInitials(referral.name, referral.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {referral.name || referral.email || "Unnamed"}
                        </p>
                        {referral.email && (
                          <p className="text-sm text-muted-foreground">
                            {referral.email}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        {formatDate(referral.createdAt)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ID: {referral.externalId}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {participant.recentReferrals.length === 0 &&
            participant.referralCount === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">No referrals yet</p>
                <p className="text-sm">
                  This participant hasn't made any referrals yet.
                </p>
              </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
