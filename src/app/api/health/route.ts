import { checkDbHealth, getDbConnectionInfo } from "@/lib/db/connect";
import { withSecurity } from "@/lib/security";
import { createApiSuccess, handleApiError } from "@/lib/api";
import { HealthCheckResponse } from "@/types/api";

/**
 * Health check endpoint for monitoring database connectivity
 * GET /api/health
 */
export const GET = withSecurity(
  async () => {
    try {
      const startTime = Date.now();
      
      // Check database health
      const isDbHealthy = await checkDbHealth();
      const dbInfo = getDbConnectionInfo();
      
      const responseTime = Date.now() - startTime;
      
      const healthData: HealthCheckResponse = {
        status: isDbHealthy ? "healthy" : "unhealthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: {
          status: dbInfo.status,
          host: dbInfo.host ?? undefined,
          name: dbInfo.name ?? undefined,
          healthy: isDbHealthy,
        },
        performance: {
          responseTime: `${responseTime}ms`,
        },
        environment: {
          nodeEnv: process.env.NODE_ENV || 'development',
          nodeVersion: process.version,
        },
      };

      // Return appropriate HTTP status based on health
      const statusCode = isDbHealthy ? 200 : 503;
      
      return createApiSuccess(
        healthData,
        isDbHealthy ? "System is healthy" : "System is unhealthy",
        statusCode
      );
    } catch (error) {
      return handleApiError(error, "health-check");
    }
  },
  {
    rateLimit: { limit: 60, windowMs: 60 * 1000 }, // 60 requests per minute
    allowCORS: true,
  }
);
