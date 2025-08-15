import { cn } from "@refref/ui/lib/utils";
import { Button } from "@refref/ui/components/button";
import { WidgetConfigType } from "@refref/types";
import { Gift, Zap, Star, Heart } from "lucide-react";

type Props = {
  className?: string;
  config: WidgetConfigType;
  onOpenChange: (open: boolean) => void;
};

const iconMap = {
  gift: Gift,
  heart: Heart,
  star: Star,
  zap: Zap,
};

export function ReferralWidgetDialogTrigger({
  config,
  onOpenChange,
  className,
}: Props) {
  const IconComponent = iconMap[config.icon as keyof typeof iconMap] || Gift;

  return (
    <Button
      className={cn(
        className,
        "shadow-lg hover:shadow-xl transition-all duration-200",
        "inline-flex items-center justify-center",
      )}
      onClick={() => onOpenChange(true)}
      style={{
        backgroundColor: config.buttonBgColor,
        color: config.buttonTextColor,
        borderRadius: `${config.borderRadius}px`,
      }}
      aria-label="Open referral widget"
    >
      <IconComponent className="w-4 h-4 mr-2" />
      {config.triggerText}
    </Button>
  );
}
