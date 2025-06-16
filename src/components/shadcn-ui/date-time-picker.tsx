"use client";

import React from "react";
import { Button } from "@/components/shadcn-ui/button";
import { Input } from "@/components/shadcn-ui/input";
import { Label } from "@/components/shadcn-ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/shadcn-ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn-ui/select";
import { Calendar } from "@/components/shadcn-ui/calendar";
import { ScrollArea, ScrollBar } from "@/components/shadcn-ui/scroll-area";
import { format } from "date-fns";
import { CalendarIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

// Common timezones
const TIMEZONES = [
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "UTC", label: "UTC" },
  { value: "Europe/London", label: "London (GMT)" },
  { value: "Europe/Paris", label: "Paris (CET)" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)" },
  { value: "Asia/Shanghai", label: "Shanghai (CST)" },
  { value: "Asia/Kolkata", label: "India (IST)" },
  { value: "Australia/Sydney", label: "Sydney (AEST)" },
];

interface DateTimePickerProps {
  value?: Date;
  onChange: (date: Date) => void;
  className?: string;
  placeholder?: string;
  showTimezone?: boolean;
  timezone?: string;
  onTimezoneChange?: (timezone: string) => void;
  format12Hour?: boolean;
}

export function DateTimePicker({
  value,
  onChange,
  className,
  placeholder = "Select date and time",
  showTimezone = false,
  timezone,
  onTimezoneChange,
  format12Hour = true,
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false);
  
  // Get user's local timezone as default
  const defaultTimezone = React.useMemo(() => {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }, []);

  const currentTimezone = timezone || defaultTimezone;

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate && value) {
      // Preserve the time when changing date
      const newDate = new Date(selectedDate);
      newDate.setHours(value.getHours(), value.getMinutes(), 0, 0);
      onChange(newDate);
    } else if (selectedDate) {
      // Set default time to 9:00 AM if no time was set
      const newDate = new Date(selectedDate);
      newDate.setHours(9, 0, 0, 0);
      onChange(newDate);
    }
  };

  const handleTimeChange = (type: "hour" | "minute" | "ampm", newValue: string) => {
    const currentDate = value || new Date();
    const newDate = new Date(currentDate);

    if (type === "hour") {
      const hour = parseInt(newValue, 10);
      if (format12Hour) {
        const currentHour = newDate.getHours();
        const isPM = currentHour >= 12;
        const newHour = isPM ? (hour === 12 ? 12 : hour + 12) : (hour === 12 ? 0 : hour);
        newDate.setHours(newHour);
      } else {
        newDate.setHours(hour);
      }
    } else if (type === "minute") {
      newDate.setMinutes(parseInt(newValue, 10));
    } else if (type === "ampm") {
      const currentHour = newDate.getHours();
      if (newValue === "AM" && currentHour >= 12) {
        newDate.setHours(currentHour - 12);
      } else if (newValue === "PM" && currentHour < 12) {
        newDate.setHours(currentHour + 12);
      }
    }

    onChange(newDate);
  };

  const formatDisplayValue = () => {
    if (!value) return placeholder;
    
    const dateStr = format(value, "MMM dd, yyyy");
    const timeStr = format12Hour 
      ? format(value, "hh:mm aa")
      : format(value, "HH:mm");
    
    return `${dateStr} ${timeStr}`;
  };

  const getCurrentHour = () => {
    if (!value) return format12Hour ? 9 : 9;
    return format12Hour ? 
      (value.getHours() === 0 ? 12 : value.getHours() > 12 ? value.getHours() - 12 : value.getHours()) :
      value.getHours();
  };

  const getCurrentMinute = () => {
    return value ? value.getMinutes() : 0;
  };

  const getCurrentAMPM = () => {
    return value ? (value.getHours() >= 12 ? "PM" : "AM") : "AM";
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Date and Time Picker */}
      <div>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal h-10",
                !value && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              <span className="truncate">{formatDisplayValue()}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="sm:flex">
              <Calendar
                mode="single"
                selected={value}
                onSelect={handleDateSelect}
                initialFocus
                className="border-r border-border"
              />
              <div className="flex flex-col sm:flex-row sm:h-[300px] divide-y sm:divide-y-0 sm:divide-x divide-border">
                {/* Hours */}
                <ScrollArea className="w-64 sm:w-auto">
                  <div className="flex sm:flex-col p-2">
                    <div className="text-center text-xs font-medium text-muted-foreground mb-2 sm:block hidden border-b pb-2">
                      Hour
                    </div>
                    {Array.from({ length: format12Hour ? 12 : 24 }, (_, i) => {
                      const hour = format12Hour ? i + 1 : i;
                      const displayHour = format12Hour ? (hour === 13 ? 1 : hour) : hour;
                      return (
                        <Button
                          key={hour}
                          size="sm"
                          variant={getCurrentHour() === displayHour ? "default" : "ghost"}
                          className="sm:w-full shrink-0 aspect-square mb-1 text-sm"
                          onClick={() => handleTimeChange("hour", displayHour.toString())}
                        >
                          {format12Hour ? displayHour : hour.toString().padStart(2, "0")}
                        </Button>
                      );
                    })}
                  </div>
                  <ScrollBar orientation="horizontal" className="sm:hidden" />
                </ScrollArea>

                {/* Minutes */}
                <ScrollArea className="w-64 sm:w-auto">
                  <div className="flex sm:flex-col p-2">
                    <div className="text-center text-xs font-medium text-muted-foreground mb-2 sm:block hidden border-b pb-2">
                      Min
                    </div>
                    {Array.from({ length: 12 }, (_, i) => i * 5).map((minute) => (
                      <Button
                        key={minute}
                        size="sm"
                        variant={getCurrentMinute() === minute ? "default" : "ghost"}
                        className="sm:w-full shrink-0 aspect-square mb-1 text-sm"
                        onClick={() => handleTimeChange("minute", minute.toString())}
                      >
                        {minute.toString().padStart(2, "0")}
                      </Button>
                    ))}
                  </div>
                  <ScrollBar orientation="horizontal" className="sm:hidden" />
                </ScrollArea>

                {/* AM/PM */}
                {format12Hour && (
                  <ScrollArea className="w-20 sm:w-auto">
                    <div className="flex sm:flex-col p-2">
                      <div className="text-center text-xs font-medium text-muted-foreground mb-2 sm:block hidden border-b pb-2">
                        Period
                      </div>
                      {["AM", "PM"].map((period) => (
                        <Button
                          key={period}
                          size="sm"
                          variant={getCurrentAMPM() === period ? "default" : "ghost"}
                          className="sm:w-full shrink-0 aspect-square mb-1 text-sm"
                          onClick={() => handleTimeChange("ampm", period)}
                        >
                          {period}
                        </Button>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Timezone Selector with Label */}
      {showTimezone && (
        <div className="space-y-2">
          <Label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Timezone
          </Label>
          <Select value={currentTimezone} onValueChange={onTimezoneChange}>
            <SelectTrigger className="w-full">
              <div className="flex items-center">
                <Clock className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Select timezone" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {TIMEZONES.map((tz) => (
                <SelectItem key={tz.value} value={tz.value}>
                  {tz.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
