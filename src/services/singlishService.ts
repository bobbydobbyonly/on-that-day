/**
 * Singlish Astronomical Translation Service
 * Fetches AI-powered Singlish translation of NASA APOD descriptions from /api/singlish,
 * with local caching and offline fallback.
 * Strictly non-repetitive, zero vulgarities, with relatable Singaporean quotes/sayings.
 */

export interface SinglishResult {
  translation: string;
  summary: string;
  quote: string;
  singlish: string;
  source: 'gemini' | 'fallback' | 'cache';
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
 * Client-side fallback Singlish generator when network is completely offline.
 * Clean, respectful, non-repetitive translation.
 */
export function generateClientFallbackSinglish(
  title: string,
  date: string,
  explanation: string
): SinglishResult {
  const cleanExp = explanation.replace(/^Explanation:\s*/i, '').trim();

  // Natural sentence-level Singlish conversion without repetitive catchphrases
  const sentences = cleanExp.split(/(?<=[.?!])\s+/);
  const translated = sentences.map((sentence, idx) => {
    let s = sentence
      .replace(/\bIn this image\b/gi, 'Looking at this picture')
      .replace(/\bThis image shows\b/gi, 'This photo is showing')
      .replace(/\bAstronomers believe\b/gi, 'Astronomers reckon that')
      .replace(/\bAstronomers have found\b/gi, 'The astronomers discovered')
      .replace(/\bScientists discovered\b/gi, 'Scientists found out')
      .replace(/\bLight-years away\b/gi, 'light-years away from Earth')
      .replace(/\bMillion years\b/gi, 'millions of years')
      .replace(/\bBillions of years\b/gi, 'billions of years')
      .replace(/\bVery hot\b/gi, 'super hot, hotter than midday sun')
      .replace(/\bVery bright\b/gi, 'really bright and glowing')
      .replace(/\bVery large\b/gi, 'massive until cannot imagine')
      .replace(/\bBlack hole\b/gi, 'superdense black hole')
      .replace(/\bSupernova\b/gi, 'supernova star explosion')
      .replace(/\bIn fact,\b/gi, 'Actually,')
      .replace(/\bHowever,\b/gi, 'However hor,')
      .replace(/\bTherefore,\b/gi, 'So basically,')
      .replace(/\bAs a result,\b/gi, 'Because of that,');

    if (idx === 0 && !s.endsWith('lah.') && !s.endsWith('leh.')) {
      s = s.replace(/\.$/, ' lah.');
    } else if (idx === 2 && !s.endsWith('lor.')) {
      s = s.replace(/\.$/, ' lor.');
    }
    return s;
  });

  const translation = translated.join(' ');

  let hash = 0;
  for (let i = 0; i < date.length; i++) {
    hash = (hash * 31 + date.charCodeAt(i)) % RELATABLE_SINGAPORE_QUOTES.length;
  }
  const quote = RELATABLE_SINGAPORE_QUOTES[Math.abs(hash)];
  const summary = `NASA recorded "${title}" on ${date}, showing the celestial wonders of outer space lah.`;
  const singlish = `${translation}\n\n🇸🇬 **Relatable Singapore Saying:**\n"${quote}"\n\n**Quick Takeaway:** ${summary}`;

  return {
    translation,
    summary,
    quote,
    singlish,
    source: 'fallback',
  };
}

/**
 * Fetch Singlish translation with local storage caching
 */
export async function fetchSinglishExplanation(
  title: string,
  date: string,
  explanation: string
): Promise<SinglishResult> {
  const cacheKey = `singlish_apod_v2_${date}`;

  // Check localStorage cache
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && typeof parsed.translation === 'string' && typeof parsed.quote === 'string') {
        return {
          translation: parsed.translation,
          summary: parsed.summary || '',
          quote: parsed.quote,
          singlish: parsed.singlish || `${parsed.translation}\n\n"${parsed.quote}"`,
          source: 'cache',
        };
      }
    }
  } catch {
    // ignore cache read errors
  }

  try {
    const response = await fetch('/api/singlish', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        date,
        explanation,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data && (data.translation || data.singlish)) {
        const result: SinglishResult = {
          translation: data.translation || data.singlish,
          summary: data.summary || '',
          quote: data.quote || 'Steady pom pi pi — the universe is calm and wondrous lah.',
          singlish: data.singlish || `${data.translation}\n\n"${data.quote}"`,
          source: data.source || 'gemini',
        };

        // Cache result
        try {
          localStorage.setItem(cacheKey, JSON.stringify(result));
        } catch {
          // ignore cache write errors
        }

        return result;
      }
    }
  } catch (err) {
    console.warn('Could not fetch Singlish explanation from API, using fallback:', err);
  }

  // Fallback
  return generateClientFallbackSinglish(title, date, explanation);
}
