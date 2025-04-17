import React from "react";
import Link from "next/link";
import { MapPin, Clock, Briefcase, CalendarDays } from "lucide-react";
import { Badge } from "@/components/atoms/badge";
import { Button } from "@/components/shadcn-ui/button";
import { cn, formatDate } from "@/lib/utils";

interface JobCardProps {
  id: string;
  title: string;
  company: string;
  location: string;
  locationType: "remote" | "onsite" | "hybrid";
  employmentType: string;
  salary?: {
    min?: number;
    max?: number;
    currency?: string;
  };
  postedAt: Date;
  deadline?: Date;
  isNew?: boolean;
  isFeatured?: boolean;
  className?: string;
}

export function JobCard({
  id,
  title,
  company,
  location,
  locationType,
  employmentType,
  salary,
  postedAt,
  deadline,
  isNew = false,
  isFeatured = false,
  className,
}: JobCardProps) {
  return (
    <div
      className={cn(
        "group rounded-lg border bg-card p-5 shadow-sm transition-all hover:shadow",
        isFeatured && "border-primary/50 bg-primary/5",
        className
      )}
    >
      <div className="flex flex-col space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <Link href={`/jobs/${id}`} className="hover:underline">
              <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                {title}
              </h3>
            </Link>
            <p className="text-muted-foreground mt-1">{company}</p>
          </div>
          <div className="flex space-x-2">
            {isNew && (
              <Badge variant="success" size="sm">
                New
              </Badge>
            )}
            {isFeatured && (
              <Badge variant="primary" size="sm">
                Featured
              </Badge>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-y-2 gap-x-4 text-sm text-muted-foreground">
          <div className="flex items-center">
            <MapPin className="mr-1.5 h-4 w-4" />
            <span>
              {location} ({locationType})
            </span>
          </div>
          <div className="flex items-center">
            <Briefcase className="mr-1.5 h-4 w-4" />
            <span>{employmentType}</span>
          </div>
          <div className="flex items-center">
            <Clock className="mr-1.5 h-4 w-4" />
            <span>Posted {formatDate(postedAt, { dateStyle: "medium" })}</span>
          </div>
          {deadline && (
            <div className="flex items-center">
              <CalendarDays className="mr-1.5 h-4 w-4" />
              <span>
                Deadline {formatDate(deadline, { dateStyle: "medium" })}
              </span>
            </div>
          )}
        </div>

        {salary?.min && (
          <div className="text-sm">
            <span className="font-medium">
              {salary.currency || "$"}
              {salary.min.toLocaleString()}
              {salary.max &&
                ` - ${salary.currency || "$"}${salary.max.toLocaleString()}`}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <Link href={`/apply/${id}`} passHref>
            <Button>Apply Now</Button>
          </Link>
          <Link
            href={`/jobs/${id}`}
            className="text-sm text-primary hover:underline"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}

export default JobCard;
