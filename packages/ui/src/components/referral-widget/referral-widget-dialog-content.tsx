import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@refref/ui/components/button";
import { Input } from "@refref/ui/components/input";
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
    <Card
      style={{
        backgroundColor: config.modalBgColor,
        color: config.textColor,
        borderRadius: `${config.modalBorderRadius}px`,
        border: "none",
      }}
    >
      <CardHeader className="text-center">
        {config.logoUrl && (
          <div className="flex justify-center">
            <img src={config.logoUrl} alt="Logo" className="h-12 w-auto" />
          </div>
        )}
        <CardTitle className="text-xl" style={{ color: config.textColor }}>
          {config.title}
        </CardTitle>
        <CardDescription
          className="text-sm opacity-80"
          style={{ color: config.textColor }}
        >
          {config.subtitle}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Referral Link Section */}
        <div className="space-y-2">
          <label
            className="text-sm font-medium opacity-80"
            style={{ color: config.textColor }}
          >
            Your Referral Link
          </label>
          <div className="flex gap-2">
            <Input
              value={config.referralLink}
              readOnly
              className="flex-1"
              style={{
                backgroundColor: config.modalBgColor,
                borderColor: `${config.accentColor}40`,
                color: config.textColor,
              }}
            />
            <Button
              onClick={copyToClipboard}
              size="sm"
              style={{
                backgroundColor: config.accentColor,
                color: config.buttonTextColor,
              }}
            >
              {copied ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Share Buttons */}
        <div className="flex flex-col gap-2">
          <label
            className="text-sm font-medium opacity-80"
            style={{ color: config.textColor }}
          >
            Share with friends
          </label>
          <ShareButtons config={config} referralLink={config.referralLink} />
        </div>
      </CardContent>
    </Card>
  );
}
