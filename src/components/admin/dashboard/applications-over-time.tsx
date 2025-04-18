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

interface TimeSeriesDataPoint {
  date: string;
  value: number;
}

interface ApplicationsOverTimeProps {
  data: TimeSeriesDataPoint[];
  timeRanges: string[];
  loading: boolean;
  onTimeRangeChange: (range: string) => void;
}

export function ApplicationsOverTime({ 
  data, 
  timeRanges, 
  loading, 
  onTimeRangeChange 
}: ApplicationsOverTimeProps) {
  const [timeRange, setTimeRange] = useState(timeRanges[0] || "week");

  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value);
    onTimeRangeChange(value);
  };

  // Find min and max values for scaling
  const maxValue = Math.max(...data.map(d => d.value), 1);
  
  // Calculate chart dimensions
  const chartHeight = 200;
  const chartPadding = { top: 20, right: 20, bottom: 30, left: 40 };
  const availableWidth = 100 - chartPadding.left - chartPadding.right;
  const availableHeight = chartHeight - chartPadding.top - chartPadding.bottom;
  
  // Calculate point positions
  const points = data.map((point, index) => {
    const x = chartPadding.left + (index / (data.length - 1 || 1)) * availableWidth;
    const y = chartHeight - chartPadding.bottom - (point.value / maxValue) * availableHeight;
    return { x, y, ...point };
  });

  // Generate SVG path for the line
  const linePath = points.length > 1
    ? `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`
    : '';

  // Generate area fill beneath the line
  const areaPath = points.length > 1
    ? `${linePath} L ${points[points.length - 1].x},${chartHeight - chartPadding.bottom} L ${points[0].x},${chartHeight - chartPadding.bottom} Z`
    : '';

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Applications Over Time</CardTitle>
          <CardDescription>Trend of applications received</CardDescription>
        </div>
        <Select value={timeRange} onValueChange={handleTimeRangeChange}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Time Range" />
          </SelectTrigger>
          <SelectContent>
            {timeRanges.map(range => (
              <SelectItem key={range} value={range}>
                {range === "week" ? "Last Week" : 
                 range === "month" ? "Last Month" : 
                 range === "quarter" ? "Last Quarter" : 
                 range === "year" ? "Last Year" : range}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-[240px] w-full rounded-md" />
        ) : (
          <div className="w-full h-[240px]">
            <svg 
              width="100%" 
              height="100%" 
              viewBox={`0 0 100 ${chartHeight}`} 
              preserveAspectRatio="none"
            >
              {/* Area fill beneath the line */}
              <path
                d={areaPath}
                fill="url(#gradient)"
                opacity="0.2"
              />

              {/* The line itself */}
              <path
                d={linePath}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="0.5"
                strokeLinecap="round"
              />

              {/* Data points */}
              {points.map((point, i) => (
                <g key={i} className="group" style={{ cursor: 'pointer' }}>
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="0.8"
                    fill="#3b82f6"
                  />
                  
                  {/* Hover effect elements - larger dot and tooltip */}
                  <g className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r="1.2"
                      fill="#3b82f6"
                    />
                    <rect
                      x={point.x - 6}
                      y={point.y - 12}
                      width="12"
                      height="8"
                      rx="1"
                      fill="#0f172a"
                    />
                    <text
                      x={point.x}
                      y={point.y - 6}
                      textAnchor="middle"
                      fontSize="3"
                      fill="white"
                    >
                      {point.value}
                    </text>
                  </g>
                </g>
              ))}

              {/* X-axis */}
              <line
                x1={chartPadding.left}
                y1={chartHeight - chartPadding.bottom}
                x2={100 - chartPadding.right}
                y2={chartHeight - chartPadding.bottom}
                stroke="#e2e8f0"
                strokeWidth="0.2"
              />

              {/* X-axis labels */}
              {points.filter((_, i) => i % Math.ceil(points.length / 5) === 0 || i === points.length - 1).map((point, i) => (
                <text
                  key={i}
                  x={point.x}
                  y={chartHeight - chartPadding.bottom + 5}
                  textAnchor="middle"
                  fontSize="2.5"
                  fill="#94a3b8"
                >
                  {point.date}
                </text>
              ))}

              {/* Y-axis */}
              <line
                x1={chartPadding.left}
                y1={chartPadding.top}
                x2={chartPadding.left}
                y2={chartHeight - chartPadding.bottom}
                stroke="#e2e8f0"
                strokeWidth="0.2"
              />

              {/* Y-axis labels */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                const yPos = chartHeight - chartPadding.bottom - ratio * availableHeight;
                const value = Math.round(ratio * maxValue);
                return (
                  <g key={i}>
                    <text
                      x={chartPadding.left - 2}
                      y={yPos}
                      textAnchor="end"
                      dominantBaseline="middle"
                      fontSize="2.5"
                      fill="#94a3b8"
                    >
                      {value}
                    </text>
                    <line
                      x1={chartPadding.left}
                      y1={yPos}
                      x2={100 - chartPadding.right}
                      y2={yPos}
                      stroke="#e2e8f0"
                      strokeWidth="0.1"
                      strokeDasharray="0.5"
                    />
                  </g>
                );
              })}

              {/* Gradient definition for area fill */}
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
