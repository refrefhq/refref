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
      data-testid="refref-widget-trigger"
      className={cn(
        className,
        "bg-primary text-primary-foreground",
        "shadow-lg hover:shadow-xl transition-all duration-200",
        "inline-flex items-center justify-center",
        "rounded-full",
      )}
      onClick={() => onOpenChange(true)}
      aria-label="Open referral widget"
    >
      <IconComponent className="w-4 h-4 mr-2" />
      {config.triggerText}
    </Button>
  );
}
