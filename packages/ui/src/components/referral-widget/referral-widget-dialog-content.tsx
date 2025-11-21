import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@refref/ui/components/button";
import { ShareButtons } from "@refref/ui/components/referral-widget/share-buttons";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@refref/ui/components/card";
import type { WidgetConfigType } from "@refref/types";

export interface ReferralWidgetContentProps {
  config: WidgetConfigType;
  onClose?: () => void;
}

export function ReferralWidgetContent({
  config,
  onClose,
}: ReferralWidgetContentProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(config.referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
    }
  };

  return (
    <Card className="border-0 bg-card rounded-lg">
      <CardHeader className="text-center">
        {config.logoUrl && (
          <div className="flex justify-center">
            <img
              src={config.logoUrl}
              alt={`${config.productName} logo`}
              className="h-12 w-auto"
            />
          </div>
        )}
        <CardTitle className="text-xl text-card-foreground">
          {config.title}
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          {config.subtitle}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Referral Link Section */}
        <div className="space-y-2">
          <label
            id="referral-link-label"
            className="text-sm font-medium text-muted-foreground"
          >
            Your Referral Link
          </label>
          <div className="flex gap-2 items-center">
            <code
              aria-labelledby="referral-link-label"
              className="flex-1 px-3 py-2 border rounded-md bg-muted font-mono text-sm select-all cursor-text overflow-x-auto"
              onClick={(e) => {
                const selection = window.getSelection();
                const range = document.createRange();
                range.selectNodeContents(e.currentTarget);
                selection?.removeAllRanges();
                selection?.addRange(range);
              }}
            >
              {config.referralLink}
            </code>
            <Button
              onClick={copyToClipboard}
              size="sm"
              className="bg-primary text-primary-foreground"
              aria-label={
                copied
                  ? "Copied to clipboard"
                  : "Copy referral link to clipboard"
              }
            >
              {copied ? (
                <Check className="w-4 h-4" aria-hidden="true" />
              ) : (
                <Copy className="w-4 h-4" aria-hidden="true" />
              )}
            </Button>
          </div>
        </div>

        {/* Share Buttons */}
        <div className="flex justify-center">
          <ShareButtons config={config} referralLink={config.referralLink} />
        </div>
      </CardContent>
    </Card>
  );
}
