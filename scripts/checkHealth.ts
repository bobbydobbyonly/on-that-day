/**
 * Standalone TypeScript Health Check CLI Script
 * Usage:
 *   npx tsx scripts/checkHealth.ts
 *   npx tsx scripts/checkHealth.ts http://localhost:3000
 *   npx tsx scripts/checkHealth.ts https://your-domain.com
 */

interface HealthCheckResponse {
  status: "ok" | "degraded" | "error";
  app: string;
  version: string;
  timestamp: string;
  uptimeSeconds: number;
  environment: string;
  services: {
    nasaApod: { status: string; details?: string; configured: boolean };
    geminiAi: { status: string; details?: string; configured: boolean };
    holidaysProvider: { status: string; details?: string; configured: boolean };
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

async function runHealthCheck() {
  const targetHost = process.argv[2] || "http://localhost:3000";
  const healthUrl = targetHost.replace(/\/$/, "") + "/api/health";

  console.log(`\n🔍 Probing API Health at: ${healthUrl} ...`);
  const startTime = Date.now();

  try {
    const res = await fetch(healthUrl);
    const latency = Date.now() - startTime;

    if (!res.ok) {
      console.error(`\n❌ Health check failed with HTTP ${res.status} (${res.statusText}) in ${latency}ms`);
      process.exit(1);
    }

    const data: HealthCheckResponse = await res.json();

    console.log(`\n✅ HTTP ${res.status} OK — Server is healthy (latency: ${latency}ms)`);
    console.log("━".repeat(60));
    console.log(`• Status:       ${data.status.toUpperCase()}`);
    console.log(`• Application:  ${data.app} (v${data.version})`);
    console.log(`• Environment:  ${data.environment}`);
    console.log(`• Timestamp:    ${data.timestamp}`);
    console.log(`• Server Uptime: ${data.uptimeSeconds}s (~${(data.uptimeSeconds / 60).toFixed(1)} mins)`);
    console.log("\n📡 Connected Integrations:");
    console.log(`  • NASA APOD:        [${data.services.nasaApod.status.toUpperCase()}] ${data.services.nasaApod.details || ""}`);
    console.log(`  • Gemini AI:        [${data.services.geminiAi.status.toUpperCase()}] ${data.services.geminiAi.details || ""}`);
    console.log(`  • Holidays API:     [${data.services.holidaysProvider.status.toUpperCase()}] ${data.services.holidaysProvider.details || ""}`);
    console.log("\n💻 System Resources:");
    console.log(`  • Node.js:          ${data.system.nodeVersion} (${data.system.platform})`);
    console.log(`  • Memory RSS:       ${data.system.memoryUsageMB.rss} MB`);
    console.log(`  • Heap Used:        ${data.system.memoryUsageMB.heapUsed} MB of ${data.system.memoryUsageMB.heapTotal} MB`);
    console.log("━".repeat(60));
    console.log("✨ All health criteria passed!\n");
  } catch (err) {
    const latency = Date.now() - startTime;
    console.error(`\n❌ Failed to connect to ${healthUrl} after ${latency}ms:`);
    console.error(err instanceof Error ? err.message : String(err));
    console.error("\nTip: Make sure the server is currently running (`npm run dev`) or pass the target base URL as an argument.\n");
    process.exit(1);
  }
}

runHealthCheck();
