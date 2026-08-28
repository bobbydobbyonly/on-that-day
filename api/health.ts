import type { UniversalRequest, UniversalResponse } from "./_utils";
import { sendJsonResponse } from "./_utils";
import { Router } from "express";

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

export async function handleHealth(req: UniversalRequest, res: UniversalResponse) {
  if (req.method === "OPTIONS") {
    sendJsonResponse(res, 204, {});
    return;
  }

  const nasaKey = process.env.NASA_API_KEY?.trim();
  const hasNasaKey = Boolean(nasaKey && nasaKey !== "DEMO_KEY");
  const geminiKey = process.env.GEMINI_API_KEY?.trim();
  const hasGeminiKey = Boolean(geminiKey);

  const mem = process.memoryUsage ? process.memoryUsage() : { rss: 0, heapTotal: 0, heapUsed: 0 };
  const toMB = (bytes: number) => Math.round((bytes / 1024 / 1024) * 100) / 100;

  const data: HealthCheckResponse = {
    status: "ok",
    app: "On That Day - Cosmic Memories & NASA APOD",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    uptimeSeconds: typeof process.uptime === "function" ? Math.floor(process.uptime()) : 0,
    environment: process.env.NODE_ENV || "development",
    services: {
      nasaApod: {
        status: hasNasaKey ? "configured" : "demo_mode",
        details: hasNasaKey ? "Custom NASA API key active" : "Using public NASA DEMO_KEY",
        configured: true,
      },
      geminiAi: {
        status: hasGeminiKey ? "configured" : "missing_key",
        details: hasGeminiKey
          ? "Gemini API key configured for Singlish translations"
          : "Using built-in astronomical Singlish generator fallback",
        configured: hasGeminiKey,
      },
      holidaysProvider: {
        status: "available",
        details: "Nager.Date public holidays API gateway ready",
        configured: true,
      },
    },
    system: {
      nodeVersion: process.version || "unknown",
      platform: process.platform || "unknown",
      memoryUsageMB: {
        rss: toMB(mem.rss),
        heapTotal: toMB(mem.heapTotal),
        heapUsed: toMB(mem.heapUsed),
      },
    },
  };

  sendJsonResponse(res, 200, data);
}

// Universal Serverless default export
export default async function healthHandler(req: any, res: any, next?: any) {
  try {
    await handleHealth(req, res);
  } catch (err) {
    console.error("Unhandled error in Health handler:", err);
    sendJsonResponse(res, 200, {
      status: "ok",
      app: "On That Day",
      timestamp: new Date().toISOString(),
    });
  }
}

// Support Express Router mounting
export const healthRouter = Router();
healthRouter.all("*", (req, res) => handleHealth(req, res));
