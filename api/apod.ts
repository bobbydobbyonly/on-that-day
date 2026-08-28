import type { UniversalRequest, UniversalResponse } from "./_utils";
import { getQueryParams, sendJsonResponse } from "./_utils";
import { Router } from "express";

export async function handleApod(req: UniversalRequest, res: UniversalResponse) {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    sendJsonResponse(res, 204, {});
    return;
  }

  const query = getQueryParams(req);
  const apiKey = (process.env.NASA_API_KEY && process.env.NASA_API_KEY.trim())
    ? process.env.NASA_API_KEY.trim()
    : "DEMO_KEY";

  const { date, hd, thumbs } = query;

  try {
    const targetUrl = new URL("https://api.nasa.gov/planetary/apod");
    targetUrl.searchParams.set("api_key", apiKey);

    if (date && date.trim()) {
      targetUrl.searchParams.set("date", date.trim());
    }
    if (hd && hd.trim()) {
      targetUrl.searchParams.set("hd", hd.trim());
    }
    if (thumbs && thumbs.trim()) {
      targetUrl.searchParams.set("thumbs", thumbs.trim());
    }

    // Set timeout to prevent serverless function hanging
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 7000);

    const response = await fetch(targetUrl.toString(), {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "User-Agent": "OnThatDay-NASA-APOD/1.0",
      },
    }).finally(() => clearTimeout(timer));

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      sendJsonResponse(res, response.status || 500, data || {
        error: "NASA APOD API provider responded with an error",
        status: response.status,
      });
      return;
    }

    sendJsonResponse(res, 200, data);
  } catch (err) {
    console.error("Failed to query NASA APOD API:", err);
    sendJsonResponse(res, 502, {
      error: "Unable to reach NASA APOD provider",
      details: err instanceof Error ? err.message : "Unknown network error",
    });
  }
}

// Universal Serverless default export
export default async function apodHandler(req: any, res: any, next?: any) {
  try {
    await handleApod(req, res);
  } catch (err) {
    console.error("Unhandled error in APOD handler:", err);
    sendJsonResponse(res, 500, {
      error: "Internal Server Error in APOD endpoint",
      details: err instanceof Error ? err.message : String(err),
    });
  }
}

// Support Express Router mounting
export const apodRouter = Router();
apodRouter.all("*", (req, res) => handleApod(req, res));
