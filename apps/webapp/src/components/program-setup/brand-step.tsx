"use client";
import React, { forwardRef, useImperativeHandle, useState } from "react";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@refref/ui/components/card";
import { Label } from "@refref/ui/components/label";
import { Input } from "@refref/ui/components/input";
import { Palette } from "lucide-react";

// Form schema for brand configuration
export const brandStepSchema = z.object({
  landingPageUrl: z.string().url({
    message: "Please enter a valid URL",
  }),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color"),
});

export type BrandStepData = z.infer<typeof brandStepSchema>;

interface BrandStepProps {
  programId: string;
}

export const BrandStep = forwardRef<
  { submitForm: () => Promise<BrandStepData> },
  BrandStepProps
>(({ programId }, ref) => {
  const [landingPageUrl, setLandingPageUrl] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#3b82f6");

  useImperativeHandle(ref, () => ({
    submitForm: async () => {
      // Validate landing page URL
      try {
        new URL(landingPageUrl);
      } catch {
        throw new Error("Please enter a valid URL for the landing page");
      }

      // Validate hex color format
      if (!/^#[0-9A-Fa-f]{6}$/.test(primaryColor)) {
        throw new Error("Please enter a valid hex color");
      }

      return {
        landingPageUrl: landingPageUrl,
        primaryColor: primaryColor,
      };
    },
  }));

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Brand Configuration
          </CardTitle>
          <CardDescription>
            Configure where referred users land and your brand settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="landingPageUrl">Landing Page URL</Label>
            <div className="space-y-2">
              <Input
                id="landingPageUrl"
                type="url"
                value={landingPageUrl}
                onChange={(e) => setLandingPageUrl(e.target.value)}
                placeholder="https://example.com/landing"
                className="w-full"
                data-testid="landing-page-url"
              />
              <p className="text-sm text-muted-foreground">
                Users who click referral links will be redirected to this URL
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="primaryColor">Primary Brand Color</Label>
            <div className="flex gap-3 items-center">
              <Input
                id="primaryColor"
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-20 h-12 p-1 border rounded cursor-pointer"
                data-testid="brand-color-picker"
              />
              <Input
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                placeholder="#3b82f6"
                className="w-32 font-mono"
                data-testid="brand-color-hex"
              />
              <span className="text-sm text-muted-foreground">
                This color will be used for buttons, links, and accents
                throughout your referral widget
              </span>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            <p className="font-medium mb-1">Tips for choosing a color:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Use your main brand color for consistency</li>
              <li>Ensure good contrast with white text</li>
              <li>Test the color on both light and dark backgrounds</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

BrandStep.displayName = "BrandStep";
