'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/shadcn-ui/card";
import { JobType } from '@/types/job';

interface CustomFieldsCardProps {
  job: JobType;
}

export function CustomFieldsCard({ job }: CustomFieldsCardProps) {
  // Only render if there are custom fields
  if (!job.customFields || Object.keys(job.customFields).length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Custom Fields</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
          {Object.entries(job.customFields).map(([key, value]) => (
            <div key={key} className="sm:col-span-1">
              <dt className="text-sm font-medium text-muted-foreground">{key}</dt>
              <dd className="mt-1">
                {typeof value === 'boolean' 
                  ? (value ? 'Yes' : 'No')
                  : value || 'Not specified'}
              </dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}
