/**
 * Performance monitoring utilities for tracking application performance
 */

export interface PerformanceMetrics {
  name: string;
  duration: number;
  startTime: number;
  endTime: number;
  metadata?: Record<string, unknown>;
}

class PerformanceMonitor {
  private timers: Map<string, number | Record<string, unknown>> = new Map();
  private metrics: PerformanceMetrics[] = [];
  private isEnabled: boolean;

  constructor() {
    this.isEnabled = typeof window !== "undefined" && "performance" in window;
  }

  /**
   * Start timing an operation
   */
  start(name: string, metadata?: Record<string, unknown>): void {
    if (!this.isEnabled) return;

    const startTime = performance.now();
    this.timers.set(name, startTime);

    // Store metadata for later use
    if (metadata) {
      this.timers.set(`${name}_metadata`, metadata);
    }
  }

  /**
   * End timing an operation and record the metric
   */
  end(name: string): PerformanceMetrics | null {
    if (!this.isEnabled) return null;

    const endTime = performance.now();
    const startTimeValue = this.timers.get(name);

    if (!startTimeValue || typeof startTimeValue !== "number") {
      console.warn(`Performance timer '${name}' was not started`);
      return null;
    }

    const duration = endTime - startTimeValue;
    const metadata = this.timers.get(`${name}_metadata`) as Record<
      string,
      unknown
    >;

    const metric: PerformanceMetrics = {
      name,
      duration,
      startTime: startTimeValue,
      endTime,
      metadata,
    };

    this.metrics.push(metric);

    // Clean up
    this.timers.delete(name);
    this.timers.delete(`${name}_metadata`);

    // Log slow operations in development
    if (process.env.NODE_ENV === "development" && duration > 1000) {
      console.warn(
        `⚠️ Slow operation detected: ${name} took ${duration.toFixed(2)}ms`
      );
    }

    return metric;
  }

  /**
   * Measure a function execution time
   */
  async measure<T>(
    name: string,
    fn: () => T | Promise<T>,
    metadata?: Record<string, unknown>
  ): Promise<T> {
    this.start(name, metadata);
    try {
      const result = await fn();
      this.end(name);
      return result;
    } catch (error) {
      this.end(name);
      throw error;
    }
  }

  /**
   * Get all recorded metrics
   */
  getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  /**
   * Get metrics by name pattern
   */
  getMetricsByName(pattern: string | RegExp): PerformanceMetrics[] {
    const regex = typeof pattern === "string" ? new RegExp(pattern) : pattern;
    return this.metrics.filter((metric) => regex.test(metric.name));
  }

  /**
   * Get performance summary
   */
  getSummary(): {
    totalOperations: number;
    averageDuration: number;
    slowestOperation: PerformanceMetrics | null;
    fastestOperation: PerformanceMetrics | null;
  } {
    if (this.metrics.length === 0) {
      return {
        totalOperations: 0,
        averageDuration: 0,
        slowestOperation: null,
        fastestOperation: null,
      };
    }

    const durations = this.metrics.map((m) => m.duration);
    const totalDuration = durations.reduce((sum, d) => sum + d, 0);
    const averageDuration = totalDuration / this.metrics.length;

    const slowestOperation = this.metrics.reduce((prev, current) =>
      prev.duration > current.duration ? prev : current
    );

    const fastestOperation = this.metrics.reduce((prev, current) =>
      prev.duration < current.duration ? prev : current
    );

    return {
      totalOperations: this.metrics.length,
      averageDuration,
      slowestOperation,
      fastestOperation,
    };
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics = [];
    this.timers.clear();
  }

  /**
   * Export metrics for analysis
   */
  export(): string {
    return JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        userAgent:
          typeof navigator !== "undefined" ? navigator.userAgent : "server",
        metrics: this.metrics,
        summary: this.getSummary(),
      },
      null,
      2
    );
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * React hook for performance monitoring
 */
export function usePerformanceMonitor() {
  const start = (name: string, metadata?: Record<string, unknown>) => {
    performanceMonitor.start(name, metadata);
  };

  const end = (name: string) => {
    return performanceMonitor.end(name);
  };

  const measure = async <T>(
    name: string,
    fn: () => T | Promise<T>,
    metadata?: Record<string, unknown>
  ) => {
    return performanceMonitor.measure(name, fn, metadata);
  };

  return { start, end, measure };
}

/**
 * Performance decorator for class methods
 */
export function measurePerformance(name?: string) {
  return function (
    target: Record<string, unknown>,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const measureName = name || `${target.constructor.name}.${propertyKey}`;

    descriptor.value = async function (...args: unknown[]) {
      return performanceMonitor.measure(measureName, () =>
        originalMethod.apply(this, args)
      );
    };

    return descriptor;
  };
}

/**
 * Web Vitals monitoring
 */
export function initWebVitals() {
  if (typeof window === "undefined") return;

  // Cumulative Layout Shift (CLS)
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      // For Layout Shift entries that have hadRecentInput property
      const layoutShiftEntry = entry as unknown as { hadRecentInput?: boolean };
      if (!layoutShiftEntry.hadRecentInput) {
        performanceMonitor.start("CLS");
        performanceMonitor.end("CLS");
      }
    }
  }).observe({ type: "layout-shift", buffered: true });

  // Largest Contentful Paint (LCP)
  new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1];

    performanceMonitor.metrics.push({
      name: "LCP",
      duration: lastEntry.startTime,
      startTime: 0,
      endTime: lastEntry.startTime,
      metadata: { size: (lastEntry as unknown as { size: number }).size },
    });
  }).observe({ type: "largest-contentful-paint", buffered: true });

  // First Input Delay (FID)
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      // For First Input entries that have processingStart property
      const fidEntry = entry as unknown as {
        processingStart: number;
        startTime: number;
      };
      const fid = fidEntry.processingStart - fidEntry.startTime;
      performanceMonitor.metrics.push({
        name: "FID",
        duration: fid,
        startTime: fidEntry.startTime,
        endTime: fidEntry.processingStart,
      });
    }
  }).observe({ type: "first-input", buffered: true });
}

/**
 * API performance monitoring middleware
 */
export function withPerformanceMonitoring<
  T extends (...args: unknown[]) => unknown
>(fn: T, name?: string): T {
  return (async (...args: unknown[]) => {
    const operationName = name || fn.name || "anonymous";
    return performanceMonitor.measure(operationName, () => fn(...args));
  }) as T;
}

export default performanceMonitor;
