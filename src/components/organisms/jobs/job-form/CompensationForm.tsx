"use client";

import React, { useEffect, useState } from "react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/shadcn-ui/form";
import { Input } from "@/components/shadcn-ui/input";
import { Button } from "@/components/shadcn-ui/button";
import { Badge } from "@/components/shadcn-ui/badge";
import { Textarea } from "@/components/shadcn-ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn-ui/select";
import { Switch } from "@/components/shadcn-ui/switch";
import { X, Plus, DollarSign } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { JobType } from "@/types/job";

// Define form validation schema
const compensationSchema = z.object({
  salary: z.object({
    min: z.string().optional(),
    max: z.string().optional(),
    currency: z.string().default("USD"),
    visible: z.boolean().default(false),
  }),
  benefits: z.array(z.string()).optional(),
  perks: z.array(z.string()).optional(),
  workingHours: z.string().optional(),
});

type CompensationFormValues = z.infer<typeof compensationSchema>;

interface CompensationFormProps {
  data: Partial<JobType>;
  onChange: (data: Partial<JobType>) => void;
  onValidityChange: (isValid: boolean) => void;
}

// Common benefits suggestions
const benefitSuggestions = [
  "Health Insurance",
  "Dental Insurance",
  "Vision Insurance",
  "401(k)",
  "Paid Time Off",
  "Remote Work",
  "Flexible Hours",
  "Professional Development",
  "Parental Leave",
  "Life Insurance",
];

// Common perks suggestions
const perkSuggestions = [
  "Free Lunch",
  "Gym Membership",
  "Company Events",
  "Learning Budget",
  "Home Office Stipend",
  "Mental Health Days",
  "Commuter Benefits",
  "Employee Discounts",
  "Team Retreats",
  "Wellness Programs",
];

export function CompensationForm({
  data,
  onChange,
  onValidityChange,
}: CompensationFormProps) {
  const [newBenefit, setNewBenefit] = useState("");
  const [newPerk, setNewPerk] = useState("");
  const currencies = ["USD", "EUR", "GBP", "CAD", "AUD", "JPY", "INR", "CNY"];

  // Initialize the form with existing data
  const form = useForm<CompensationFormValues>({
    resolver: zodResolver(compensationSchema),
    defaultValues: {
      salary: {
        min: data.salary?.min?.toString() || "",
        max: data.salary?.max?.toString() || "",
        currency: data.salary?.currency || "USD",
        visible: data.salary?.visible || false,
      },
      benefits: data.benefits || [],
      perks: data.perks || [],
      workingHours: data.workingHours || "",
    },
    mode: "onChange",
  });

  // Update parent component when form values change
  const onSubmit = (values: CompensationFormValues) => {
    // Convert string salary values to numbers
    const formattedValues = {
      ...values,
      salary: {
        ...values.salary,
        min: values.salary.min ? Number(values.salary.min) : undefined,
        max: values.salary.max ? Number(values.salary.max) : undefined,
      },
    };

    onChange(formattedValues);
  };

  // Update parent on form validity changes
  useEffect(() => {
    const subscription = form.watch(() => {
      // This form is always valid since all fields are optional
      onValidityChange(true);

      // Auto-submit the form with current values
      onSubmit(form.getValues());
    });

    return () => subscription.unsubscribe();
  }, [form, onValidityChange, onChange, onSubmit]);

  // Add a new benefit
  const handleAddBenefit = (benefitText?: string) => {
    const benefit = benefitText || newBenefit.trim();
    if (benefit && !form.getValues().benefits?.includes(benefit)) {
      const updatedBenefits = [...(form.getValues().benefits || []), benefit];
      form.setValue("benefits", updatedBenefits);
      setNewBenefit("");
    }
  };

  // Remove a benefit
  const handleRemoveBenefit = (benefitToRemove: string) => {
    const updatedBenefits =
      form
        .getValues()
        .benefits?.filter((benefit) => benefit !== benefitToRemove) || [];
    form.setValue("benefits", updatedBenefits);
  };

  // Add a new perk
  const handleAddPerk = (perkText?: string) => {
    const perk = perkText || newPerk.trim();
    if (perk && !form.getValues().perks?.includes(perk)) {
      const updatedPerks = [...(form.getValues().perks || []), perk];
      form.setValue("perks", updatedPerks);
      setNewPerk("");
    }
  };

  // Remove a perk
  const handleRemovePerk = (perkToRemove: string) => {
    const updatedPerks =
      form.getValues().perks?.filter((perk) => perk !== perkToRemove) || [];
    form.setValue("perks", updatedPerks);
  };

  return (
    <Form {...form}>
      <form className="space-y-8">
        {/* Salary Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Salary Information</h3>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Min Salary */}
            <FormField
              control={form.control}
              name="salary.min"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minimum Salary</FormLabel>
                  <div className="relative">
                    <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <FormControl>
                      <Input
                        placeholder="e.g. 50000"
                        type="number"
                        min="0"
                        className="pl-8"
                        {...field}
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Max Salary */}
            <FormField
              control={form.control}
              name="salary.max"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maximum Salary</FormLabel>
                  <div className="relative">
                    <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <FormControl>
                      <Input
                        placeholder="e.g. 80000"
                        type="number"
                        min="0"
                        className="pl-8"
                        {...field}
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Currency */}
            <FormField
              control={form.control}
              name="salary.currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Currency</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem key={currency} value={currency}>
                          {currency}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Salary Visibility */}
            <FormField
              control={form.control}
              name="salary.visible"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between space-x-2 space-y-0 rounded-md border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>Display Salary</FormLabel>
                    <FormDescription>
                      Show salary range on job listing
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Working Hours */}
        <FormField
          control={form.control}
          name="workingHours"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Working Hours/Schedule</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe the working hours, schedule, or shift details..."
                  className="min-h-20"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Specify work schedule, shifts, or expected hours (e.g.,
                &quot;Monday-Friday, 9am-5pm&quot;)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Benefits */}
        <FormField
          control={form.control}
          name="benefits"
          render={() => (
            <FormItem>
              <FormLabel>Benefits</FormLabel>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="e.g. Health Insurance, 401(k)"
                    value={newBenefit}
                    onChange={(e) => setNewBenefit(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddBenefit();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={() => handleAddBenefit()}
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>

                <div>
                  {!form.getValues().benefits?.length ? (
                    <div className="text-sm text-muted-foreground mb-2">
                      No benefits added yet
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {form.getValues().benefits?.map((benefit, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="py-1.5 px-2 text-sm"
                        >
                          {benefit}
                          <button
                            type="button"
                            onClick={() => handleRemoveBenefit(benefit)}
                            className="ml-1 rounded-full hover:bg-muted p-0.5"
                          >
                            <X className="h-3 w-3" />
                            <span className="sr-only">Remove</span>
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="mt-2">
                    <p className="text-sm font-medium mb-2">Common benefits:</p>
                    <div className="flex flex-wrap gap-2">
                      {benefitSuggestions.map((benefit) => (
                        <Badge
                          key={benefit}
                          variant="outline"
                          className="cursor-pointer hover:bg-secondary"
                          onClick={() => handleAddBenefit(benefit)}
                        >
                          + {benefit}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <FormDescription>
                List the benefits provided with this position
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Perks */}
        <FormField
          control={form.control}
          name="perks"
          render={() => (
            <FormItem>
              <FormLabel>Perks</FormLabel>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="e.g. Free Lunch, Gym Membership"
                    value={newPerk}
                    onChange={(e) => setNewPerk(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddPerk();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={() => handleAddPerk()}
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>

                <div>
                  {!form.getValues().perks?.length ? (
                    <div className="text-sm text-muted-foreground mb-2">
                      No perks added yet
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {form.getValues().perks?.map((perk, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="py-1.5 px-2 text-sm"
                        >
                          {perk}
                          <button
                            type="button"
                            onClick={() => handleRemovePerk(perk)}
                            className="ml-1 rounded-full hover:bg-muted p-0.5"
                          >
                            <X className="h-3 w-3" />
                            <span className="sr-only">Remove</span>
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="mt-2">
                    <p className="text-sm font-medium mb-2">Common perks:</p>
                    <div className="flex flex-wrap gap-2">
                      {perkSuggestions.map((perk) => (
                        <Badge
                          key={perk}
                          variant="outline"
                          className="cursor-pointer hover:bg-secondary"
                          onClick={() => handleAddPerk(perk)}
                        >
                          + {perk}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <FormDescription>
                List additional perks or benefits for this role
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
