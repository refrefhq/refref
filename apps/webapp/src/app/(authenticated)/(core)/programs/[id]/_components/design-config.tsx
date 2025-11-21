import { useState, useEffect } from "react";
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
import { PreviewPane } from "@/components/preview-pane";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import type { WidgetConfigType, ProgramConfigV1Type } from "@refref/types";
import React from "react";
import { ReferralWidgetContent } from "@refref/ui/components/referral-widget/referral-widget-dialog-content";
import { ReferralWidgetDialogTrigger } from "@refref/ui/components/referral-widget/referral-widget-dialog-trigger";
import { StickySaveBarRelative } from "@/components/sticky-save-bar";
import { ColorPicker } from "@/components/theme/color-picker";

interface DesignConfigProps {
  programId: string;
  onStepComplete?: () => void;
}

// Default widget configuration
const defaultWidgetConfig: WidgetConfigType = {
  position: "bottom-right",
  triggerText: "Refer & Earn",
  icon: "gift",
  title: "Invite your friends",
  subtitle: "Share your referral link and earn rewards when your friends join!",
  logoUrl: "",
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
  referralLink: "https://i.refref.ai/<ref_code>",
  productName: "YourSaaS",
};

export function DesignConfig({ programId, onStepComplete }: DesignConfigProps) {
  // State for preview pane
  const [showPreview, setShowPreview] = useState(true);

  // Local state for widget config
  const [widgetConfig, setWidgetConfig] =
    useState<WidgetConfigType>(defaultWidgetConfig);
  const [initialConfig, setInitialConfig] =
    useState<WidgetConfigType>(defaultWidgetConfig);

  // State for landing page URL (from brandConfig)
  const [landingPageUrl, setLandingPageUrl] = useState("");
  const [initialLandingPageUrl, setInitialLandingPageUrl] = useState("");

  // State for theme colors
  const [themeColors, setThemeColors] = useState({
    primary: "#a995c9",
    primaryForeground: "#1a1823",
    secondary: "#5a5370",
    secondaryForeground: "#e0ddef",
    muted: "#f5f5f5",
    mutedForeground: "#737373",
  });
  const [initialThemeColors, setInitialThemeColors] = useState({
    primary: "#a995c9",
    primaryForeground: "#1a1823",
    secondary: "#5a5370",
    secondaryForeground: "#e0ddef",
    muted: "#f5f5f5",
    mutedForeground: "#737373",
  });

  const { data: program } = api.program.getById.useQuery(programId);

  const updateConfig = api.program.updateConfig.useMutation({
    onSuccess: () => {
      toast.success("Design configuration saved successfully");
      setInitialConfig(widgetConfig); // Update initial config after save
      setInitialLandingPageUrl(landingPageUrl); // Update initial landing page URL
      onStepComplete?.();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Update widget config and landing page URL when program data changes
  useEffect(() => {
    if (program?.config) {
      // Update widget config
      if (program.config.widgetConfig) {
        const newConfig = {
          ...defaultWidgetConfig,
          ...program.config.widgetConfig,
          // Use default referralLink if saved one is empty
          referralLink:
            program.config.widgetConfig.referralLink ||
            defaultWidgetConfig.referralLink,
        };
        setWidgetConfig(newConfig);
        setInitialConfig(newConfig);

        // Load theme colors from cssVariables if they exist
        if (newConfig.cssVariables) {
          const loadedColors = {
            primary: newConfig.cssVariables["--primary"] || themeColors.primary,
            primaryForeground:
              newConfig.cssVariables["--primary-foreground"] ||
              themeColors.primaryForeground,
            secondary:
              newConfig.cssVariables["--secondary"] || themeColors.secondary,
            secondaryForeground:
              newConfig.cssVariables["--secondary-foreground"] ||
              themeColors.secondaryForeground,
            muted: newConfig.cssVariables["--muted"] || themeColors.muted,
            mutedForeground:
              newConfig.cssVariables["--muted-foreground"] ||
              themeColors.mutedForeground,
          };
          setThemeColors(loadedColors);
          setInitialThemeColors(loadedColors);
        }
      }

      // Update landing page URL from brandConfig
      const config = program.config as ProgramConfigV1Type;
      if (config.brandConfig?.landingPageUrl) {
        setLandingPageUrl(config.brandConfig.landingPageUrl);
        setInitialLandingPageUrl(config.brandConfig.landingPageUrl);
      }
    }
  }, [program?.config]);

  const updateWidgetConfig = (updates: Partial<WidgetConfigType>) => {
    setWidgetConfig((current) => ({ ...current, ...updates }));
  };

  const updatePlatform = (
    platform: keyof WidgetConfigType["enabledPlatforms"],
    enabled: boolean,
  ) => {
    setWidgetConfig((current) => ({
      ...current,
      enabledPlatforms: {
        ...current.enabledPlatforms,
        [platform]: enabled,
      },
    }));
  };

  // Check if form is dirty
  const isDirty =
    JSON.stringify(widgetConfig) !== JSON.stringify(initialConfig) ||
    landingPageUrl !== initialLandingPageUrl ||
    JSON.stringify(themeColors) !== JSON.stringify(initialThemeColors);

  const handleSave = async () => {
    if (!program?.config) {
      toast.error("Program configuration not found");
      return;
    }

    const currentConfig = program.config as ProgramConfigV1Type;

    // Convert theme colors to CSS variables format
    const cssVariables = {
      "--primary": themeColors.primary,
      "--primary-foreground": themeColors.primaryForeground,
      "--secondary": themeColors.secondary,
      "--secondary-foreground": themeColors.secondaryForeground,
      "--muted": themeColors.muted,
      "--muted-foreground": themeColors.mutedForeground,
    };

    await updateConfig.mutateAsync({
      id: programId,
      config: {
        ...currentConfig,
        widgetConfig: {
          ...widgetConfig,
          cssVariables,
        },
        brandConfig: {
          primaryColor: currentConfig.brandConfig?.primaryColor || "#3b82f6",
          landingPageUrl: landingPageUrl,
        },
      },
    });
  };

  const handleDiscard = () => {
    setWidgetConfig(initialConfig);
    setLandingPageUrl(initialLandingPageUrl);
    setThemeColors(initialThemeColors);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 px-4 lg:px-6 overflow-hidden">
        <div className="py-6 space-y-6 overflow-y-auto">
          {/* Theme Colors */}
          <Card>
            <CardHeader>
              <CardTitle>Theme</CardTitle>
              <CardDescription>
                Customize your widget's color scheme
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Primary Colors */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold">Primary Colors</h4>
                <ColorPicker
                  label="Primary"
                  color={themeColors.primary}
                  onChange={(color) =>
                    setThemeColors((prev) => ({ ...prev, primary: color }))
                  }
                />
                <ColorPicker
                  label="Primary Foreground"
                  color={themeColors.primaryForeground}
                  onChange={(color) =>
                    setThemeColors((prev) => ({
                      ...prev,
                      primaryForeground: color,
                    }))
                  }
                />
              </div>

              <Separator />

              {/* Secondary Colors */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold">Secondary Colors</h4>
                <ColorPicker
                  label="Secondary"
                  color={themeColors.secondary}
                  onChange={(color) =>
                    setThemeColors((prev) => ({ ...prev, secondary: color }))
                  }
                />
                <ColorPicker
                  label="Secondary Foreground"
                  color={themeColors.secondaryForeground}
                  onChange={(color) =>
                    setThemeColors((prev) => ({
                      ...prev,
                      secondaryForeground: color,
                    }))
                  }
                />
              </div>

              <Separator />

              {/* Muted Colors */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold">Muted Colors</h4>
                <ColorPicker
                  label="Muted"
                  color={themeColors.muted}
                  onChange={(color) =>
                    setThemeColors((prev) => ({ ...prev, muted: color }))
                  }
                />
                <ColorPicker
                  label="Muted Foreground"
                  color={themeColors.mutedForeground}
                  onChange={(color) =>
                    setThemeColors((prev) => ({
                      ...prev,
                      mutedForeground: color,
                    }))
                  }
                />
              </div>
            </CardContent>
          </Card>

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
                <Label htmlFor="landingPageUrl">Landing Page URL</Label>
                <Input
                  id="landingPageUrl"
                  type="url"
                  value={landingPageUrl}
                  onChange={(e) => setLandingPageUrl(e.target.value)}
                  placeholder="https://example.com/landing"
                />
                <p className="text-xs text-muted-foreground">
                  Users who click referral links will be redirected to this URL
                </p>
              </div>

              <Separator />

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
                  readOnly
                  className="text-muted-foreground cursor-default"
                  placeholder="https://i.refref.ai/<ref_code>"
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
            <div
              style={
                {
                  "--primary": themeColors.primary,
                  "--primary-foreground": themeColors.primaryForeground,
                  "--secondary": themeColors.secondary,
                  "--secondary-foreground": themeColors.secondaryForeground,
                  "--muted": themeColors.muted,
                  "--muted-foreground": themeColors.mutedForeground,
                } as React.CSSProperties
              }
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
            </div>
          </PreviewPane>
        </div>
      </div>

      {/* Sticky Save Bar */}
      <StickySaveBarRelative
        isDirty={isDirty}
        onSave={handleSave}
        onDiscard={handleDiscard}
        isSaving={updateConfig.isPending}
        saveText="Save design changes"
        message="You have unsaved design changes"
      />
    </div>
  );
}
