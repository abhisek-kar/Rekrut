"use client";

import { useCallback } from "react";
import { clientLogger } from "@/lib/logger";

/**
 * Client-side logging hook for React components
 */
export function useLogger() {
  const debug = useCallback(
    (message: string, context?: Record<string, unknown>) => {
      clientLogger.debug(message, context);
    },
    []
  );

  const info = useCallback(
    (message: string, context?: Record<string, unknown>) => {
      clientLogger.info(message, context);
    },
    []
  );

  const warn = useCallback(
    (message: string, context?: Record<string, unknown>) => {
      clientLogger.warn(message, context);
    },
    []
  );

  const error = useCallback(
    (message: string, error?: Error, context?: Record<string, unknown>) => {
      clientLogger.error(message, error, context);
    },
    []
  );

  // Component-specific logging methods
  const logUserAction = useCallback(
    (action: string, details?: Record<string, unknown>) => {
      info(`User action: ${action}`, { action, ...details } as Record<
        string,
        unknown
      >);
    },
    [info]
  );

  const logError = useCallback(
    (component: string, err: Error, context?: Record<string, unknown>) => {
      error(`Component error in ${component}`, err, {
        component,
        ...context,
      } as Record<string, unknown>);
    },
    [error]
  );

  const logPerformance = useCallback(
    (
      operation: string,
      duration: number,
      context?: Record<string, unknown>
    ) => {
      const level = duration > 1000 ? "warn" : "debug";
      const logger = level === "warn" ? warn : debug;
      logger(`Performance: ${operation} took ${duration}ms`, {
        operation,
        duration,
        ...context,
      } as Record<string, unknown>);
    },
    [warn, debug]
  );

  const logNavigation = useCallback(
    (from: string, to: string, context?: Record<string, unknown>) => {
      debug(`Navigation: ${from} → ${to}`, { from, to, ...context } as Record<
        string,
        unknown
      >);
    },
    [debug]
  );

  return {
    debug,
    info,
    warn,
    error,
    logUserAction,
    logError,
    logPerformance,
    logNavigation,
  };
}

/**
 * Performance measurement hook with automatic logging
 */
export function usePerformanceLogger() {
  const { logPerformance } = useLogger();

  const measureAsync = useCallback(
    async <T>(
      operation: string,
      asyncFn: () => Promise<T>,
      context?: Record<string, unknown>
    ): Promise<T> => {
      const startTime = performance.now();
      try {
        const result = await asyncFn();
        const duration = performance.now() - startTime;
        logPerformance(operation, duration, context);
        return result;
      } catch (error) {
        const duration = performance.now() - startTime;
        logPerformance(`${operation} (failed)`, duration, {
          ...(context || {}),
          error,
        } as Record<string, unknown>);
        throw error;
      }
    },
    [logPerformance]
  );

  const measure = useCallback(
    <T>(
      operation: string,
      fn: () => T,
      context?: Record<string, unknown>
    ): T => {
      const startTime = performance.now();
      try {
        const result = fn();
        const duration = performance.now() - startTime;
        logPerformance(operation, duration, context);
        return result;
      } catch (error) {
        const duration = performance.now() - startTime;
        logPerformance(`${operation} (failed)`, duration, {
          ...(context || {}),
          error,
        } as Record<string, unknown>);
        throw error;
      }
    },
    [logPerformance]
  );

  return {
    measureAsync,
    measure,
  };
}
