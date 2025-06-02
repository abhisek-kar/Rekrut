"use client";

import React, { useEffect, useCallback } from "react";
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
import { Textarea } from "@/components/shadcn-ui/textarea";
import { Switch } from "@/components/shadcn-ui/switch";
import { Card, CardContent } from "@/components/shadcn-ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/shadcn-ui/tooltip";
import { RadioGroup, RadioGroupItem } from "@/components/shadcn-ui/radio-group";
import { Globe, EyeOff, Star, Share2, Search, Info } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { JobType } from "@/types/job";

// Define form validation schema
const visibilitySchema = z.object({
  visibility: z.enum(["public", "private"]),
  featured: z.boolean().default(false),
  allowSocialSharing: z.boolean().default(true),
  seoTitle: z.string().optional(),
  seoDescription: z
    .string()
    .max(160, "SEO description should be 160 characters or less")
    .optional(),
  referralBonus: z.string().optional(),
  internalNotes: z.string().optional(),
});

type VisibilityFormValues = z.infer<typeof visibilitySchema>;

interface VisibilityFormProps {
  data: Partial<JobType>;
  onChange: (data: Partial<JobType>) => void;
  onValidityChange: (isValid: boolean) => void;
}

export function VisibilityForm({
  data,
  onChange,
  onValidityChange,
}: VisibilityFormProps) {
  // Initialize the form with existing data
  const form = useForm<VisibilityFormValues>({
    resolver: zodResolver(visibilitySchema),
    defaultValues: {
      visibility: data.visibility || "public",
      featured: data.featured || false,
      allowSocialSharing: data.allowSocialSharing !== false,
      seoTitle: data.seoTitle || "",
      seoDescription: data.seoDescription || "",
      referralBonus: data.referralBonus?.toString() || "",
      internalNotes: data.internalNotes || "",
    },
    mode: "onChange",
  });

  // Update parent component when form values change
  const onSubmit = useCallback((values: VisibilityFormValues) => {
    onChange(values);
  }, [onChange]);

  // Update parent on form validity changes
  useEffect(() => {
    const subscription = form.watch(() => {
      // This form is always valid since nothing is strictly required
      onValidityChange(true);

      // Auto-submit the form with current values
      onSubmit(form.getValues());
    });

    return () => subscription.unsubscribe();
  }, [form, onValidityChange, onSubmit]);

  // SEO description character count
  const seoDescriptionLength = form.watch("seoDescription")?.length || 0;

  return (
    <Form {...form}>
      <form className="space-y-8">
        {/* Job Visibility */}
        <FormField
          control={form.control}
          name="visibility"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Job Visibility</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="public" />
                    </FormControl>
                    <FormLabel className="font-normal flex items-center cursor-pointer">
                      <Globe className="mr-2 h-4 w-4 text-blue-500" />
                      Public - Visible on job board and search engines
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="private" />
                    </FormControl>
                    <FormLabel className="font-normal flex items-center cursor-pointer">
                      <EyeOff className="mr-2 h-4 w-4 text-gray-500" />
                      Private - Only visible with direct link
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormDescription>
                Control who can see and apply to this job posting
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Featured Job */}
        <FormField
          control={form.control}
          name="featured"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between space-x-2 space-y-0 rounded-md border p-4">
              <div className="space-y-0.5">
                <div className="flex items-center">
                  <FormLabel className="flex gap-2">
                    <Star className="h-4 w-4 text-yellow-400" />
                    Featured Job
                  </FormLabel>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground ml-1 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="w-60">
                          Featured jobs appear at the top of search results and
                          get special visual treatment on the job board.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <FormDescription>
                  Highlight this job to get more visibility
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

        {/* Social Sharing */}
        <FormField
          control={form.control}
          name="allowSocialSharing"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between space-x-2 space-y-0 rounded-md border p-4">
              <div className="space-y-0.5">
                <FormLabel className="flex gap-2">
                  <Share2 className="h-4 w-4 text-purple-500" />
                  Enable Social Sharing
                </FormLabel>
                <FormDescription>
                  Allow candidates to share this job on social media
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

        {/* SEO Settings */}
        {form.watch("visibility") === "public" && (
          <div className="space-y-4 border p-4 rounded-md">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-green-500" />
              <h3 className="font-medium">SEO Settings</h3>
            </div>
            <FormDescription>
              Optimize your job listing for search engines
            </FormDescription>

            {/* SEO Title */}
            <FormField
              control={form.control}
              name="seoTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SEO Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Custom title for search engines (leave empty to use job title)"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    A custom title that appears in search engine results (max 60
                    characters recommended)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* SEO Description */}
            <FormField
              control={form.control}
              name="seoDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SEO Description</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Textarea
                        placeholder="Brief description for search engines"
                        className="pr-16"
                        maxLength={160}
                        {...field}
                      />
                      <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
                        {seoDescriptionLength}/160
                      </div>
                    </div>
                  </FormControl>
                  <FormDescription>
                    A brief description that appears in search engine results
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {/* Referral Bonus */}
        <FormField
          control={form.control}
          name="referralBonus"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Referral Bonus</FormLabel>
              <FormControl>
                <Input placeholder="e.g. $500" {...field} />
              </FormControl>
              <FormDescription>
                Incentive offered to employees who refer successful candidates
                (leave blank if none)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Internal Notes */}
        <FormField
          control={form.control}
          name="internalNotes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Internal Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Notes visible only to recruiters, not candidates"
                  className="min-h-20"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Add private notes about this job (visible only to team members,
                not candidates)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Best Practices */}
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <div className="flex gap-2">
              <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <h4 className="text-sm font-medium">
                  Visibility best practices:
                </h4>
                <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                  <li>
                    Set featured status for high-priority or hard-to-fill
                    positions
                  </li>
                  <li>
                    Use private visibility for internal positions or sensitive
                    roles
                  </li>
                  <li>
                    Customize SEO settings for better discoverability on search
                    engines
                  </li>
                  <li>
                    Include location keywords in the SEO description for local
                    searches
                  </li>
                  <li>
                    Consider offering a referral bonus for high-value positions
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}
