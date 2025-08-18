"use client";
import React, { forwardRef, useImperativeHandle } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@refref/ui/components/form";
import { FormProvider } from "react-hook-form";
import { Input } from "@refref/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@refref/ui/components/select";
import { Switch } from "@refref/ui/components/switch";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@refref/ui/components/card";

// Form schema for reward configuration
const rewardStepSchema = z.object({
  referrerReward: z.object({
    enabled: z.boolean(),
    valueType: z.enum(["fixed", "percentage"]),
    value: z.number().positive().optional(),
    currency: z.enum(["USD", "EUR", "GBP"]).optional(),
  }),
  refereeReward: z.object({
    enabled: z.boolean(),
    valueType: z.enum(["fixed", "percentage"]),
    value: z.number().positive().optional(),
    currency: z.enum(["USD", "EUR", "GBP"]).optional(),
    minPurchaseAmount: z.number().positive().optional(),
    validityDays: z.number().int().positive().optional(),
  }),
});

type RewardStepData = z.infer<typeof rewardStepSchema>;

interface RewardStepProps {
  programId: string;
}

export const RewardStep = forwardRef<
  { submitForm: () => Promise<RewardStepData> },
  RewardStepProps
>(({ programId }, ref) => {
  const form = useForm<RewardStepData>({
    resolver: zodResolver(rewardStepSchema),
    defaultValues: {
      referrerReward: {
        enabled: true,
        valueType: "fixed",
        value: 10,
        currency: "USD",
      },
      refereeReward: {
        enabled: true,
        valueType: "percentage",
        value: 10,
        validityDays: 30,
      },
    },
  });

  useImperativeHandle(ref, () => ({
    submitForm: async () => {
      const isValid = await form.trigger();
      if (!isValid) {
        throw new Error("Please fill in all required fields");
      }
      const values = form.getValues();

      // Validate that at least one reward is enabled with valid values
      if (values.referrerReward.enabled && !values.referrerReward.value) {
        throw new Error("Please set a reward value for referrers");
      }
      if (values.refereeReward.enabled && !values.refereeReward.value) {
        throw new Error("Please set a reward value for referees");
      }

      return values;
    },
  }));

  const referrerEnabled = form.watch("referrerReward.enabled");
  const refereeEnabled = form.watch("refereeReward.enabled");
  const referrerValueType = form.watch("referrerReward.valueType");
  const refereeValueType = form.watch("refereeReward.valueType");

  return (
    <FormProvider {...form}>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">Reward Configuration</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Configure rewards for both referrers and new users
          </p>
        </div>

        {/* Referrer Reward */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Referrer Reward</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="referrerReward.enabled"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                  <div>
                    <FormLabel>Enable Referrer Rewards</FormLabel>
                    <FormDescription>
                      Reward users who successfully refer others
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {referrerEnabled && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="referrerReward.valueType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reward Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="fixed">Fixed Amount</SelectItem>
                            <SelectItem value="percentage">
                              Percentage
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="referrerReward.value"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Value {referrerValueType === "percentage" && "(%)"}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {referrerValueType === "fixed" && (
                  <FormField
                    control={form.control}
                    name="referrerReward.currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Currency</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="USD">USD</SelectItem>
                            <SelectItem value="EUR">EUR</SelectItem>
                            <SelectItem value="GBP">GBP</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Referee Reward */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">New User Reward</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="refereeReward.enabled"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                  <div>
                    <FormLabel>Enable New User Rewards</FormLabel>
                    <FormDescription>
                      Reward new users who sign up via referral
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {refereeEnabled && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="refereeReward.valueType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reward Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="fixed">
                              Fixed Discount
                            </SelectItem>
                            <SelectItem value="percentage">
                              Percentage Discount
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="refereeReward.value"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Value {refereeValueType === "percentage" && "(%)"}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {refereeValueType === "fixed" && (
                  <FormField
                    control={form.control}
                    name="refereeReward.currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Currency</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="USD">USD</SelectItem>
                            <SelectItem value="EUR">EUR</SelectItem>
                            <SelectItem value="GBP">GBP</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="refereeReward.validityDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Validity Period (Days)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        How long the discount remains valid
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="refereeReward.minPurchaseAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Purchase Amount (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        Minimum order value to apply the discount
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </FormProvider>
  );
});

RewardStep.displayName = "RewardStep";
