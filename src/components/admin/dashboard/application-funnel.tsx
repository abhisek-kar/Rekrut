import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shadcn-ui/card';
import { Skeleton } from '@/components/shadcn-ui/skeleton';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/shadcn-ui/select';

// Define the application stages and their colors
const stages = [
  { id: 'applied', label: 'Applied', color: '#3b82f6' }, // blue
  { id: 'screened', label: 'Screened', color: '#22c55e' }, // green
  { id: 'interviewed', label: 'Interviewed', color: '#eab308' }, // yellow
  { id: 'offered', label: 'Offered', color: '#f97316' }, // orange
  { id: 'hired', label: 'Hired', color: '#8b5cf6' }, // purple
];

interface FunnelData {
  stage: string;
  count: number;
  percentage: number;
}

interface ApplicationFunnelProps {
  data: FunnelData[];
  dateRanges: string[];
  loading: boolean;
  onDateRangeChange: (range: string) => void;
}

export function ApplicationFunnel({ data, dateRanges, loading, onDateRangeChange }: ApplicationFunnelProps) {
  const [dateRange, setDateRange] = useState(dateRanges[0] || "30days");

  const handleDateRangeChange = (value: string) => {
    setDateRange(value);
    onDateRangeChange(value);
  };

  // Find the maximum count to scale the bars
  const maxCount = Math.max(...data.map(item => item.count), 1);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Application Conversion Funnel</CardTitle>
          <CardDescription>Conversion rates through hiring stages</CardDescription>
        </div>
        <Select value={dateRange} onValueChange={handleDateRangeChange}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Date Range" />
          </SelectTrigger>
          <SelectContent>
            {dateRanges.map(range => (
              <SelectItem key={range} value={range}>
                {range === "30days" ? "Last 30 Days" : 
                 range === "60days" ? "Last 60 Days" : 
                 range === "90days" ? "Last 90 Days" : 
                 range === "thisyear" ? "This Year" : range}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {Array(5).fill(null).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-8 w-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-5">
            {stages.map((stage, index) => {
              const stageData = data.find(d => d.stage === stage.id) || { 
                stage: stage.id, 
                count: 0, 
                percentage: 0 
              };
              
              const width = `${Math.max((stageData.count / maxCount) * 100, 5)}%`;
              const prevStageData = index > 0 ? 
                data.find(d => d.stage === stages[index - 1].id) : null;
              
              // Calculate conversion rate from previous stage
              let conversionRate = null;
              if (index > 0 && prevStageData && prevStageData.count > 0) {
                conversionRate = Math.round((stageData.count / prevStageData.count) * 100);
              }

              return (
                <div key={stage.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div 
                        className="h-3 w-3 rounded-full" 
                        style={{ backgroundColor: stage.color }}
                      />
                      <span className="font-medium">{stage.label}</span>
                    </div>
                    <div className="text-sm flex items-center gap-2">
                      <span className="font-bold">{stageData.count}</span>
                      <span className="text-muted-foreground">
                        {stageData.percentage}%
                      </span>
                      {conversionRate !== null && (
                        <span className="text-xs bg-muted px-1.5 py-0.5 rounded">
                          {conversionRate}% from previous
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="h-7 w-full bg-muted rounded-sm overflow-hidden">
                    <div 
                      className="h-full rounded-sm transition-all duration-500 ease-in-out"
                      style={{ 
                        width, 
                        backgroundColor: stage.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
