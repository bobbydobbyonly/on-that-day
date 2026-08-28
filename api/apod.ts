import type { Request, Response } from "express";
import { Router } from "express";

const router = Router();

export async function handleApod(req: Request, res: Response) {
  const apiKey = process.env.NASA_API_KEY;

  if (!apiKey || !apiKey.trim()) {
    return res.status(500).json({ error: "credential not configured" });
  }

  const { date, hd, thumbs } = req.query;

  try {
    const targetUrl = new URL("https://api.nasa.gov/planetary/apod");
    targetUrl.searchParams.set("api_key", apiKey.trim());

    if (typeof date === "string" && date.trim()) {
      targetUrl.searchParams.set("date", date.trim());
    }
    if (typeof hd === "string" && hd.trim()) {
      targetUrl.searchParams.set("hd", hd.trim());
    }
    if (typeof thumbs === "string" && thumbs.trim()) {
      targetUrl.searchParams.set("thumbs", thumbs.trim());
    }

    const response = await fetch(targetUrl.toString());
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return res.status(response.status).json(
        data || { error: "NASA APOD API responded with an error" }
      );
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error("Failed to query NASA APOD API:", err);
    return res.status(502).json({
      error: "Unable to reach NASA APOD provider",
      details: err instanceof Error ? err.message : "Unknown error",
    });
  }
}

router.get("/", handleApod);

export default router;
