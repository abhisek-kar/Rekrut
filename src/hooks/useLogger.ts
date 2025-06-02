"use client";

import { useCallback } from 'react';
import { clientLogger } from '@/lib/logger';

/**
 * Client-side logging hook for React components
 */
export function useLogger() {
  const debug = useCallback((message: string, context?: any) => {
    clientLogger.debug(message, context);
  }, []);

  const info = useCallback((message: string, context?: any) => {
    clientLogger.info(message, context);
  }, []);

  const warn = useCallback((message: string, context?: any) => {
    clientLogger.warn(message, context);
  }, []);

  const error = useCallback((message: string, error?: Error, context?: any) => {
    clientLogger.error(message, error, context);
  }, []);

  // Component-specific logging methods
  const logUserAction = useCallback((action: string, details?: any) => {
    info(`User action: ${action}`, { action, ...details });
  }, [info]);

  const logError = useCallback((component: string, error: Error, context?: any) => {
    error(`Component error in ${component}`, error, { component, ...context });
  }, [error]);

  const logPerformance = useCallback((operation: string, duration: number, context?: any) => {
    const level = duration > 1000 ? 'warn' : 'debug';
    const logger = level === 'warn' ? warn : debug;
    logger(`Performance: ${operation} took ${duration}ms`, { operation, duration, ...context });
  }, [warn, debug]);

  const logNavigation = useCallback((from: string, to: string, context?: any) => {
    debug(`Navigation: ${from} → ${to}`, { from, to, ...context });
  }, [debug]);

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

  const measureAsync = useCallback(async <T>(
    operation: string,
    asyncFn: () => Promise<T>,
    context?: any
  ): Promise<T> => {
    const startTime = performance.now();
    try {
      const result = await asyncFn();
      const duration = performance.now() - startTime;
      logPerformance(operation, duration, context);
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      logPerformance(`${operation} (failed)`, duration, { ...context, error });
      throw error;
    }
  }, [logPerformance]);

  const measure = useCallback(<T>(
    operation: string,
    fn: () => T,
    context?: any
  ): T => {
    const startTime = performance.now();
    try {
      const result = fn();
      const duration = performance.now() - startTime;
      logPerformance(operation, duration, context);
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      logPerformance(`${operation} (failed)`, duration, { ...context, error });
      throw error;
    }
  }, [logPerformance]);

  return {
    measureAsync,
    measure,
  };
}
