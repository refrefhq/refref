import { useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@refref/ui/components/card";
import { Label } from "@refref/ui/components/label";
import { Input } from "@refref/ui/components/input";
import { Switch } from "@refref/ui/components/switch";
import { Textarea } from "@refref/ui/components/textarea";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { useForm } from "@tanstack/react-form";
import { StickySaveBarRelative } from "@/components/sticky-save-bar";
import { defaultNotificationConfig } from "@/lib/forms/notification-config-schema";

interface NotificationSetupProps {
  programId: string;
  onStepComplete?: () => void;
}

export function NotificationSetup({
  programId,
  onStepComplete,
}: NotificationSetupProps) {
  // Fetch current program to get the existing config
  const { data: program } = api.program.getById.useQuery(programId);

  const updateConfig = api.program.updateConfig.useMutation({
    onSuccess: () => {
      toast.success("Notification settings saved successfully");
      form.reset();
      onStepComplete?.();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Form setup with @tanstack/react-form
  const form = useForm({
    defaultValues: {
      notificationConfig: defaultNotificationConfig,
    },
    onSubmit: async ({ value }) => {
      if (!program?.config) {
        toast.error("Program configuration not found");
        return;
      }

      // Update the notification config while preserving the rest of the config
      await updateConfig.mutateAsync({
        id: programId,
        config: {
          ...program.config,
          notification: value.notificationConfig as any,
        },
      });
    },
  });

  // Update form when program data changes
  useEffect(() => {
    if (program?.config?.notification) {
      form.setFieldValue("notificationConfig", {
        ...defaultNotificationConfig,
        ...program.config.notification,
      });
    }
  }, [program?.config?.notification, form]);

  // Helper function to update nested notification config
  const updateNotificationConfig = (path: string[], value: any) => {
    const currentConfig = form.getFieldValue("notificationConfig");
    let updated = { ...currentConfig };
    let current: any = updated;

    for (let i = 0; i < path.length - 1; i++) {
      const key = path[i];
      if (key) {
        current[key] = { ...current[key] };
        current = current[key];
      }
    }
    const lastKey = path[path.length - 1];
    if (lastKey) {
      current[lastKey] = value;
    }

    form.setFieldValue("notificationConfig", updated);
  };

  // Get current notification config from form
  const notificationConfig = form.state.values.notificationConfig;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>
                Configure email notifications for your referral program
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Welcome Email</Label>
                    <p className="text-sm text-muted-foreground">
                      Send a welcome email to new referrers
                    </p>
                  </div>
                  <Switch
                    checked={notificationConfig.welcomeEmail.enabled}
                    onCheckedChange={(checked) =>
                      updateNotificationConfig(["welcomeEmail", "enabled"], checked)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Welcome Email Subject</Label>
                  <Input
                    placeholder="Welcome to our referral program!"
                    value={notificationConfig.welcomeEmail.subject}
                    onChange={(e) =>
                      updateNotificationConfig(["welcomeEmail", "subject"], e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Welcome Email Template</Label>
                  <Textarea
                    placeholder="Write your welcome email content here..."
                    className="min-h-[100px]"
                    value={notificationConfig.welcomeEmail.template}
                    onChange={(e) =>
                      updateNotificationConfig(["welcomeEmail", "template"], e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="space-y-4 mt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Referral Success Email</Label>
                    <p className="text-sm text-muted-foreground">
                      Send an email when a referral is successful
                    </p>
                  </div>
                  <Switch
                    checked={notificationConfig.successEmail.enabled}
                    onCheckedChange={(checked) =>
                      updateNotificationConfig(["successEmail", "enabled"], checked)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Success Email Subject</Label>
                  <Input
                    placeholder="Congratulations on your successful referral!"
                    value={notificationConfig.successEmail.subject}
                    onChange={(e) =>
                      updateNotificationConfig(["successEmail", "subject"], e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Success Email Template</Label>
                  <Textarea
                    placeholder="Write your success email content here..."
                    className="min-h-[100px]"
                    value={notificationConfig.successEmail.template}
                    onChange={(e) =>
                      updateNotificationConfig(["successEmail", "template"], e.target.value)
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>In-App Notifications</CardTitle>
              <CardDescription>
                Configure notifications that appear within your application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Referral Progress Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Show notifications for referral status changes
                  </p>
                </div>
                <Switch
                  checked={notificationConfig.inApp.progressUpdates}
                  onCheckedChange={(checked) =>
                    updateNotificationConfig(["inApp", "progressUpdates"], checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Reward Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Show notifications when rewards are earned
                  </p>
                </div>
                <Switch
                  checked={notificationConfig.inApp.rewardNotifications}
                  onCheckedChange={(checked) =>
                    updateNotificationConfig(["inApp", "rewardNotifications"], checked)
                  }
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Sticky Save Bar */}
      <form.Subscribe selector={(state) => state.isDirty}>
        {(isDirty) => (
          <StickySaveBarRelative
            isDirty={isDirty}
            onSave={() => form.handleSubmit()}
            onDiscard={() => form.reset()}
            isSaving={updateConfig.isPending}
            saveText="Save notification settings"
            message="You have unsaved notification settings"
          />
        )}
      </form.Subscribe>
    </div>
  );
}
