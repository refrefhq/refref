import {
  FaFacebookF,
  FaXTwitter,
  FaLinkedinIn,
  FaWhatsapp,
  FaInstagram,
  FaTelegram,
  FaEnvelope,
} from "react-icons/fa6";
import { Button } from "@refref/ui/components/button";
import type { WidgetConfigType } from "@refref/types";
import type { IconType } from "react-icons";

type SocialPlatform =
  | "facebook"
  | "twitter"
  | "linkedin"
  | "whatsapp"
  | "email"
  | "instagram"
  | "telegram";

interface PlatformConfig {
  Icon: IconType;
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
    Icon: FaFacebookF,
    label: "Share on Facebook",
    color: "#1877F2",
    getUrl: (link: string, message: string) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}&quote=${encodeURIComponent(message)}`,
  },
  twitter: {
    Icon: FaXTwitter,
    label: "Share on X",
    color: "#000000",
    getUrl: (link: string, message: string) =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(link)}`,
  },
  linkedin: {
    Icon: FaLinkedinIn,
    label: "Share on LinkedIn",
    color: "#0A66C2",
    getUrl: (link: string, message: string) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(link)}&summary=${encodeURIComponent(message)}`,
  },
  whatsapp: {
    Icon: FaWhatsapp,
    label: "Share on WhatsApp",
    color: "#25D366",
    getUrl: (link: string, message: string) =>
      `https://wa.me/?text=${encodeURIComponent(`${message} ${link}`)}`,
  },
  email: {
    Icon: FaEnvelope,
    label: "Share via Email",
    color: "#6B7280",
    getUrl: (link: string, message: string) =>
      `mailto:?subject=${encodeURIComponent(`Join me on ${message.split(" ")[3]}`)}&body=${encodeURIComponent(`${message} ${link}`)}`,
  },
  instagram: {
    Icon: FaInstagram,
    label: "Share on Instagram",
    color: "#E4405F",
    getUrl: (link: string, message: string) => `https://www.instagram.com/`,
  },
  telegram: {
    Icon: FaTelegram,
    label: "Share on Telegram",
    color: "#26A5E4",
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
    <div className="flex flex-wrap gap-2">
      {enabledPlatforms.map((platform) => {
        const platformData = platformConfig[platform];
        const IconComponent = platformData.Icon;

        return (
          <Button
            key={platform}
            variant="ghost"
            size="icon"
            onClick={() => handleShare(platform)}
            className="size-10 rounded-lg hover:scale-110 transition-all duration-200 hover:shadow-lg"
            aria-label={platformData.label}
            title={platformData.label}
            style={{
              backgroundColor: platformData.color,
            }}
          >
            <IconComponent className="w-5 h-5 text-white" />
          </Button>
        );
      })}
    </div>
  );
}
