export interface HealthCheckServiceStatus {
  status: "configured" | "demo_mode" | "missing_key" | "available" | "unavailable";
  details?: string;
  configured: boolean;
}

export interface HealthCheckResponse {
  status: "ok" | "degraded" | "error";
  app: string;
  version: string;
  timestamp: string;
  uptimeSeconds: number;
  environment: string;
  services: {
    nasaApod: HealthCheckServiceStatus;
    geminiAi: HealthCheckServiceStatus;
    holidaysProvider: HealthCheckServiceStatus;
  };
  system: {
    nodeVersion: string;
    platform: string;
    memoryUsageMB: {
      rss: number;
      heapTotal: number;
      heapUsed: number;
    };
  };
}

/**
 * Check the health status of the API server.
 * @param baseUrl Optional base URL (defaults to current origin in browser or relative /api/health)
 */
export async function checkApiHealth(baseUrl = ""): Promise<HealthCheckResponse> {
  const cleanBase = baseUrl.replace(/\/$/, "");
  const targetUrl = cleanBase ? `${cleanBase}/api/health` : "/api/health";

  const response = await fetch(targetUrl, {
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Health check request failed with HTTP ${response.status}: ${response.statusText}`);
  }

  const data: HealthCheckResponse = await response.json();
  return data;
}

/**
 * Simple boolean probe for API availability.
 */
export async function isApiHealthy(baseUrl = ""): Promise<boolean> {
  try {
    const health = await checkApiHealth(baseUrl);
    return health.status === "ok";
  } catch {
    return false;
  }
}
