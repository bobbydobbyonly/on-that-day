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

/**
 * Fallback Singlish transformer and astronomical commentary generator
 * Used when Gemini API key is missing, or in case of network timeouts.
 */
function generateFallbackSinglish(title: string, date: string, explanation: string): string {
  const cleanExp = explanation.replace(/^Explanation:\s*/i, "").trim();

  // Common phrase replacements to bring authentic Singapore kopitiam flavour
  let transformed = cleanExp
    .replace(/\bIn this image\b/gi, "Looking at this photo ah")
    .replace(/\bThis image shows\b/gi, "Wah lau look at this, confirm showing")
    .replace(/\bAstronomers believe\b/gi, "The science experts all say lah")
    .replace(/\bAstronomers have found\b/gi, "The astronomers finally spot already")
    .replace(/\bScientists discovered\b/gi, "Scientists go and find out")
    .replace(/\bLight-years away\b/gi, "super far away, pass through so many light-years")
    .replace(/\bMillion years\b/gi, "millions of years (longer than waiting for BTO flat)")
    .replace(/\bBillions of years\b/gi, "billions of years, sibei long ago")
    .replace(/\bVery hot\b/gi, "hot like midday sun in Singapore without air-con")
    .replace(/\bVery bright\b/gi, "bright like Orchard Road Christmas lights")
    .replace(/\bVery large\b/gi, "sibei huge, bigger than whole Marina Bay")
    .replace(/\bVery massive\b/gi, "solid heavy, don't play play")
    .replace(/\bBlack hole\b/gi, "super gravitational black hole (so strong even your CPF cannot escape)")
    .replace(/\bSupernova\b/gi, "exploding supernova star (boom like National Day fireworks)")
    .replace(/\bTelescope\b/gi, "high-tech giant telescope")
    .replace(/\bIn fact,\b/gi, "Actually hor,")
    .replace(/\bHowever,\b/gi, "But wait ah,")
    .replace(/\bTherefore,\b/gi, "So the moral of the story is,")
    .replace(/\bAs a result,\b/gi, "End up hor,");

  // Format into 2-3 engaging Singlish paragraphs
  const intro = `Wah lau eh! Check out this NASA view from ${date} called "${title}". Solid sia! Let uncle/auntie break it down for you in proper Singapore style.`;
  
  const closing = `\n\nKopitiam Astronomer Takeaway: The universe is sibei vast and beautiful lah! When you look up at night from your HDB corridor or East Coast Park, remember we are all floating on one small sunny island in this huge cosmic void. Swee swee, don't play play!`;

  return `${intro}\n\n${transformed}${closing}`;
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
        const prompt = `Title: ${title}
Date: ${date}
NASA Explanation: ${explanation}

Please rewrite this NASA Astronomy Picture of the Day explanation into authentic, engaging Singapore Singlish so kopitiam kakis can appreciate the cosmos.`;

        const response = await ai.models.generateContent({
          model: "gemini-3.1-flash-lite",
          contents: prompt,
          config: {
            systemInstruction: `You are an enthusiastic Singaporean kopitiam astronomer explaining NASA's Astronomy Picture of the Day (APOD) to friends at a hawker centre.
Translate and explain the scientific concepts using authentic, warm Singapore Singlish.
Key Guidelines:
1. Keep the scientific core accurate, educational, and easy to understand.
2. Use authentic Singlish grammar, colloquial phrases, and sentence final particles naturally (lah, leh, lor, hor, meh, wah lau, alamak, steady, swee, sibei, solid, don't play play, confirm plus chop, power lah).
3. Weave in relatable Singapore cultural metaphors where relevant (e.g. comparing cosmic distances to MRT train journeys from Pasir Ris to Tuas Link or Causeway jams, blazing temperatures to walking under 1pm Singapore sun at hawker centre without ceiling fans, supernova bursts to Marina Bay NDP fireworks, immense cosmic voids to booking holiday flights).
4. Organize into 2 to 3 easy-to-read paragraphs.
5. End with a distinct "🇸🇬 Kopitiam Takeaway:" bullet or summary line.
6. Avoid offensive words or excessive broken grammar; it should be witty, charming, and scientifically informative.`,
            temperature: 0.7,
          },
        });

        const text = response.text;
        if (text && text.trim().length > 0) {
          res.json({
            singlish: text.trim(),
            source: "gemini",
          });
          return;
        }
      } catch (geminiError) {
        console.warn("Gemini API call for Singlish failed, falling back to generator:", geminiError);
      }
    }

    // Fallback generator
    const fallbackText = generateFallbackSinglish(title, date, explanation);
    res.json({
      singlish: fallbackText,
      source: "fallback",
    });
  } catch (error) {
    console.error("Error processing Singlish translation:", error);
    res.status(500).json({ error: "Failed to generate Singlish explanation" });
  }
});

export default singlishRouter;
