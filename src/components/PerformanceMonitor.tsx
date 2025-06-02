"use client";

import { useEffect, useState } from 'react';
import { performanceMonitor, PerformanceMetrics, initWebVitals } from '@/lib/performance';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shadcn-ui/card';
import { Button } from '@/components/shadcn-ui/button';
import { Badge } from '@/components/shadcn-ui/badge';

interface PerformanceMonitorProps {
  showDetails?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function PerformanceMonitor({ 
  showDetails = false, 
  autoRefresh = false,
  refreshInterval = 5000 
}: PerformanceMonitorProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics[]>([]);
  const [summary, setSummary] = useState({
    totalOperations: 0,
    averageDuration: 0,
    slowestOperation: null as PerformanceMetrics | null,
    fastestOperation: null as PerformanceMetrics | null,
  });

  const refreshMetrics = () => {
    const currentMetrics = performanceMonitor.getMetrics();
    const currentSummary = performanceMonitor.getSummary();
    setMetrics(currentMetrics);
    setSummary(currentSummary);
  };

  useEffect(() => {
    // Initialize Web Vitals monitoring
    if (process.env.NODE_ENV === 'development') {
      initWebVitals();
    }

    // Initial load
    refreshMetrics();

    // Auto-refresh if enabled
    let interval: NodeJS.Timeout | undefined;
    if (autoRefresh) {
      interval = setInterval(refreshMetrics, refreshInterval);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [autoRefresh, refreshInterval]);

  const formatDuration = (duration: number) => {
    if (duration < 1) return `${duration.toFixed(2)}ms`;
    if (duration < 1000) return `${Math.round(duration)}ms`;
    return `${(duration / 1000).toFixed(2)}s`;
  };

  const getPerformanceBadgeColor = (duration: number) => {
    if (duration < 100) return 'default'; // Good
    if (duration < 500) return 'secondary'; // OK
    if (duration < 1000) return 'destructive'; // Slow
    return 'destructive'; // Very slow
  };

  const clearMetrics = () => {
    performanceMonitor.clear();
    refreshMetrics();
  };

  const exportMetrics = () => {
    const data = performanceMonitor.export();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-metrics-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (process.env.NODE_ENV !== 'development') {
    return null; // Only show in development
  }

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Performance Monitor</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={refreshMetrics}>
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={clearMetrics}>
              Clear
            </Button>
            <Button variant="outline" size="sm" onClick={exportMetrics}>
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{summary.totalOperations}</div>
            <div className="text-sm text-muted-foreground">Total Operations</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">
              {formatDuration(summary.averageDuration)}
            </div>
            <div className="text-sm text-muted-foreground">Average Duration</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">
              {summary.slowestOperation ? formatDuration(summary.slowestOperation.duration) : 'N/A'}
            </div>
            <div className="text-sm text-muted-foreground">Slowest Operation</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">
              {summary.fastestOperation ? formatDuration(summary.fastestOperation.duration) : 'N/A'}
            </div>
            <div className="text-sm text-muted-foreground">Fastest Operation</div>
          </div>
        </div>

        {/* Recent metrics */}
        {showDetails && metrics.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2">Recent Operations</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {metrics.slice(-10).reverse().map((metric, index) => (
                <div 
                  key={`${metric.name}-${metric.startTime}-${index}`}
                  className="flex items-center justify-between p-2 border rounded"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant={getPerformanceBadgeColor(metric.duration)}>
                      {formatDuration(metric.duration)}
                    </Badge>
                    <span className="font-medium">{metric.name}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {new Date(performance.timeOrigin + metric.startTime).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Web Vitals */}
        {showDetails && (
          <div>
            <h4 className="font-semibold mb-2">Web Vitals</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {['LCP', 'FID', 'CLS'].map(vital => {
                const vitalMetrics = metrics.filter(m => m.name === vital);
                const latestVital = vitalMetrics[vitalMetrics.length - 1];
                
                return (
                  <div key={vital} className="text-center p-4 border rounded">
                    <div className="text-lg font-bold">
                      {latestVital ? formatDuration(latestVital.duration) : 'N/A'}
                    </div>
                    <div className="text-sm text-muted-foreground">{vital}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {metrics.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            No performance metrics recorded yet. Interact with the application to see data.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default PerformanceMonitor;
