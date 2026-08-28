/**
 * Singlish Astronomical Translation Service
 * Fetches AI-powered Singlish translation of NASA APOD descriptions from /api/singlish,
 * with local caching and offline fallback.
 */

export interface SinglishResult {
  singlish: string;
  source: 'gemini' | 'fallback' | 'cache';
}

/**
 * Client-side fallback Singlish generator when network is completely offline
 */
export function generateClientFallbackSinglish(
  title: string,
  date: string,
  explanation: string
): string {
  const cleanExp = explanation.replace(/^Explanation:\s*/i, '').trim();

  const transformed = cleanExp
    .replace(/\bIn this image\b/gi, 'Looking at this photo ah')
    .replace(/\bThis image shows\b/gi, 'Wah lau look at this, confirm showing')
    .replace(/\bAstronomers believe\b/gi, 'The science experts all say lah')
    .replace(/\bAstronomers have found\b/gi, 'The astronomers finally spot already')
    .replace(/\bScientists discovered\b/gi, 'Scientists go and find out')
    .replace(/\bLight-years away\b/gi, 'super far away, pass through so many light-years')
    .replace(/\bMillion years\b/gi, 'millions of years (longer than waiting for BTO flat)')
    .replace(/\bBillions of years\b/gi, 'billions of years, sibei long ago')
    .replace(/\bVery hot\b/gi, 'hot like midday sun in Singapore without air-con')
    .replace(/\bVery bright\b/gi, 'bright like Orchard Road Christmas lights')
    .replace(/\bVery large\b/gi, 'sibei huge, bigger than whole Marina Bay')
    .replace(/\bVery massive\b/gi, 'solid heavy, don\'t play play')
    .replace(/\bBlack hole\b/gi, 'super gravitational black hole (so strong even your CPF cannot escape)')
    .replace(/\bSupernova\b/gi, 'exploding supernova star (boom like National Day fireworks)')
    .replace(/\bTelescope\b/gi, 'high-tech giant telescope')
    .replace(/\bIn fact,\b/gi, 'Actually hor,')
    .replace(/\bHowever,\b/gi, 'But wait ah,')
    .replace(/\bTherefore,\b/gi, 'So the moral of the story is,')
    .replace(/\bAs a result,\b/gi, 'End up hor,');

  const intro = `Wah lau eh! Check out this NASA view from ${date} called "${title}". Solid sia! Let uncle/auntie break it down for you in proper Singapore style.`;
  const closing = `\n\n🇸🇬 **Kopitiam Takeaway:** The universe is sibei vast and beautiful lah! When you look up at night from your HDB corridor or East Coast Park, remember we are all floating on one small sunny island in this huge cosmic void. Swee swee, don't play play!`;

  return `${intro}\n\n${transformed}${closing}`;
}

/**
 * Fetch Singlish translation with local storage caching
 */
export async function fetchSinglishExplanation(
  title: string,
  date: string,
  explanation: string
): Promise<SinglishResult> {
  const cacheKey = `singlish_apod_${date}`;

  // Check localStorage cache
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && typeof parsed.singlish === 'string' && parsed.singlish.length > 20) {
        return {
          singlish: parsed.singlish,
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
      if (data && data.singlish) {
        // Cache result
        try {
          localStorage.setItem(cacheKey, JSON.stringify(data));
        } catch {
          // ignore cache write errors
        }

        return {
          singlish: data.singlish,
          source: data.source || 'gemini',
        };
      }
    }
  } catch (err) {
    console.warn('Could not fetch Singlish explanation from API, using fallback:', err);
  }

  // Fallback
  const fallback = generateClientFallbackSinglish(title, date, explanation);
  return {
    singlish: fallback,
    source: 'fallback',
  };
}
