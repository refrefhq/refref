import React from "react";
import { Input } from "@refref/ui/components/input";
import { Label } from "@refref/ui/components/label";
import { RadioGroup, RadioGroupItem } from "@refref/ui/components/radio-group";
import { Switch } from "@refref/ui/components/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@refref/ui/components/card";
import { DollarSign, Percent, Tag } from "lucide-react";
import {
  CurrencyType,
  ProgramTemplateRewardStepV2Type,
  RewardCurrencies,
} from "@refref/types";

interface RewardStepFormProps {
  form: any; // Use any to avoid complex FormApi type arguments
}

export function RewardStepForm({ form }: RewardStepFormProps) {
  return (
    <>
      {/* Referrer Reward Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Referrer Reward
              </CardTitle>
              <CardDescription>
                Configure cash rewards for users who refer new customers
              </CardDescription>
            </div>
            <form.Field name="referrerReward.enabled">
              {(field: any) => (
                <Switch
                  checked={field.state.value}
                  onCheckedChange={(checked) => field.handleChange(checked)}
                  data-testid="referrer-reward-enabled"
                />
              )}
            </form.Field>
          </div>
        </CardHeader>
        <form.Field name="referrerReward.enabled">
          {(enabledField: any) =>
            enabledField.state.value && (
              <CardContent className="space-y-4">
                {/* Currency Select */}
                <form.Field name="referrerReward.currency">
                  {(field: any) => (
                    <div className="space-y-2">
                      <Label htmlFor="referrer-currency">Currency</Label>
                      <select
                        id="referrer-currency"
                        className="block w-32 border rounded px-3 py-2"
                        value={field.state.value}
                        onChange={(e) =>
                          field.handleChange(e.target.value as CurrencyType)
                        }
                      >
                        {RewardCurrencies.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </form.Field>

                {/* Reward Type */}
                <form.Field name="referrerReward.valueType">
                  {(field: any) => (
                    <div className="space-y-2">
                      <Label>Reward Type</Label>
                      <RadioGroup
                        value={field.state.value}
                        onValueChange={(v) => field.handleChange(v as any)}
                        className="flex gap-4"
                      >
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="fixed" id="referrer-fixed" />
                          <Label
                            htmlFor="referrer-fixed"
                            className="font-normal"
                          >
                            Fixed Amount
                          </Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <RadioGroupItem
                            value="percentage"
                            id="referrer-percentage"
                          />
                          <Label
                            htmlFor="referrer-percentage"
                            className="font-normal"
                          >
                            Percentage of Purchase
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                  )}
                </form.Field>

                {/* Reward Value */}
                <form.Field name="referrerReward.value">
                  {(field: any) => {
                    const valueType =
                      form.state.values.referrerReward.valueType;
                    return (
                      <div className="space-y-2">
                        <Label htmlFor="referrer-value">
                          Reward{" "}
                          {valueType === "fixed" ? "Amount" : "Percentage"}
                        </Label>
                        <div className="flex items-center gap-2">
                          {valueType === "fixed" && (
                            <span className="text-lg font-medium">
                              {form.state.values.referrerReward.currency ===
                              "USD"
                                ? "$"
                                : form.state.values.referrerReward.currency ===
                                    "EUR"
                                  ? "€"
                                  : form.state.values.referrerReward
                                        .currency === "GBP"
                                    ? "£"
                                    : ""}
                            </span>
                          )}
                          <Input
                            id="referrer-value"
                            type="number"
                            min={valueType === "percentage" ? 1 : 0.01}
                            max={valueType === "percentage" ? 100 : undefined}
                            step={valueType === "percentage" ? 1 : 0.01}
                            value={field.state.value}
                            onChange={(e) =>
                              field.handleChange(Number(e.target.value))
                            }
                            className="w-32"
                          />
                          {valueType === "percentage" && (
                            <Percent className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        {field.state.meta.isTouched &&
                        field.state.meta.errors?.length ? (
                          <div className="text-red-500 text-xs">
                            {field.state.meta.errors[0]?.message}
                          </div>
                        ) : null}
                      </div>
                    );
                  }}
                </form.Field>
              </CardContent>
            )
          }
        </form.Field>
      </Card>

      {/* Referee Reward Card - COMMENTED OUT */}
      {/*
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Referee Discount
              </CardTitle>
              <CardDescription>
                Configure discounts for new customers who use a referral link
              </CardDescription>
            </div>
            <form.Field name="refereeReward.enabled">
              {(field: any) => (
                <Switch
                  checked={field.state.value}
                  onCheckedChange={(checked) => field.handleChange(checked)}
                  data-testid="referee-reward-enabled"
                />
              )}
            </form.Field>
          </div>
        </CardHeader>
        <form.Field name="refereeReward.enabled">
          {(enabledField: any) =>
            enabledField.state.value && (
              <CardContent className="space-y-4">
                {/* Discount Type *\/}
                <form.Field name="refereeReward.valueType">
                  {(field: any) => (
                    <div className="space-y-2">
                      <Label>Discount Type</Label>
                      <RadioGroup
                        value={field.state.value}
                        onValueChange={(v) => field.handleChange(v as any)}
                        className="flex gap-4"
                      >
                        <div className="flex items-center gap-2">
                          <RadioGroupItem
                            value="percentage"
                            id="referee-percentage"
                          />
                          <Label
                            htmlFor="referee-percentage"
                            className="font-normal"
                          >
                            Percentage Discount
                          </Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="fixed" id="referee-fixed" />
                          <Label
                            htmlFor="referee-fixed"
                            className="font-normal"
                          >
                            Fixed Amount Off
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                  )}
                </form.Field>

                {/* Discount Value *\/}
                <form.Field name="refereeReward.value">
                  {(field: any) => {
                    const valueType = form.state.values.refereeReward.valueType;
                    return (
                      <div className="space-y-2">
                        <Label htmlFor="referee-value">
                          Discount{" "}
                          {valueType === "fixed" ? "Amount" : "Percentage"}
                        </Label>
                        <div className="flex items-center gap-2">
                          {valueType === "fixed" && (
                            <form.Field name="refereeReward.currency">
                              {(currencyField: any) => (
                                <select
                                  className="block w-20 border rounded px-2 py-2"
                                  value={currencyField.state.value || "USD"}
                                  onChange={(e) =>
                                    currencyField.handleChange(
                                      e.target.value as CurrencyType,
                                    )
                                  }
                                >
                                  {RewardCurrencies.map((c) => (
                                    <option key={c} value={c}>
                                      {c}
                                    </option>
                                  ))}
                                </select>
                              )}
                            </form.Field>
                          )}
                          <Input
                            id="referee-value"
                            type="number"
                            min={valueType === "percentage" ? 1 : 0.01}
                            max={valueType === "percentage" ? 100 : undefined}
                            step={valueType === "percentage" ? 1 : 0.01}
                            value={field.state.value}
                            onChange={(e) =>
                              field.handleChange(Number(e.target.value))
                            }
                            className="w-32"
                          />
                          {valueType === "percentage" && (
                            <Percent className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        {field.state.meta.isTouched &&
                        field.state.meta.errors?.length ? (
                          <div className="text-red-500 text-xs">
                            {field.state.meta.errors[0]?.message}
                          </div>
                        ) : null}
                      </div>
                    );
                  }}
                </form.Field>

                {/* Minimum Purchase Amount *\/}
                <form.Field name="refereeReward.minPurchaseAmount">
                  {(field: any) => (
                    <div className="space-y-2">
                      <Label htmlFor="min-purchase">
                        Minimum Purchase Amount (Optional)
                      </Label>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-medium">$</span>
                        <Input
                          id="min-purchase"
                          type="number"
                          min={0}
                          step={0.01}
                          placeholder="No minimum"
                          value={field.state.value || ""}
                          onChange={(e) =>
                            field.handleChange(
                              e.target.value
                                ? Number(e.target.value)
                                : undefined,
                            )
                          }
                          className="w-32"
                        />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Discount only applies to purchases above this amount
                      </p>
                    </div>
                  )}
                </form.Field>

                {/* Validity Period *\/}
                <form.Field name="refereeReward.validityDays">
                  {(field: any) => (
                    <div className="space-y-2">
                      <Label htmlFor="validity-days">
                        Discount Validity Period
                      </Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="validity-days"
                          type="number"
                          min={1}
                          max={365}
                          value={field.state.value}
                          onChange={(e) =>
                            field.handleChange(Number(e.target.value))
                          }
                          className="w-32"
                        />
                        <span className="text-sm text-muted-foreground">
                          days
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        How long the discount code remains valid
                      </p>
                    </div>
                  )}
                </form.Field>
              </CardContent>
            )
          }
        </form.Field>
      </Card>
      */}
    </>
  );
}
