"use client";

import { useState, useEffect } from 'react';

interface DbHealthStatus {
  status: 'healthy' | 'unhealthy' | 'loading' | 'error';
  timestamp?: string;
  database?: {
    status: string;
    healthy: boolean;
    host?: string | null;
    name?: string | null;
  };
  performance?: {
    responseTime: string;
  };
  error?: string;
}

/**
 * Hook to monitor database health status
 */
export function useDbHealth(intervalMs: number = 30000) {
  const [healthStatus, setHealthStatus] = useState<DbHealthStatus>({
    status: 'loading'
  });

  const checkHealth = async () => {
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      
      setHealthStatus({
        status: response.ok ? 'healthy' : 'unhealthy',
        ...data
      });
    } catch (error) {
      setHealthStatus({
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  useEffect(() => {
    // Initial check
    checkHealth();

    // Set up interval for periodic checks
    const interval = setInterval(checkHealth, intervalMs);

    // Cleanup
    return () => clearInterval(interval);
  }, [intervalMs]);

  return {
    healthStatus,
    refreshHealth: checkHealth
  };
}

/**
 * Simple hook to check if database is healthy
 */
export function useDbConnectivity() {
  const { healthStatus } = useDbHealth(60000); // Check every minute
  
  return {
    isHealthy: healthStatus.status === 'healthy',
    isLoading: healthStatus.status === 'loading',
    hasError: healthStatus.status === 'error' || healthStatus.status === 'unhealthy',
    status: healthStatus.status
  };
}
