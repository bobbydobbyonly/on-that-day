import type { Request, Response } from "express";
import { Router } from "express";

const router = Router();

interface CachedHolidays {
  timestamp: number;
  data: unknown[];
}

const holidayCache = new Map<string, CachedHolidays>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

async function fetchPublicHolidaysFromProvider(year: number, countryCode: string): Promise<{ status: number; data: unknown }> {
  const cacheKey = `${year}:${countryCode.toUpperCase()}`;
  const cached = holidayCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return { status: 200, data: cached.data };
  }

  const upstreamUrl = `https://date.nager.at/api/v3/PublicHolidays/${year}/${encodeURIComponent(countryCode.toUpperCase())}`;

  const response = await fetch(upstreamUrl, {
    headers: {
      Accept: "application/json",
      "User-Agent": "OnThatDay-CosmicCalendar/1.0",
    },
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    return {
      status: response.status,
      data: {
        error: `Upstream holiday provider responded with status ${response.status}`,
        details: errText || undefined,
      },
    };
  }

  const list = await response.json();
  if (Array.isArray(list)) {
    holidayCache.set(cacheKey, { timestamp: Date.now(), data: list });
  }

  return { status: 200, data: list };
}

// 1. Path-based route: /api/holidays/:year/:countryCode (e.g. /api/holidays/2026/SG)
export async function handleHolidaysByPath(req: Request, res: Response) {
  const { year: yearParam, countryCode: countryParam } = req.params;

  const year = parseInt(yearParam, 10);
  if (isNaN(year) || year < 1900 || year > 2100) {
    return res.status(400).json({ error: "Invalid year. Please provide a valid 4-digit year (1900-2100)." });
  }

  const countryCode = (countryParam || "SG").trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(countryCode)) {
    return res.status(400).json({ error: "Invalid country code. Must be a 2-letter ISO country code (e.g. SG, US, GB)." });
  }

  try {
    const result = await fetchPublicHolidaysFromProvider(year, countryCode);
    return res.status(result.status).json(result.data);
  } catch (err) {
    console.error("Failed to query public holidays:", err);
    return res.status(502).json({
      error: "Unable to reach public holidays provider",
      details: err instanceof Error ? err.message : "Unknown error",
    });
  }
}

// 2. Query-based route: /api/holidays?year=2026&country=SG or ?date=2026-08-10&country=SG
export async function handleHolidaysByQuery(req: Request, res: Response) {
  const countryQuery = (req.query.country || req.query.countryCode || "SG") as string;
  const countryCode = countryQuery.trim().toUpperCase();

  if (!/^[A-Z]{2}$/.test(countryCode)) {
    return res.status(400).json({ error: "Invalid country code. Must be a 2-letter ISO country code (e.g. SG, US, GB)." });
  }

  const dateQuery = req.query.date as string | undefined;
  let year: number;

  if (dateQuery && /^\d{4}-\d{2}-\d{2}$/.test(dateQuery.trim())) {
    year = parseInt(dateQuery.trim().slice(0, 4), 10);
  } else if (req.query.year) {
    year = parseInt(req.query.year as string, 10);
  } else {
    year = 2026; // Default to 2026 as per user spec
  }

  if (isNaN(year) || year < 1900 || year > 2100) {
    return res.status(400).json({ error: "Invalid year. Please provide a valid 4-digit year (1900-2100)." });
  }

  try {
    const result = await fetchPublicHolidaysFromProvider(year, countryCode);

    if (result.status !== 200 || !Array.isArray(result.data)) {
      return res.status(result.status).json(result.data);
    }

    const holidays = result.data as Array<{ date: string; name: string; localName: string; countryCode: string }>;

    // If a specific date was queried, provide both enriched holiday detection and full list
    if (dateQuery && /^\d{4}-\d{2}-\d{2}$/.test(dateQuery.trim())) {
      const targetDate = dateQuery.trim();
      const matched = holidays.find((h) => h.date === targetDate) || null;

      return res.status(200).json({
        date: targetDate,
        countryCode,
        year,
        isPublicHoliday: !!matched,
        holiday: matched,
        holidays,
      });
    }

    // Default: return raw array matching upstream Date Nager schema
    return res.status(200).json(holidays);
  } catch (err) {
    console.error("Failed to query public holidays:", err);
    return res.status(502).json({
      error: "Unable to reach public holidays provider",
      details: err instanceof Error ? err.message : "Unknown error",
    });
  }
}

router.get("/:year/:countryCode", handleHolidaysByPath);
router.get("/", handleHolidaysByQuery);

export default router;
