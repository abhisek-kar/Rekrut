import { NextResponse } from "next/server";
import { getFeatureFlags } from "@/lib/env";
import { checkDbHealth, getDbConnectionInfo } from "@/lib/db/connect";

/**
 * System status endpoint showing environment and feature configuration
 * GET /api/status
 */
export async function GET() {
  try {
    const featureFlags = getFeatureFlags();
    const dbInfo = getDbConnectionInfo();
    const isDbHealthy = await checkDbHealth();
    
    const status = {
      status: "ok",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      features: {
        email: featureFlags.emailEnabled,
        fileUpload: featureFlags.s3Enabled,
        adminSeeding: featureFlags.adminSeedingEnabled,
      },
      database: {
        ...dbInfo,
        healthy: isDbHealthy,
      },
      uptime: process.uptime(),
    };

    return NextResponse.json(status, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
  } catch (error) {
    console.error("Status check failed:", error);
    
    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        error: "Status check failed",
        environment: process.env.NODE_ENV,
      },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      }
    );
  }
}
