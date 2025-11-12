import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@refref/ui/components/card";
import { Label } from "@refref/ui/components/label";
import { Input } from "@refref/ui/components/input";
import { Button } from "@refref/ui/components/button";
import { Switch } from "@refref/ui/components/switch";
import { Textarea } from "@refref/ui/components/textarea";
import { api } from "@/trpc/react";
import { toast } from "sonner";

interface NotificationSetupProps {
  programId: string;
  onStepComplete?: () => void;
}

export function NotificationSetup({
  programId,
  onStepComplete,
}: NotificationSetupProps) {
  const [notificationConfig, setNotificationConfig] = useState({
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
  });

  // Fetch current program to get the existing config
  const { data: program } = api.program.getById.useQuery(programId);

  const updateConfig = api.program.updateConfig.useMutation({
    onSuccess: () => {
      toast.success("Notification settings saved successfully");
      onStepComplete?.();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSave = () => {
    if (!program?.config) {
      toast.error("Program configuration not found");
      return;
    }

    // Update the notification config while preserving the rest of the config
    updateConfig.mutate({
      id: programId,
      config: {
        ...program.config,
      },
    });
  };

  return (
    <>
      <div className="py-4 border-b px-4 lg:px-6 flex items-center justify-between sticky top-0">
        <h2 className="text-lg font-bold">Notification Setup</h2>
        <Button onClick={handleSave} disabled={updateConfig.isPending}>
          {updateConfig.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>
      <div className="flex-1 p-4 lg:p-6">
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
                      setNotificationConfig((prev) => ({
                        ...prev,
                        welcomeEmail: {
                          ...prev.welcomeEmail,
                          enabled: checked,
                        },
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Welcome Email Subject</Label>
                  <Input
                    placeholder="Welcome to our referral program!"
                    value={notificationConfig.welcomeEmail.subject}
                    onChange={(e) =>
                      setNotificationConfig((prev) => ({
                        ...prev,
                        welcomeEmail: {
                          ...prev.welcomeEmail,
                          subject: e.target.value,
                        },
                      }))
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
                      setNotificationConfig((prev) => ({
                        ...prev,
                        welcomeEmail: {
                          ...prev.welcomeEmail,
                          template: e.target.value,
                        },
                      }))
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
                      setNotificationConfig((prev) => ({
                        ...prev,
                        successEmail: {
                          ...prev.successEmail,
                          enabled: checked,
                        },
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Success Email Subject</Label>
                  <Input
                    placeholder="Congratulations on your successful referral!"
                    value={notificationConfig.successEmail.subject}
                    onChange={(e) =>
                      setNotificationConfig((prev) => ({
                        ...prev,
                        successEmail: {
                          ...prev.successEmail,
                          subject: e.target.value,
                        },
                      }))
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
                      setNotificationConfig((prev) => ({
                        ...prev,
                        successEmail: {
                          ...prev.successEmail,
                          template: e.target.value,
                        },
                      }))
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
                    setNotificationConfig((prev) => ({
                      ...prev,
                      inApp: {
                        ...prev.inApp,
                        progressUpdates: checked,
                      },
                    }))
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
                    setNotificationConfig((prev) => ({
                      ...prev,
                      inApp: {
                        ...prev.inApp,
                        rewardNotifications: checked,
                      },
                    }))
                  }
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
