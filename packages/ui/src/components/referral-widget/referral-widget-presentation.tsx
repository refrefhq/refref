import { Gift, Heart, Star, Zap } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@refref/ui/components/dialog";
import { ReferralWidgetContent } from "@refref/ui/components/referral-widget/referral-widget-dialog-content";
import type { WidgetConfigType } from "@refref/types";
import { ReferralWidgetDialogTrigger } from "@refref/ui/components/referral-widget/referral-widget-dialog-trigger";
import { cn } from "@refref/ui/lib/utils";

export interface ReferralWidgetPresentationProps {
  config: WidgetConfigType;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const iconMap = {
  gift: Gift,
  heart: Heart,
  star: Star,
  zap: Zap,
};

/**
 * Pure UI component for the referral widget, including FAB and Dialog wrapper.
 * Renders ReferralWidgetDialogContent inside the Dialog.
 */
export function ReferralWidgetPresentation({
  config,
  isOpen,
  onOpenChange,
}: ReferralWidgetPresentationProps) {
  const IconComponent = iconMap[config.icon as keyof typeof iconMap] || Gift;

  const getPositionStyles = () => {
    switch (config.position) {
      case "bottom-right":
        return "bottom-6 right-6";
      case "bottom-left":
        return "bottom-6 left-6";
      case "top-right":
        return "top-6 right-6";
      case "top-left":
        return "top-6 left-6";
      default:
        return "bottom-6 right-6";
    }
  };

  // Handler for the internal close button
  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <>
      {/* Floating Action Button */}
      {/* <Button
        className={clsx(
          "fixed z-50 shadow-lg hover:shadow-xl transition-all duration-200",
          getPositionStyles(),
          "inline-flex items-center justify-center"
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
      </Button> */}

      <ReferralWidgetDialogTrigger
        className={cn(getPositionStyles(), "fixed z-50")}
        config={config}
        onOpenChange={onOpenChange}
      />

      {/* Dialog Wrapper */}
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent
          className="sm:max-w-md p-0"
          style={{
            backgroundColor: config.modalBgColor,
            color: config.textColor,
            borderRadius: `${config.modalBorderRadius}px`,
            borderColor: config.modalBgColor,
          }}
        >
          <DialogTitle className="sr-only">Referral Widget</DialogTitle>
          <ReferralWidgetContent config={config} onClose={handleClose} />
        </DialogContent>
      </Dialog>
    </>
  );
}
