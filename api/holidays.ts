import type { UniversalRequest, UniversalResponse } from "./_utils";
import { getQueryParams, sendJsonResponse } from "./_utils";
import { Router } from "express";

interface CachedHolidays {
  timestamp: number;
  data: unknown[];
}

const holidayCache = new Map<string, CachedHolidays>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

export const SINGAPORE_HOLIDAYS_2026 = [
  { date: "2026-01-01", localName: "New Year's Day", name: "New Year's Day", countryCode: "SG" },
  { date: "2026-02-17", localName: "Chinese New Year", name: "Chinese New Year", countryCode: "SG" },
  { date: "2026-02-18", localName: "Chinese New Year", name: "Chinese New Year", countryCode: "SG" },
  { date: "2026-03-21", localName: "Hari Raya Puasa", name: "Hari Raya Puasa", countryCode: "SG" },
  { date: "2026-04-03", localName: "Good Friday", name: "Good Friday", countryCode: "SG" },
  { date: "2026-05-01", localName: "Labour Day", name: "Labour Day", countryCode: "SG" },
  { date: "2026-05-27", localName: "Hari Raya Haji", name: "Hari Raya Haji", countryCode: "SG" },
  { date: "2026-06-01", localName: "Vesak Day", name: "Vesak Day", countryCode: "SG" },
  { date: "2026-08-10", localName: "National Day", name: "National Day", countryCode: "SG" },
  { date: "2026-11-09", localName: "Deepavali", name: "Deepavali", countryCode: "SG" },
  { date: "2026-12-25", localName: "Christmas Day", name: "Christmas Day", countryCode: "SG" },
];

async function fetchPublicHolidaysFromProvider(year: number, countryCode: string): Promise<any[]> {
  const normalizedCountry = countryCode.toUpperCase();
  const cacheKey = `${year}:${normalizedCountry}`;
  const cached = holidayCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  const upstreamUrl = `https://date.nager.at/api/v3/PublicHolidays/${year}/${encodeURIComponent(normalizedCountry)}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4500);

  try {
    const response = await fetch(upstreamUrl, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "User-Agent": "OnThatDay-CosmicCalendar/1.0",
      },
    }).finally(() => clearTimeout(timer));

    if (response.ok) {
      const list = await response.json();
      if (Array.isArray(list) && list.length > 0) {
        holidayCache.set(cacheKey, { timestamp: Date.now(), data: list });
        return list;
      }
    }
  } catch (err) {
    console.warn(`Upstream holiday fetch failed for ${year}/${normalizedCountry}:`, err);
  }

  // Fallback to static data if SG & 2026 or return empty list without crashing
  if (normalizedCountry === "SG" && year === 2026) {
    return SINGAPORE_HOLIDAYS_2026;
  }

  return [];
}

/**
 * Parses parameters from both path patterns (/2026/SG) and query params (?year=2026&country=SG)
 */
function extractYearAndCountry(req: UniversalRequest): { year: number; countryCode: string; date?: string } {
  const query = getQueryParams(req);
  let year = 2026;
  let countryCode = (query.country || query.countryCode || "SG").trim().toUpperCase();
  let date = query.date ? query.date.trim() : undefined;

  // Check URL pathname for /api/holidays/:year/:countryCode
  const rawUrl = req.url || "";
  const pathname = rawUrl.split("?")[0];
  const segments = pathname.split("/").filter(Boolean);

  // E.g., ['api', 'holidays', '2026', 'SG'] or ['holidays', '2026', 'SG']
  const lastIndex = segments.length - 1;
  if (lastIndex >= 1) {
    const maybeCountry = segments[lastIndex];
    const maybeYear = parseInt(segments[lastIndex - 1], 10);
    if (/^[A-Z]{2}$/i.test(maybeCountry) && !isNaN(maybeYear) && maybeYear >= 1900 && maybeYear <= 2100) {
      year = maybeYear;
      countryCode = maybeCountry.toUpperCase();
    }
  }

  // Also check req.params if set by Express
  if (req.params?.year) {
    const parsedYear = parseInt(req.params.year, 10);
    if (!isNaN(parsedYear)) year = parsedYear;
  }
  if (req.params?.countryCode) {
    countryCode = req.params.countryCode.trim().toUpperCase();
  }

  if (query.year) {
    const parsedYear = parseInt(query.year, 10);
    if (!isNaN(parsedYear) && parsedYear >= 1900 && parsedYear <= 2100) {
      year = parsedYear;
    }
  }

  if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    year = parseInt(date.slice(0, 4), 10);
  }

  if (!/^[A-Z]{2}$/.test(countryCode)) {
    countryCode = "SG";
  }

  return { year, countryCode, date };
}

export async function handleHolidays(req: UniversalRequest, res: UniversalResponse) {
  if (req.method === "OPTIONS") {
    sendJsonResponse(res, 204, {});
    return;
  }

  try {
    const { year, countryCode, date } = extractYearAndCountry(req);
    const holidays = await fetchPublicHolidaysFromProvider(year, countryCode);

    if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
      const matched = holidays.find((h: any) => h.date === date) || null;
      sendJsonResponse(res, 200, {
        date,
        countryCode,
        year,
        isPublicHoliday: !!matched,
        holiday: matched,
        holidays,
      });
      return;
    }

    sendJsonResponse(res, 200, holidays);
  } catch (err) {
    console.error("Failed to query public holidays:", err);
    sendJsonResponse(res, 200, SINGAPORE_HOLIDAYS_2026);
  }
}

// Universal Serverless default export
export default async function holidaysHandler(req: any, res: any, next?: any) {
  try {
    await handleHolidays(req, res);
  } catch (err) {
    console.error("Unhandled error in Holidays handler:", err);
    sendJsonResponse(res, 200, SINGAPORE_HOLIDAYS_2026);
  }
}

// Support Express Router mounting
export const holidaysRouter = Router();
holidaysRouter.all("*", (req, res) => handleHolidays(req, res));
