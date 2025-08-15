import { config } from "@refref/eslint-config/react-internal";

/** @type {import("eslint").Linter.Config} */
export default [
  ...config,
  {
    ignores: [
      // Ignore shadcn UI components (standard library components)
      "src/components/accordion.tsx",
      "src/components/alert-dialog.tsx",
      "src/components/alert.tsx",
      "src/components/aspect-ratio.tsx",
      "src/components/avatar.tsx",
      "src/components/badge.tsx",
      "src/components/breadcrumb.tsx",
      "src/components/button.tsx",
      "src/components/calendar.tsx",
      "src/components/card.tsx",
      "src/components/carousel.tsx",
      "src/components/chart.tsx",
      "src/components/checkbox.tsx",
      "src/components/collapsible.tsx",
      "src/components/command.tsx",
      "src/components/context-menu.tsx",
      "src/components/dialog.tsx",
      "src/components/drawer.tsx",
      "src/components/dropdown-menu.tsx",
      "src/components/form.tsx",
      "src/components/hover-card.tsx",
      "src/components/input-otp.tsx",
      "src/components/input.tsx",
      "src/components/label.tsx",
      "src/components/menubar.tsx",
      "src/components/navigation-menu.tsx",
      "src/components/pagination.tsx",
      "src/components/popover.tsx",
      "src/components/progress.tsx",
      "src/components/radio-group.tsx",
      "src/components/resizable.tsx",
      "src/components/scroll-area.tsx",
      "src/components/select.tsx",
      "src/components/separator.tsx",
      "src/components/sheet.tsx",
      "src/components/sidebar.tsx",
      "src/components/skeleton.tsx",
      "src/components/slider.tsx",
      "src/components/sonner.tsx",
      "src/components/sortable.tsx",
      "src/components/stepper.tsx",
      "src/components/switch.tsx",
      "src/components/table.tsx",
      "src/components/tabs.tsx",
      "src/components/textarea.tsx",
      "src/components/timeline.tsx",
      "src/components/toggle-group.tsx",
      "src/components/toggle.tsx",
      "src/components/tooltip.tsx",
      // React Aria Components variants
      "src/components/calendar-rac.tsx",
      "src/components/datefield-rac.tsx",
      // Continue to lint:
      // - src/components/data-table/* (custom data table components)
      // - src/components/referral-widget/* (custom referral widget)
      // - src/components/comp-*.tsx (custom components)
      // - src/components/faceted.tsx (custom component)
    ],
  },
];
