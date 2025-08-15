import {
  Facebook,
  Twitter,
  Linkedin,
  MessageCircle,
  Mail,
  Instagram,
  Send,
} from "lucide-react";
import { Button } from "@refref/ui/components/button";
import type { WidgetConfigType } from "@refref/types";

type SocialPlatform =
  | "facebook"
  | "twitter"
  | "linkedin"
  | "whatsapp"
  | "email"
  | "instagram"
  | "telegram";

interface PlatformConfig {
  icon: React.ComponentType<{
    className?: string;
    style?: React.CSSProperties;
  }>;
  label: string;
  color: string;
  getUrl: (link: string, message: string) => string;
}

interface ShareButtonsProps {
  config: WidgetConfigType;
  referralLink: string;
}

const platformConfig: Record<SocialPlatform, PlatformConfig> = {
  facebook: {
    icon: Facebook,
    label: "Share on Facebook",
    color: "#1877f2",
    getUrl: (link: string, message: string) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}&quote=${encodeURIComponent(message)}`,
  },
  twitter: {
    icon: Twitter,
    label: "Share on X",
    color: "#000000",
    getUrl: (link: string, message: string) =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(link)}`,
  },
  linkedin: {
    icon: Linkedin,
    label: "Share on LinkedIn",
    color: "#0077b5",
    getUrl: (link: string, message: string) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(link)}&summary=${encodeURIComponent(message)}`,
  },
  whatsapp: {
    icon: MessageCircle,
    label: "Share on WhatsApp",
    color: "#25d366",
    getUrl: (link: string, message: string) =>
      `https://wa.me/?text=${encodeURIComponent(`${message} ${link}`)}`,
  },
  email: {
    icon: Mail,
    label: "Share via Email",
    color: "#6b7280",
    getUrl: (link: string, message: string) =>
      `mailto:?subject=${encodeURIComponent(`Join me on ${message.split(" ")[3]}`)}&body=${encodeURIComponent(`${message} ${link}`)}`,
  },
  instagram: {
    icon: Instagram,
    label: "Share on Instagram",
    color: "#e4405f",
    getUrl: (link: string, message: string) => `https://www.instagram.com/`, // Instagram doesn't support direct sharing URLs
  },
  telegram: {
    icon: Send,
    label: "Share on Telegram",
    color: "#0088cc",
    getUrl: (link: string, message: string) =>
      `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(message)}`,
  },
};

export function ShareButtons({ config, referralLink }: ShareButtonsProps) {
  const shareMessage = config.shareMessage.replace(
    "{productName}",
    config.productName,
  );

  const handleShare = (platform: SocialPlatform) => {
    const platformData = platformConfig[platform];
    const url = platformData.getUrl(referralLink, shareMessage);

    if (platform === "instagram") {
      // For Instagram, we can't direct share, so copy to clipboard
      navigator.clipboard.writeText(`${shareMessage} ${referralLink}`);
      alert(
        "Link copied! You can now paste it in your Instagram story or post.",
      );
      return;
    }

    window.open(url, "_blank", "width=600,height=400");
  };

  const enabledPlatforms = Object.entries(config.enabledPlatforms)
    .filter(([_, enabled]) => enabled)
    .map(([platform]) => platform as SocialPlatform);

  return (
    <div className="grid grid-cols-2 gap-2">
      {enabledPlatforms.map((platform) => {
        const platformData = platformConfig[platform];
        const IconComponent = platformData.icon;

        return (
          <Button
            key={platform}
            variant="default"
            size="sm"
            onClick={() => handleShare(platform)}
            className="justify-start gap-2 h-10"
            style={{
              // backgroundColor: config.accentColor,
              backgroundColor: platformData.color,
              color: config.buttonTextColor,
            }}
          >
            <IconComponent className="w-4 h-4 text-white" />
            <span className="text-xs">{platformData.label}</span>
          </Button>
        );
      })}
    </div>
  );
}
