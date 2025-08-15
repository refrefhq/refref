import { widgetStore } from "../../lib/store";
import { ReferralWidgetPresentation } from "@refref/ui/components/referral-widget/referral-widget-presentation";
import { useCallback, useEffect, useRef } from "react";
import { useStore } from "zustand";

export function Widget() {
  const { isOpen, setIsOpen, config } = useStore(widgetStore);
  const portalContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (portalContainerRef.current) {
      // Set the portal container on the window object for the Dialog
      (window as any).__PORTAL_CONTAINER__ = portalContainerRef.current;
    }
    return () => {
      if ((window as any).__PORTAL_CONTAINER__ === portalContainerRef.current) {
        (window as any).__PORTAL_CONTAINER__ = null;
      }
    };
  }, []);

  console.log("config from widget file: ", config);

  if (!config) {
    return null;
  }

  // Map widget config to ReferralWidgetPresentation props
  const handleShare = useCallback(
    (channel: string) => {
      const shareUrl = config.referralLink;
      const shareText = config.shareMessage;
      switch (channel) {
        case "x":
        case "twitter":
          window.open(
            `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
          );
          break;
        case "linkedin":
          window.open(
            `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
          );
          break;
        case "facebook":
          window.open(
            `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
          );
          break;
        case "email":
          window.open(
            `mailto:?subject=Check this out&body=${encodeURIComponent(shareText + "\n" + shareUrl)}`,
          );
          break;
        case "copy":
          navigator.clipboard.writeText(shareUrl);
          // TODO: Show toast notification
          break;
        case "share":
          if (navigator.share) {
            navigator.share({ title: shareText, url: shareUrl });
          }
          break;
      }
    },
    [config.referralLink, config.shareMessage],
  );

  return (
    <>
      <div ref={portalContainerRef} id="widget-portal-container" />
      <ReferralWidgetPresentation
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        config={config}
      />
    </>
  );
}
