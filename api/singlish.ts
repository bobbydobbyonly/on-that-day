import { Router } from "express";
import { GoogleGenAI } from "@google/genai";

const singlishRouter = Router();

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

export interface SinglishResponseData {
  translation: string;
  summary: string;
  quote: string;
  singlish: string;
  source: "gemini" | "fallback";
}

const RELATABLE_SINGAPORE_QUOTES = [
  "Steady pom pi pi — even when stars explode across the galaxy, the universe keeps its cool.",
  "Good things must share — ancient starlight traveled thousands of years just for us to marvel at tonight.",
  "Small red dot on Earth, but our curiosity reaches to the far edges of the cosmic sky.",
  "Slowly slowly catch monkey — cosmic wonders take millions of years to form, so don't rush through life.",
  "Life is like a steaming cup of kopi-o — deep, rich, and best appreciated under a quiet starry night.",
  "No matter how crowded our MRT or busy our day, there is always infinite breathing room in the cosmos.",
  "Just like waiting for your favorite hawker food, the universe's greatest sights take time to simmer.",
  "Look up at the stars and relak one corner — our worries are tiny compared to the big wide universe."
];

/**
 * Fallback Singlish transformer and astronomical commentary generator.
 * Clean, non-repetitive, zero vulgarities.
 */
function generateFallbackSinglish(title: string, date: string, explanation: string): SinglishResponseData {
  const cleanExp = explanation.replace(/^Explanation:\s*/i, "").trim();

  // Non-repetitive sentence-level Singlish conversion
  const sentences = cleanExp.split(/(?<=[.?!])\s+/);
  const translated = sentences.map((sentence, idx) => {
    let s = sentence
      .replace(/\bIn this image\b/gi, "Looking at this picture")
      .replace(/\bThis image shows\b/gi, "This photo is showing")
      .replace(/\bAstronomers believe\b/gi, "Astronomers reckon that")
      .replace(/\bAstronomers have found\b/gi, "The astronomers discovered")
      .replace(/\bScientists discovered\b/gi, "Scientists found out")
      .replace(/\bLight-years away\b/gi, "light-years away from Earth")
      .replace(/\bMillion years\b/gi, "millions of years")
      .replace(/\bBillions of years\b/gi, "billions of years")
      .replace(/\bVery hot\b/gi, "super hot, even hotter than Singapore afternoon sun")
      .replace(/\bVery bright\b/gi, "really bright and glowing")
      .replace(/\bVery large\b/gi, "massive until cannot imagine")
      .replace(/\bBlack hole\b/gi, "superdense black hole")
      .replace(/\bSupernova\b/gi, "supernova star explosion")
      .replace(/\bTelescope\b/gi, "observatory telescope")
      .replace(/\bIn fact,\b/gi, "Actually,")
      .replace(/\bHowever,\b/gi, "However hor,")
      .replace(/\bTherefore,\b/gi, "So basically,")
      .replace(/\bAs a result,\b/gi, "Because of that,");

    // Add mild natural sentence particles periodically, not on every sentence
    if (idx === 0 && !s.endsWith("lah.") && !s.endsWith("leh.")) {
      s = s.replace(/\.$/, " lah.");
    } else if (idx === 2 && !s.endsWith("lor.")) {
      s = s.replace(/\.$/, " lor.");
    }
    return s;
  });

  const translationText = translated.join(" ");

  // Deterministic quote selection based on date string hash
  let hash = 0;
  for (let i = 0; i < date.length; i++) {
    hash = (hash * 31 + date.charCodeAt(i)) % RELATABLE_SINGAPORE_QUOTES.length;
  }
  const quote = RELATABLE_SINGAPORE_QUOTES[Math.abs(hash)];
  const summary = `NASA captured "${title}" on ${date}, showing us the deep beauty of celestial physics at work.`;

  const singlishCombined = `${translationText}\n\n🇸🇬 **Relatable Singapore Saying:**\n"${quote}"\n\n**Quick Takeaway:** ${summary}`;

  return {
    translation: translationText,
    summary,
    quote,
    singlish: singlishCombined,
    source: "fallback",
  };
}

singlishRouter.post("/", async (req, res) => {
  try {
    const { title = "Cosmic Sky", date = "", explanation = "" } = req.body || {};

    if (!explanation || typeof explanation !== "string") {
      res.status(400).json({ error: "Missing explanation text in request body" });
      return;
    }

    const ai = getAiClient();

    if (ai) {
      try {
        const prompt = `Title: ${title}\nDate: ${date}\nNASA Explanation: ${explanation}\n\nPlease translate this NASA explanation into authentic, respectful Singapore Singlish and provide a relatable Singaporean saying/quote summary.`;

        const response = await ai.models.generateContent({
          model: "gemini-3.1-flash-lite",
          contents: prompt,
          config: {
            systemInstruction: `You are an expert science communicator translating NASA Astronomy Picture of the Day (APOD) explanations into authentic, respectful Singapore Singlish (Colloquial Singapore English).

STRICT REQUIREMENTS:
1. LANGUAGE DEFINITION: Singlish is English-based (Singapore Colloquial English). The translation MUST be written primarily in English with distinctive Singaporean sentence structures, colloquial phrasing, and sentence-final particles (lah, leh, lor, hor, meh, sia). DO NOT write in pure Malay or Bahasa Melayu.
2. TRANSLATION FIRST: Your primary job is to faithfully translate the NASA explanation. Accurately preserve all scientific facts, celestial names, distances, time periods, and physical processes.
3. NO REPETITION: Do NOT repeat catchphrases or particles repeatedly. Avoid overusing "wah lau", "don't play play", "sibei", or "steady". Write with smooth, natural Singapore English syntax, using particles like 'lah', 'leh', 'lor', 'hor', 'sia' only where they naturally fit conversational speech.
4. ZERO VULGARITIES: Strictly clean, polite, family-friendly language. No crude dialect terms, swear words, or offensive words under any circumstances.
5. SINGAPORE QUOTE / SAYING: Create 1 memorable, relatable Singaporean saying or life quote (in clean colloquial Singapore English or English with relatable local context) that meaningfully connects this celestial phenomenon to daily life / local wisdom (e.g. referencing steady pom pi pi, kopi breaks, hawker patience, small red dot big universe, cherishing light).
6. SUMMARY: 1-2 sentence concise Singapore English summary of the astronomy behind this image.`,
            responseMimeType: "application/json",
            responseSchema: {
              type: "object",
              properties: {
                translation: {
                  type: "string",
                  description: "Faithful Singlish translation of the NASA explanation. Clear, engaging, not repetitive, zero vulgarities.",
                },
                summary: {
                  type: "string",
                  description: "1-2 sentence Singlish summary of the astronomy.",
                },
                quote: {
                  type: "string",
                  description: "A relatable, memorable Singaporean saying or life quote connecting this cosmic wonder to daily life.",
                },
              },
              required: ["translation", "summary", "quote"],
            },
            temperature: 0.5,
          },
        });

        const rawText = response.text;
        if (rawText && rawText.trim().length > 0) {
          try {
            const parsed = JSON.parse(rawText);
            if (parsed && parsed.translation && parsed.quote) {
              const combined = `${parsed.translation.trim()}\n\n🇸🇬 **Relatable Singapore Saying:**\n"${parsed.quote.trim()}"\n\n**Quick Takeaway:** ${parsed.summary?.trim() || ""}`;

              res.json({
                translation: parsed.translation.trim(),
                summary: parsed.summary?.trim() || "",
                quote: parsed.quote.trim(),
                singlish: combined,
                source: "gemini",
              });
              return;
            }
          } catch (jsonErr) {
            console.warn("Failed to parse Gemini JSON output:", jsonErr, rawText);
          }
        }
      } catch (geminiError) {
        console.warn("Gemini API call for Singlish failed, falling back to generator:", geminiError);
      }
    }

    // Fallback generator
    const fallbackData = generateFallbackSinglish(title, date, explanation);
    res.json(fallbackData);
  } catch (error) {
    console.error("Error processing Singlish translation:", error);
    res.status(500).json({ error: "Failed to generate Singlish explanation" });
  }
});

export default singlishRouter;
