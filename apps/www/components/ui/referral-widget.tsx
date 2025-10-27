"use client";

import { useState } from "react";
import { Check, Copy, Mail, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function ReferralWidget() {
  const [copied, setCopied] = useState(false);
  const referralLink = "acme.refref.ai/r/th5tdf";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center justify-center min-h-[400px] bg-black p-4">
      <Card className="w-full max-w-md bg-black border border-zinc-800 text-gray-100">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold text-white">
            Refer & Earn
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Share with friends and colleagues
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg bg-zinc-900 p-6 text-center border border-zinc-800 relative overflow-hidden">
            <div className="absolute -right-2 -top-2 text-4xl rotate-12 opacity-80">
              💸
            </div>
            <div className="absolute -left-2 -bottom-2 text-4xl -rotate-12 opacity-80">
              ✨
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Get $50 💰</h3>
            <p className="text-zinc-300 mb-1">for each successful referral</p>
            <p className="text-emerald-400 text-sm font-medium">
              No limit on earnings!
            </p>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="referral-link"
              className="text-sm font-medium text-zinc-300"
            >
              Your personal referral link
            </label>
            <div className="flex">
              <Input
                id="referral-link"
                value={referralLink}
                readOnly
                className="rounded-r-none bg-zinc-900 border-zinc-800 text-zinc-200"
              />
              <Button
                onClick={copyToClipboard}
                variant="secondary"
                className="rounded-l-none border border-l-0 border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-200"
                aria-label="Copy referral link"
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t border-zinc-800 pt-4">
          <div className="flex justify-center w-full gap-4">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-200"
            >
              <svg
                className="h-4 w-4"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
              </svg>
              <span className="sr-only">Share on X</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-200"
            >
              <svg
                className="h-4 w-4"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"></path>
              </svg>
              <span className="sr-only">Share on LinkedIn</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-200"
            >
              <Mail className="h-4 w-4" />
              <span className="sr-only">Share via Email</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-200"
            >
              <Share2 className="h-4 w-4" />
              <span className="sr-only">More sharing options</span>
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
