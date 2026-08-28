import type { UniversalRequest, UniversalResponse } from "./_utils";
import { sendJsonResponse } from "./_utils";
import { Router } from "express";
import apodHandler, { apodRouter } from "./apod";
import holidaysHandler, { holidaysRouter } from "./holidays";
import singlishHandler, { singlishRouter } from "./singlish";
import healthHandler, { healthRouter } from "./health";

const apiRouter = Router();

apiRouter.use("/apod", apodRouter);
apiRouter.use("/planetary/apod", apodRouter);
apiRouter.use("/holidays", holidaysRouter);
apiRouter.use("/public-holidays", holidaysRouter);
apiRouter.use("/PublicHolidays", holidaysRouter);
apiRouter.use("/singlish", singlishRouter);
apiRouter.use("/health", healthRouter);

export async function handleApiIndex(req: UniversalRequest, res: UniversalResponse) {
  const rawUrl = req.url || "";
  if (rawUrl.includes("/apod")) {
    return apodHandler(req, res);
  }
  if (rawUrl.includes("/holiday") || rawUrl.includes("/PublicHolidays")) {
    return holidaysHandler(req, res);
  }
  if (rawUrl.includes("/singlish")) {
    return singlishHandler(req, res);
  }
  if (rawUrl.includes("/health")) {
    return healthHandler(req, res);
  }

  sendJsonResponse(res, 200, {
    app: "On That Day - Astronomy Picture of the Day API",
    status: "online",
    endpoints: {
      apod: "/api/apod?date=YYYY-MM-DD",
      holidays: "/api/holidays/:year/:countryCode (or /api/holidays?date=YYYY-MM-DD)",
      singlish: "/api/singlish (POST with JSON body { title, date, explanation })",
      health: "/api/health",
    },
    version: "1.0.0",
  });
}

// Universal Serverless default export
export default async function handler(req: any, res: any, next?: any) {
  // If Express is passing through
  if (typeof next === "function" && req.baseUrl) {
    return apiRouter(req, res, next);
  }
  return handleApiIndex(req, res);
}

export { apiRouter };
