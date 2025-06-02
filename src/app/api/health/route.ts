import { NextRequest, NextResponse } from "next/server";
import { checkDbHealth, getDbConnectionInfo } from "@/lib/db/connect";

/**
 * Health check endpoint for monitoring database connectivity
 * GET /api/health
 */
export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now();
    
    // Check database health
    const isDbHealthy = await checkDbHealth();
    const dbInfo = getDbConnectionInfo();
    
    const responseTime = Date.now() - startTime;
    
    const healthData = {
      status: isDbHealthy ? "healthy" : "unhealthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: {
        status: dbInfo.status,
        host: dbInfo.host,
        name: dbInfo.name,
        healthy: isDbHealthy,
      },
      performance: {
        responseTime: `${responseTime}ms`,
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        nodeVersion: process.version,
      },
    };

    // Return appropriate HTTP status based on health
    const statusCode = isDbHealthy ? 200 : 503;
    
    return NextResponse.json(healthData, { 
      status: statusCode,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
  } catch (error) {
    console.error("Health check failed:", error);
    
    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        error: "Health check failed",
        database: {
          status: "error",
          healthy: false,
        },
      },
      { 
        status: 503,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      }
    );
  }
}
