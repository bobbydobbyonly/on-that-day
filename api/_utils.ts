import type { IncomingMessage, ServerResponse } from "http";

export interface UniversalRequest extends IncomingMessage {
  query?: any;
  params?: any;
  body?: any;
  method?: string;
  url?: string;
  path?: string;
}

export interface UniversalResponse extends ServerResponse {
  status?: (code: number) => UniversalResponse;
  json?: (data: any) => UniversalResponse | void;
  send?: (data: any) => UniversalResponse | void;
  set?: (field: string, val: string) => UniversalResponse;
}

/**
 * Safely parse query parameters from either req.query (Express/Vercel)
 * or by parsing req.url.
 */
export function getQueryParams(req: UniversalRequest): Record<string, string> {
  const params: Record<string, string> = {};

  // 1. If Express or Vercel already populated req.query
  if (req.query && typeof req.query === "object") {
    for (const [key, value] of Object.entries(req.query)) {
      if (typeof value === "string") {
        params[key] = value;
      } else if (Array.isArray(value) && value.length > 0 && typeof value[0] === "string") {
        params[key] = value[0];
      }
    }
  }

  // 2. Parse from req.url as a fallback/enrichment
  if (req.url) {
    try {
      const url = new URL(req.url, "http://localhost");
      url.searchParams.forEach((val, key) => {
        if (!params[key]) {
          params[key] = val;
        }
      });
    } catch {
      // Ignore URL parsing errors
    }
  }

  return params;
}

/**
 * Safely extract and parse JSON body across Express, Vercel, and raw Node.js runtimes.
 */
export async function getRequestBody<T = any>(req: UniversalRequest): Promise<T | null> {
  if (req.body !== undefined && req.body !== null) {
    if (typeof req.body === "object") {
      return req.body as T;
    }
    if (typeof req.body === "string" && req.body.trim()) {
      try {
        return JSON.parse(req.body) as T;
      } catch {
        return null;
      }
    }
  }

  // If body is in a readable stream (raw Node.js / Lambda)
  if (req.method === "POST" || req.method === "PUT" || req.method === "PATCH") {
    try {
      const chunks: Buffer[] = [];
      for await (const chunk of req) {
        chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
      }
      if (chunks.length > 0) {
        const rawString = Buffer.concat(chunks).toString("utf8");
        if (rawString.trim()) {
          return JSON.parse(rawString) as T;
        }
      }
    } catch {
      return null;
    }
  }

  return null;
}

/**
 * Universally send a JSON response whether in Express, Vercel, or native Node.js HTTP.
 */
export function sendJsonResponse(res: UniversalResponse, statusCode: number, data: any): void {
  // Add CORS headers for serverless cross-origin safety
  if (typeof res.setHeader === "function") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Content-Type", "application/json; charset=utf-8");
  }

  // If Express-like res.status().json() is available
  if (typeof res.status === "function" && typeof res.json === "function") {
    res.status(statusCode).json(data);
    return;
  }

  // Raw Node HTTP ServerResponse fallback
  try {
    res.statusCode = statusCode;
    res.end(JSON.stringify(data));
  } catch (err) {
    console.error("Failed to write serverless response:", err);
  }
}
