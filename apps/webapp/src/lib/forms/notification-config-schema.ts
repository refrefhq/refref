import { z } from "zod";

export const notificationConfigSchema = z.object({
  welcomeEmail: z.object({
    enabled: z.boolean(),
    subject: z.string(),
    template: z.string(),
  }),
  successEmail: z.object({
    enabled: z.boolean(),
    subject: z.string(),
    template: z.string(),
  }),
  inApp: z.object({
    progressUpdates: z.boolean(),
    rewardNotifications: z.boolean(),
  }),
});

export type NotificationConfigType = z.infer<typeof notificationConfigSchema>;

export const defaultNotificationConfig: NotificationConfigType = {
  welcomeEmail: {
    enabled: false,
    subject: "",
    template: "",
  },
  successEmail: {
    enabled: false,
    subject: "",
    template: "",
  },
  inApp: {
    progressUpdates: false,
    rewardNotifications: false,
  },
};