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
 * Client-side fallback Singlish generator when network is completely offline.
 * Clean, entertaining story with relatable Singaporean humor and accessible English.
 */
export function generateClientFallbackSinglish(
  title: string,
  date: string,
  explanation: string
): SinglishResult {
  const text = (explanation || '').replace(/^Explanation:\s*/i, '').trim();
  const lower = (title + ' ' + text).toLowerCase();

  const isBlackHole = /black\s*hole|event\s*horizon|singularity|gravitational\s*wave/i.test(lower);
  const isSupernova = /supernova|remnant|star\s*explosion|stellar\s*death|pulsar|neutron\s*star/i.test(lower);
  const isNebula = /nebula|stellar\s*nursery|dust\s*cloud|emission\s*nebula|carina|orion/i.test(lower);
  const isEclipse = /eclipse|totality|corona|solar\s*eclipse|lunar\s*eclipse/i.test(lower);
  const isComet = /comet|asteroid|meteor|tail|perihelion|debris/i.test(lower);
  const isGalaxy = /galaxy|galaxies|milky\s*way|andromeda|spiral\s*arm|deep\s*field|cluster/i.test(lower);
  const isSun = /solar|sun|prominence|cme|sunspot|aurora|geomagnetic/i.test(lower);
  const isPlanet = /mars|jupiter|saturn|venus|rover|perseverance|curiosity|crater/i.test(lower);

  const lyMatch = text.match(/(\d[\d,.]*)\s*(?:thousand|million|billion)?\s*light-years/i);
  const distNote = lyMatch ? `sitting roughly ${lyMatch[0]} away from our Earth` : 'drifting vast distances across the celestial sky';

  let story = '';
  let humor = '';
  let simpleSummary = '';

  if (isBlackHole) {
    story = `Okay, let's break down what's happening here without any confusing physics headache! You are looking at a supermassive cosmic monster — a black hole. Its gravity is so absurdly strong that even light cannot escape. Anything that wanders too close gets pulled in forever, faster than aunties rushing for supermarket discount items!\n\nAround the edge, superheated gases and plasma are swirling at near light-speed, glowing fiercely before slipping past the point of no return. Scientists use giant radio telescope arrays around the globe to capture this faint silhouette against the bright cosmos.`;
    humor = 'If you think your wallet vanishes fast during Great Singapore Sale, wait till you see how fast matter disappears into this cosmic vacuum!';
    simpleSummary = `A superdense black hole warping spacetime and gobbling surrounding cosmic matter with unstoppable gravity.`;
  } else if (isSupernova) {
    story = `What you're admiring here is basically the grandest cosmic fireworks show in existence — the glowing aftermath of a massive star that went *BOOM*! When a giant star runs out of fuel after millions of years, it can no longer support its own weight and collapses inwards, triggering a tremendous supernova blast.\n\nAll those colorful, intricate filaments you see are enriched with heavy elements like iron, gold, and oxygen blasted across space at thousands of kilometers per second. Fun fact: the very iron in your blood was forged inside stellar explosions just like this one!`;
    humor = 'This star went out with way more drama than National Day fireworks at Marina Bay, leaving behind a glowing masterpiece that will shine for thousands of years.';
    simpleSummary = `The radiant remnants of an exploded giant star, scattering star-stuff and cosmic elements across the galaxy.`;
  } else if (isNebula) {
    story = `Take a deep breath and look at this gorgeous celestial cloud! This is a massive nebula — essentially a stellar maternity ward where brand-new baby stars are being born right now. Vast clouds of interstellar hydrogen gas and cosmic dust are slowly getting pulled together by gentle gravity.\n\nDeep inside these dense pillars and glowing ridges, pressure and heat build up until nuclear fusion ignites, switching on newborn stars like sparkling festive lights along Orchard Road during Christmas season!`;
    humor = 'These gas clouds took millions of years of patient simmering to create baby stars. Truly a masterclass in staying steady pom pi pi!';
    simpleSummary = `A colossal glowing cosmic cloud where gravity compresses interstellar dust to ignite brand-new stars.`;
  } else if (isEclipse) {
    story = `Here's a rare celestial alignment where cosmic geometry lines up with 100% pinpoint precision! The Moon passes directly between our planet Earth and the Sun, temporarily blocking the blinding daylight and casting its shadow across the ground.\n\nDuring totality, the sky darkens to twilight, the air temperature drops instantly, and the Sun's mysterious outer atmosphere (the corona) shines like a delicate halo of ghostly white light. It's one of nature's most surreal spectacles!`;
    humor = 'Even the giant scorching Sun has to give way and take a quick coffee break when the Moon steps in for the queue.';
    simpleSummary = `A total eclipse where the Moon and Sun align perfectly, revealing the solar corona in the darkened sky.`;
  } else if (isComet) {
    story = `Say hello to an ancient cosmic ice traveler! Comets are essentially giant 'dirty snowballs' made of frozen water, methane, and ancient rocky dust left over from the birth of our Solar System 4.6 billion years ago.\n\nAs the comet swings closer to the heat of the Sun, the ice vaporizes directly into glowing gas, producing that magnificent, sweeping tail stretching millions of kilometers across the night sky, pushed back by the solar wind.`;
    humor = 'This comet has been cruising through freezing deep space longer than human history, making its grand entrance looking fabulous with a million-kilometer tail.';
    simpleSummary = `An ancient icy comet warming up near the Sun, venting sparkling gas and dust into a sweeping celestial tail.`;
  } else if (isGalaxy) {
    story = `You are peering into a colossal city of stars — a spiral galaxy containing hundreds of billions of suns, planetary systems, and glowing nebulae, ${distNote}.\n\nThose magnificent spiral arms sweeping outward are not static solid structures; they are gentle density waves of cosmic gravity compressing gas clouds and lighting up bright clusters of young blue stars as they rotate gracefully through deep space.`;
    humor = 'Billions of stars swirling peacefully together without a single traffic jam. Our evening commute could really learn a thing or two from galactic mechanics!';
    simpleSummary = `A majestic galaxy of hundreds of billions of suns dancing together in a grand cosmic spiral.`;
  } else if (isSun) {
    story = `Here is our home star up close and personal in high definition! The Sun is a churning ball of blistering hot plasma powered by a roaring nuclear furnace at its core. Magnetic field lines twist, snap, and reconnect on its surface, occasionally launching towering arches of glowing plasma called solar prominences.\n\nWhen these charged particles travel across space and interact with Earth's magnetic shield, they light up the upper atmosphere as breathtaking shimmering auroras!`;
    humor = 'If you ever complain that Singapore afternoon weather is too hot, remember the surface of this fiery ball is sitting at a crisp 5,500 degrees Celsius!';
    simpleSummary = `Intense magnetic and plasma activity on the Sun fueling the energy that keeps our entire Solar System alive.`;
  } else if (isPlanet) {
    story = `Welcome to an alien world right in our cosmic backyard! Robotic explorers and orbiters equipped with high-tech cameras have beamed back this detailed planetary landscape, showing ancient impact craters, wind-sculpted sand dunes, and mysterious geologic formations.\n\nStudying these barren rocky landscapes helps planetary scientists piece together how planets evolve over billions of years and whether conditions could ever have supported life.`;
    humor = 'A rugged alien terrain with zero WiFi, zero crowds, and infinite tranquility. The ultimate peaceful getaway spot!';
    simpleSummary = `A striking high-resolution look at the surface features and geologic history of an neighboring world.`;
  } else {
    story = `Here is a spectacular snapshot of our dynamic universe captured by observatory cameras! ${text.slice(0, 280)}...\n\nAstronomers study images like this to unlock how energy, gravity, and cosmic dust interact across billions of years to shape the vast celestial sky we see today.`;
    humor = 'Looking up at a universe this vast reminds us to take things easy, enjoy the view, and appreciate the wonder of being here.';
    simpleSummary = `A breathtaking deep space view showcasing the wonders and physics of our celestial cosmos.`;
  }

  let hash = 0;
  for (let i = 0; i < (date || '2026-01-01').length; i++) {
    hash = (hash * 31 + (date || '2026-01-01').charCodeAt(i)) % SINGAPORE_HUMOR_QUOTES.length;
  }
  const quote = SINGAPORE_HUMOR_QUOTES[Math.abs(hash)];

  const translation = `${story}\n\n💡 **Singaporean Perspective & Humor:**\n${humor}`;
  const singlish = `${translation}\n\n🇸🇬 **Relatable Singapore Saying:**\n"${quote}"\n\n**Quick Takeaway:** ${simpleSummary}`;

  return {
    translation,
    summary: simpleSummary,
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
  const cacheKey = `singlish_apod_v3_${date}`;

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
