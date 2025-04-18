import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shadcn-ui/card';
import { Skeleton } from '@/components/shadcn-ui/skeleton';

// Define job status types and colors
const statusColors = {
  'active': '#22c55e', // green
  'draft': '#94a3b8', // slate
  'closed': '#3b82f6', // blue
  'archived': '#6b7280', // gray
};

interface JobStatusData {
  status: keyof typeof statusColors;
  count: number;
  percentage: number;
}

interface JobStatusChartProps {
  data: JobStatusData[];
  loading: boolean;
}

export function JobStatusChart({ data, loading }: JobStatusChartProps) {
  const total = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Job Status Distribution</CardTitle>
        <CardDescription>Current status of all job postings</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex flex-col gap-4">
            <Skeleton className="h-48 w-full rounded-md" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        ) : (
          <>
            <div className="relative h-48 w-48 mx-auto my-4">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                {/* Create the donut chart using SVG */}
                <circle 
                  cx="50" 
                  cy="50" 
                  r="40" 
                  fill="transparent" 
                  stroke="#e2e8f0"
                  strokeWidth="20"
                />

                {data.map((item, index) => {
                  // Calculate stroke-dasharray and stroke-dashoffset for the arc
                  const circumference = 2 * Math.PI * 40;
                  const previousPercentages = data
                    .slice(0, index)
                    .reduce((sum, d) => sum + d.percentage, 0);
                  
                  return (
                    <circle
                      key={item.status}
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke={statusColors[item.status]}
                      strokeWidth="20"
                      strokeDasharray={circumference}
                      strokeDashoffset={circumference * (1 - item.percentage / 100)}
                      transform={`rotate(${-90 + (previousPercentages * 3.6)} 50 50)`}
                      style={{
                        transition: 'stroke-dashoffset 0.5s ease-in-out',
                      }}
                    />
                  );
                })}
                
                {/* Center text displaying total */}
                <text 
                  x="50" 
                  y="45" 
                  textAnchor="middle" 
                  dominantBaseline="middle"
                  className="text-xl font-bold"
                >
                  {total}
                </text>
                <text 
                  x="50" 
                  y="60" 
                  textAnchor="middle" 
                  dominantBaseline="middle"
                  className="text-xs"
                >
                  Total Jobs
                </text>
              </svg>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4">
              {data.map((item) => (
                <div key={item.status} className="flex items-center gap-2">
                  <div 
                    className="h-3 w-3 rounded-full" 
                    style={{ backgroundColor: statusColors[item.status] }}
                  />
                  <div className="flex justify-between items-center w-full text-sm">
                    <span className="capitalize">{item.status}</span>
                    <span className="font-medium">{item.count} ({item.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
