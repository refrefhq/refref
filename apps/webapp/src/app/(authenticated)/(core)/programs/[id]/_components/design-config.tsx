import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@refref/ui/components/card";
import { Label } from "@refref/ui/components/label";
import { Input } from "@refref/ui/components/input";
import { Textarea } from "@refref/ui/components/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@refref/ui/components/select";
import { Switch } from "@refref/ui/components/switch";
import { Slider } from "@refref/ui/components/slider";
import { Separator } from "@refref/ui/components/separator";
import { Button } from "@refref/ui/components/button";
import { PreviewPane } from "@/components/preview-pane";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import type { WidgetConfigType } from "@refref/types";
import React from "react";
import { ReferralWidgetContent } from "@refref/ui/components/referral-widget/referral-widget-dialog-content";
import { ReferralWidgetDialogTrigger } from "@refref/ui/components/referral-widget/referral-widget-dialog-trigger";

interface DesignConfigProps {
  programId: string;
  onStepComplete?: () => void;
}

// Default widget configuration
const defaultWidgetConfig: WidgetConfigType = {
  position: "bottom-right",
  triggerText: "Refer & Earn",
  buttonBgColor: "#3b82f6",
  buttonTextColor: "#ffffff",
  borderRadius: 25,
  icon: "gift",
  title: "Invite your friends",
  subtitle: "Share your referral link and earn rewards when your friends join!",
  logoUrl: "",
  modalBgColor: "#ffffff",
  accentColor: "#3b82f6",
  textColor: "#1f2937",
  modalBorderRadius: 12,
  shareMessage: "Join me on {productName} and get a reward!",
  enabledPlatforms: {
    facebook: true,
    twitter: true,
    linkedin: true,
    whatsapp: true,
    email: true,
    instagram: false,
    telegram: false,
  },
  referralLink: "https://yourapp.com/ref/user123",
  productName: "YourSaaS",
};

export function DesignConfig({ programId, onStepComplete }: DesignConfigProps) {
  // State for preview pane
  const [showPreview, setShowPreview] = useState(true);
  const [widgetConfig, setWidgetConfig] =
    useState<WidgetConfigType>(defaultWidgetConfig);

  const { data: program } = api.program.getById.useQuery(programId);

  const updateConfig = api.program.updateConfig.useMutation({
    onSuccess: () => {
      toast.success("Design configuration saved successfully");
      onStepComplete?.();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Update widget config when program data changes
  React.useEffect(() => {
    if (program?.config?.widgetConfig) {
      setWidgetConfig({
        ...defaultWidgetConfig,
        ...program.config.widgetConfig,
      });
    }
  }, [program?.config?.widgetConfig]);

  const updateWidgetConfig = (updates: Partial<WidgetConfigType>) => {
    setWidgetConfig({ ...widgetConfig, ...updates });
  };

  const updatePlatform = (
    platform: keyof WidgetConfigType["enabledPlatforms"],
    enabled: boolean,
  ) => {
    setWidgetConfig({
      ...widgetConfig,
      enabledPlatforms: {
        ...widgetConfig.enabledPlatforms,
        [platform]: enabled,
      },
    });
  };

  const handleSave = () => {
    updateConfig.mutate({
      id: programId,
      config: {
        ...program!.config!,
        widgetConfig: widgetConfig,
      },
    });
  };

  return (
    <>
      <div className="py-4 border-b px-4 lg:px-6 flex items-center justify-between">
        <h2 className="text-lg font-bold">Style & Widget Configuration</h2>
        <Button onClick={handleSave} disabled={updateConfig.isPending}>
          {updateConfig.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>
      <div className="flex-1 grid grid-cols-2 gap-6 pl-4 lg:pl-6">
        <div className="py-6 space-y-6 overflow-y-auto">
          {/* Widget Button Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Widget Button</CardTitle>
              <CardDescription>
                Customize the floating button appearance and position
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Select
                  value={widgetConfig.position}
                  onValueChange={(value: WidgetConfigType["position"]) =>
                    updateWidgetConfig({ position: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="top-left">Top Left</SelectItem>
                    <SelectItem value="top-right">Top Right</SelectItem>
                    <SelectItem value="bottom-left">Bottom Left</SelectItem>
                    <SelectItem value="bottom-right">Bottom Right</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="triggerText">Button Text</Label>
                <Input
                  id="triggerText"
                  value={widgetConfig.triggerText}
                  onChange={(e) =>
                    updateWidgetConfig({ triggerText: e.target.value })
                  }
                  placeholder="Refer & Earn"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="icon">Icon</Label>
                <Select
                  value={widgetConfig.icon}
                  onValueChange={(value) =>
                    updateWidgetConfig({
                      icon: value as WidgetConfigType["icon"],
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gift">Gift</SelectItem>
                    <SelectItem value="heart">Heart</SelectItem>
                    <SelectItem value="star">Star</SelectItem>
                    <SelectItem value="zap">Zap</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="buttonBgColor">Background Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="buttonBgColor"
                      type="color"
                      value={widgetConfig.buttonBgColor}
                      onChange={(e) =>
                        updateWidgetConfig({ buttonBgColor: e.target.value })
                      }
                      className="w-12 h-10 p-1 border rounded"
                    />
                    <Input
                      value={widgetConfig.buttonBgColor}
                      onChange={(e) =>
                        updateWidgetConfig({ buttonBgColor: e.target.value })
                      }
                      placeholder="#3b82f6"
                      className="text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="buttonTextColor">Text Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="buttonTextColor"
                      type="color"
                      value={widgetConfig.buttonTextColor}
                      onChange={(e) =>
                        updateWidgetConfig({ buttonTextColor: e.target.value })
                      }
                      className="w-12 h-10 p-1 border rounded"
                    />
                    <Input
                      value={widgetConfig.buttonTextColor}
                      onChange={(e) =>
                        updateWidgetConfig({ buttonTextColor: e.target.value })
                      }
                      placeholder="#ffffff"
                      className="text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Border Radius: {widgetConfig.borderRadius}px</Label>
                <Slider
                  value={[widgetConfig.borderRadius]}
                  onValueChange={([value]) =>
                    updateWidgetConfig({ borderRadius: value })
                  }
                  max={50}
                  min={0}
                  step={1}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>

          {/* Modal Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Modal Content</CardTitle>
              <CardDescription>
                Customize the referral modal appearance and content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Modal Title</Label>
                <Input
                  id="title"
                  value={widgetConfig.title}
                  onChange={(e) =>
                    updateWidgetConfig({ title: e.target.value })
                  }
                  placeholder="Invite your friends"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subtitle">Subtitle</Label>
                <Textarea
                  id="subtitle"
                  value={widgetConfig.subtitle}
                  onChange={(e) =>
                    updateWidgetConfig({ subtitle: e.target.value })
                  }
                  placeholder="Share your referral link and earn rewards..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="logoUrl">Logo URL</Label>
                <Input
                  id="logoUrl"
                  value={widgetConfig.logoUrl}
                  onChange={(e) =>
                    updateWidgetConfig({ logoUrl: e.target.value })
                  }
                  placeholder="https://example.com/logo.png"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="modalBgColor">Background Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="modalBgColor"
                      type="color"
                      value={widgetConfig.modalBgColor}
                      onChange={(e) =>
                        updateWidgetConfig({ modalBgColor: e.target.value })
                      }
                      className="w-12 h-10 p-1 border rounded"
                    />
                    <Input
                      value={widgetConfig.modalBgColor}
                      onChange={(e) =>
                        updateWidgetConfig({ modalBgColor: e.target.value })
                      }
                      placeholder="#ffffff"
                      className="text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accentColor">Accent Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="accentColor"
                      type="color"
                      value={widgetConfig.accentColor}
                      onChange={(e) =>
                        updateWidgetConfig({ accentColor: e.target.value })
                      }
                      className="w-12 h-10 p-1 border rounded"
                    />
                    <Input
                      value={widgetConfig.accentColor}
                      onChange={(e) =>
                        updateWidgetConfig({ accentColor: e.target.value })
                      }
                      placeholder="#3b82f6"
                      className="text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="textColor">Text Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="textColor"
                    type="color"
                    value={widgetConfig.textColor}
                    onChange={(e) =>
                      updateWidgetConfig({ textColor: e.target.value })
                    }
                    className="w-12 h-10 p-1 border rounded"
                  />
                  <Input
                    value={widgetConfig.textColor}
                    onChange={(e) =>
                      updateWidgetConfig({ textColor: e.target.value })
                    }
                    placeholder="#1f2937"
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>
                  Modal Border Radius: {widgetConfig.modalBorderRadius}px
                </Label>
                <Slider
                  value={[widgetConfig.modalBorderRadius]}
                  onValueChange={([value]) =>
                    updateWidgetConfig({ modalBorderRadius: value })
                  }
                  max={24}
                  min={0}
                  step={1}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>

          {/* Sharing Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Sharing Options</CardTitle>
              <CardDescription>
                Configure sharing platforms and messages
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="shareMessage">Share Message</Label>
                <Textarea
                  id="shareMessage"
                  value={widgetConfig.shareMessage}
                  onChange={(e) =>
                    updateWidgetConfig({ shareMessage: e.target.value })
                  }
                  placeholder="Join me on {productName} and get a reward!"
                  rows={2}
                />
                <p className="text-xs text-muted-foreground">
                  Use {"{productName}"} as a placeholder for your product name
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="productName">Product Name</Label>
                <Input
                  id="productName"
                  value={widgetConfig.productName}
                  onChange={(e) =>
                    updateWidgetConfig({ productName: e.target.value })
                  }
                  placeholder="YourSaaS"
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <Label className="text-base font-medium">
                  Enabled Platforms
                </Label>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(widgetConfig.enabledPlatforms).map(
                    ([platform, enabled]) => (
                      <div
                        key={platform}
                        className="flex items-center space-x-2"
                      >
                        <Switch
                          id={platform}
                          checked={enabled}
                          onCheckedChange={(checked) =>
                            updatePlatform(
                              platform as keyof WidgetConfigType["enabledPlatforms"],
                              checked,
                            )
                          }
                        />
                        <Label
                          htmlFor={platform}
                          className="capitalize text-sm"
                        >
                          {platform === "twitter" ? "X/Twitter" : platform}
                        </Label>
                      </div>
                    ),
                  )}
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="referralLink">Sample Referral Link</Label>
                <Input
                  id="referralLink"
                  value={widgetConfig.referralLink}
                  onChange={(e) =>
                    updateWidgetConfig({ referralLink: e.target.value })
                  }
                  placeholder="https://yourapp.com/ref/user123"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="h-full">
          <PreviewPane
            isOpen={showPreview}
            onClose={() => setShowPreview(false)}
            className="w-full h-full"
          >
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold mb-2">Modal Preview</h2>
              <p className="text-sm text-muted-foreground">
                See how your modal will look in real-time
              </p>
            </div>
            <ReferralWidgetContent config={widgetConfig} />

            <div className="text-center mt-6">
              <h2 className="text-xl font-semibold mb-2">
                Floating Widget Preview
              </h2>
              <p className="text-sm text-muted-foreground">
                See how your floating widget will look in real-time
              </p>
              <ReferralWidgetDialogTrigger
                className="mx-auto mt-4"
                config={widgetConfig}
                onOpenChange={() => {}}
              />
            </div>
          </PreviewPane>
        </div>
      </div>
    </>
  );
}
