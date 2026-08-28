import type { UniversalRequest, UniversalResponse } from "./_utils";
import { getQueryParams, getRequestBody, sendJsonResponse } from "./_utils";
import { Router } from "express";
import { GoogleGenAI } from "@google/genai";

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key || key === "GEMINI_API_KEY") {
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

const SINGAPORE_HUMOR_QUOTES = [
  "Steady pom pi pi — even when giant stars explode in deep space, the universe still keeps its cool.",
  "Good things must share — this starlight travelled millions of light-years just to reach your screen tonight, so appreciate it!",
  "Singapore might be a little red dot, but our curiosity reaches all the way to the edge of the cosmos.",
  "Slowly slowly catch monkey — cosmic wonders take 500 million years to cook, so why you rushing your kopi?",
  "Life is like a cup of hot Kopi-O: intense, mysterious, and best enjoyed while stargazing with zero stress.",
  "No matter how packed the MRT is at 6 PM, remember outer space has infinite legroom for everyone.",
  "Waiting for a star to be born takes longer than waiting for BTO keys, but the final result is 100% worth it.",
  "Look at the giant cosmos and relak one corner — tomorrow's small headaches are basically microscopic compared to a galaxy."
];

/**
 * Intelligent Singaporean Humor & Storyteller Engine.
 * Converts dense, dry NASA academic text into a crystal-clear, entertaining story
 * with Singaporean wit, plain English explanations, and relatable analogies.
 */
export function generateFallbackSinglish(title: string, date: string, rawExplanation: string): SinglishResponseData {
  const text = (rawExplanation || "").replace(/^Explanation:\s*/i, "").trim();
  const lower = (title + " " + text).toLowerCase();

  // Identify celestial subject matter
  const isBlackHole = /black\s*hole|event\s*horizon|singularity|gravitational\s*wave/i.test(lower);
  const isSupernova = /supernova|remnant|star\s*explosion|stellar\s*death|pulsar|neutron\s*star/i.test(lower);
  const isNebula = /nebula|stellar\s*nursery|dust\s*cloud|emission\s*nebula|carina|orion/i.test(lower);
  const isEclipse = /eclipse|totality|corona|solar\s*eclipse|lunar\s*eclipse/i.test(lower);
  const isComet = /comet|asteroid|meteor|tail|perihelion|debris/i.test(lower);
  const isGalaxy = /galaxy|galaxies|milky\s*way|andromeda|spiral\s*arm|deep\s*field|cluster/i.test(lower);
  const isSun = /solar|sun|prominence|cme|sunspot|aurora|geomagnetic/i.test(lower);
  const isPlanet = /mars|jupiter|saturn|venus|rover|perseverance|curiosity|crater/i.test(lower);

  // Extract interesting facts like light-years, distance, or telescopes
  const lyMatch = text.match(/(\d[\d,.]*)\s*(?:thousand|million|billion)?\s*light-years/i);
  const distNote = lyMatch ? `sitting roughly ${lyMatch[0]} away from our Earth` : "drifting vast distances across the celestial sky";

  let story = "";
  let humor = "";
  let simpleSummary = "";

  if (isBlackHole) {
    story = `Okay, let's break down what's happening here without any confusing physics headache! You are looking at a supermassive cosmic monster — a black hole. Its gravity is so absurdly strong that even light cannot escape. Anything that wanders too close gets pulled in forever, faster than aunties rushing for supermarket discount items!\n\nAround the edge, superheated gases and plasma are swirling at near light-speed, glowing fiercely before slipping past the point of no return. Scientists use giant radio telescope arrays around the globe to capture this faint silhouette against the bright cosmos.`;
    humor = "If you think your wallet vanishes fast during Great Singapore Sale, wait till you see how fast matter disappears into this cosmic vacuum!";
    simpleSummary = `A superdense black hole warping spacetime and gobbling surrounding cosmic matter with unstoppable gravity.`;
  } else if (isSupernova) {
    story = `What you're admiring here is basically the grandest cosmic fireworks show in existence — the glowing aftermath of a massive star that went *BOOM*! When a giant star runs out of fuel after millions of years, it can no longer support its own weight and collapses inwards, triggering a tremendous supernova blast.\n\nAll those colorful, intricate filaments you see are enriched with heavy elements like iron, gold, and oxygen blasted across space at thousands of kilometers per second. Fun fact: the very iron in your blood was forged inside stellar explosions just like this one!`;
    humor = "This star went out with way more drama than National Day fireworks at Marina Bay, leaving behind a glowing masterpiece that will shine for thousands of years.";
    simpleSummary = `The radiant remnants of an exploded giant star, scattering star-stuff and cosmic elements across the galaxy.`;
  } else if (isNebula) {
    story = `Take a deep breath and look at this gorgeous celestial cloud! This is a massive nebula — essentially a stellar maternity ward where brand-new baby stars are being born right now. Vast clouds of interstellar hydrogen gas and cosmic dust are slowly getting pulled together by gentle gravity.\n\nDeep inside these dense pillars and glowing ridges, pressure and heat build up until nuclear fusion ignites, switching on newborn stars like sparkling festive lights along Orchard Road during Christmas season!`;
    humor = "These gas clouds took millions of years of patient simmering to create baby stars. Truly a masterclass in staying steady pom pi pi!";
    simpleSummary = `A colossal glowing cosmic cloud where gravity compresses interstellar dust to ignite brand-new stars.`;
  } else if (isEclipse) {
    story = `Here's a rare celestial alignment where cosmic geometry lines up with 100% pinpoint precision! The Moon passes directly between our planet Earth and the Sun, temporarily blocking the blinding daylight and casting its shadow across the ground.\n\nDuring totality, the sky darkens to twilight, the air temperature drops instantly, and the Sun's mysterious outer atmosphere (the corona) shines like a delicate halo of ghostly white light. It's one of nature's most surreal spectacles!`;
    humor = "Even the giant scorching Sun has to give way and take a quick coffee break when the Moon steps in for the queue.";
    simpleSummary = `A total eclipse where the Moon and Sun align perfectly, revealing the solar corona in the darkened sky.`;
  } else if (isComet) {
    story = `Say hello to an ancient cosmic ice traveler! Comets are essentially giant 'dirty snowballs' made of frozen water, methane, and ancient rocky dust left over from the birth of our Solar System 4.6 billion years ago.\n\nAs the comet swings closer to the heat of the Sun, the ice vaporizes directly into glowing gas, producing that magnificent, sweeping tail stretching millions of kilometers across the night sky, pushed back by the solar wind.`;
    humor = "This comet has been cruising through freezing deep space longer than human history, making its grand entrance looking fabulous with a million-kilometer tail.";
    simpleSummary = `An ancient icy comet warming up near the Sun, venting sparkling gas and dust into a sweeping celestial tail.`;
  } else if (isGalaxy) {
    story = `You are peering into a colossal city of stars — a spiral galaxy containing hundreds of billions of suns, planetary systems, and glowing nebulae, ${distNote}.\n\nThose magnificent spiral arms sweeping outward are not static solid structures; they are gentle density waves of cosmic gravity compressing gas clouds and lighting up bright clusters of young blue stars as they rotate gracefully through deep space.`;
    humor = "Billions of stars swirling peacefully together without a single traffic jam. Our evening commute could really learn a thing or two from galactic mechanics!";
    simpleSummary = `A majestic galaxy of hundreds of billions of suns dancing together in a grand cosmic spiral.`;
  } else if (isSun) {
    story = `Here is our home star up close and personal in high definition! The Sun is a churning ball of blistering hot plasma powered by a roaring nuclear furnace at its core. Magnetic field lines twist, snap, and reconnect on its surface, occasionally launching towering arches of glowing plasma called solar prominences.\n\nWhen these charged particles travel across space and interact with Earth's magnetic shield, they light up the upper atmosphere as breathtaking shimmering auroras!`;
    humor = "If you ever complain that Singapore afternoon weather is too hot, remember the surface of this fiery ball is sitting at a crisp 5,500 degrees Celsius!";
    simpleSummary = `Intense magnetic and plasma activity on the Sun fueling the energy that keeps our entire Solar System alive.`;
  } else if (isPlanet) {
    story = `Welcome to an alien world right in our cosmic backyard! Robotic explorers and orbiters equipped with high-tech cameras have beamed back this detailed planetary landscape, showing ancient impact craters, wind-sculpted sand dunes, and mysterious geologic formations.\n\nStudying these barren rocky landscapes helps planetary scientists piece together how planets evolve over billions of years and whether conditions could ever have supported life.`;
    humor = "A rugged alien terrain with zero WiFi, zero crowds, and infinite tranquility. The ultimate peaceful getaway spot!";
    simpleSummary = `A striking high-resolution look at the surface features and geologic history of an neighboring world.`;
  } else {
    // General astronomy story
    story = `Here is a spectacular snapshot of our dynamic universe captured by observatory cameras! ${text.slice(0, 280)}...\n\nAstronomers study images like this to unlock how energy, gravity, and cosmic dust interact across billions of years to shape the vast celestial sky we see today.`;
    humor = "Looking up at a universe this vast reminds us to take things easy, enjoy the view, and appreciate the wonder of being here.";
    simpleSummary = `A breathtaking deep space view showcasing the wonders and physics of our celestial cosmos.`;
  }

  // Hash-based selection of Singapore wisdom quote
  let hash = 0;
  const dStr = date || "2026-01-01";
  for (let i = 0; i < dStr.length; i++) {
    hash = (hash * 31 + dStr.charCodeAt(i)) % SINGAPORE_HUMOR_QUOTES.length;
  }
  const quote = SINGAPORE_HUMOR_QUOTES[Math.abs(hash)];

  const fullTranslation = `${story}\n\n💡 **Singaporean Perspective & Humor:**\n${humor}`;
  const combined = `${fullTranslation}\n\n🇸🇬 **Relatable Singapore Saying:**\n"${quote}"\n\n**Quick Takeaway:** ${simpleSummary}`;

  return {
    translation: fullTranslation,
    summary: simpleSummary,
    quote,
    singlish: combined,
    source: "fallback",
  };
}

export async function handleSinglish(req: UniversalRequest, res: UniversalResponse) {
  // CORS Preflight
  if (req.method === "OPTIONS") {
    sendJsonResponse(res, 204, {});
    return;
  }

  try {
    const body = (await getRequestBody<{ title?: string; date?: string; explanation?: string }>(req)) || {};
    const query = getQueryParams(req);

    const title = body.title || query.title || "Cosmic Sky";
    const date = body.date || query.date || "";
    const rawExplanation = body.explanation || query.explanation || "";

    if (!rawExplanation || typeof rawExplanation !== "string" || !rawExplanation.trim()) {
      const fallbackData = generateFallbackSinglish(title, date, "A breathtaking view of celestial bodies and cosmic dust in our universe.");
      sendJsonResponse(res, 200, fallbackData);
      return;
    }

    const ai = getAiClient();

    if (ai) {
      try {
        const prompt = `Title of Astronomical Image: "${title}"
Date of Record: ${date}
Official NASA Scientific Explanation:
"""
${rawExplanation}
"""

TASK:
Translate and rewrite this dense NASA explanation so that ANY everyday person or family can easily understand the fascinating story behind what is happening in the picture!
Write in clear, engaging English with authentic Singaporean humor, relatable local analogies (e.g. comparing astronomical scales to Singapore life, weather, queues, food, or MRT), and warm conversational charm.`;

        // Add timeout for Gemini call to protect serverless latency
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Gemini API timeout")), 8500)
        );

        const apiPromise = ai.models.generateContent({
          model: "gemini-3.7-flash",
          contents: prompt,
          config: {
            systemInstruction: `You are a brilliant, witty, and engaging Singaporean science communicator translating NASA Astronomy Picture of the Day (APOD) entries for everyday readers and families.

YOUR GOAL:
Dense NASA texts are often overly academic and hard to digest. Your mission is to REWRITE and EXPLAIN the story behind the image so that any reader immediately understands:
1. WHAT we are actually looking at (the cosmic spectacle, stars, nebulae, galaxies, black holes, etc.).
2. HOW / WHY it formed or happened in simple, vivid terms.
3. INJECT RELATABLE SINGAPOREAN HUMOR & ANALOGIES (e.g. comparing cosmic heat to Singapore afternoon sun, vast distances/timelines to waiting for BTO keys, galaxy mergers to peak hour transit, glowing nebulae to Marina Bay fireworks, staying calm like steady pom pi pi).

OUTPUT REQUIREMENTS:
- translation: A well-written 2-to-3 paragraph engaging story in clear, accessible English enriched with delightful Singaporean humor and conversational charm. DO NOT just copy NASA's academic sentences.
- summary: A 1-2 sentence crystal clear takeaway explaining the core science in plain words.
- quote: One memorable, heartwarming or funny Singaporean saying/wisdom quote connecting this cosmic wonder to daily life in Singapore.

STRICT TONE GUIDELINES:
- Clean, family-friendly, zero vulgarities.
- Genuine storytelling and humor that actually makes the astronomy fascinating and easy to grasp.`,
            responseMimeType: "application/json",
            responseSchema: {
              type: "object",
              properties: {
                translation: {
                  type: "string",
                  description: "Engaging 2-3 paragraph story in clear English with Singaporean humor, relatable local analogies, and plain science explanations.",
                },
                summary: {
                  type: "string",
                  description: "1-2 sentence crystal clear takeaway of the science behind the photo.",
                },
                quote: {
                  type: "string",
                  description: "A relatable, humorous or heartwarming Singaporean saying connecting this cosmos wonder to daily life.",
                },
              },
              required: ["translation", "summary", "quote"],
            },
            temperature: 0.7,
          },
        });

        const response = await Promise.race([apiPromise, timeoutPromise]);
        const rawText = response.text;

        if (rawText && rawText.trim().length > 0) {
          try {
            const parsed = JSON.parse(rawText);
            if (parsed && parsed.translation && parsed.quote) {
              const combined = `${parsed.translation.trim()}\n\n🇸🇬 **Relatable Singapore Saying:**\n"${parsed.quote.trim()}"\n\n**Quick Takeaway:** ${parsed.summary?.trim() || ""}`;

              sendJsonResponse(res, 200, {
                translation: parsed.translation.trim(),
                summary: parsed.summary?.trim() || "",
                quote: parsed.quote.trim(),
                singlish: combined,
                source: "gemini",
              });
              return;
            }
          } catch (jsonErr) {
            console.warn("Failed to parse Gemini JSON output, falling back:", jsonErr);
          }
        }
      } catch (geminiError) {
        console.warn("Gemini API call for Singlish failed, falling back to generator:", geminiError);
      }
    }

    // High quality deterministic fallback generator
    const fallbackData = generateFallbackSinglish(title, date, rawExplanation);
    sendJsonResponse(res, 200, fallbackData);
  } catch (error) {
    console.error("Error processing Singlish translation:", error);
    const fallbackData = generateFallbackSinglish("Cosmic Vista", "", "A celestial sight from NASA archive.");
    sendJsonResponse(res, 200, fallbackData);
  }
}

// Universal Serverless default export
export default async function singlishHandler(req: any, res: any, next?: any) {
  try {
    await handleSinglish(req, res);
  } catch (err) {
    console.error("Unhandled error in Singlish handler:", err);
    sendJsonResponse(res, 500, {
      error: "Internal Server Error in Singlish endpoint",
      details: err instanceof Error ? err.message : String(err),
    });
  }
}

// Support Express Router mounting
export const singlishRouter = Router();
singlishRouter.all("*", (req, res) => handleSinglish(req, res));

