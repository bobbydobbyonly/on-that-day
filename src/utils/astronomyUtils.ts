import { MoonPhaseInfo } from '../types';

export const APOD_MIN_DATE = '1995-06-16';

export function getTodayDateString(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

export function isValidApodDate(dateStr: string): boolean {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const target = new Date(dateStr + 'T00:00:00Z');
  const minDate = new Date(APOD_MIN_DATE + 'T00:00:00Z');
  const maxDate = new Date();
  return target >= minDate && target <= maxDate;
}

export function getRandomApodDate(): string {
  const minTime = new Date(APOD_MIN_DATE + 'T00:00:00Z').getTime();
  const maxTime = new Date().getTime();
  const randomTime = minTime + Math.random() * (maxTime - minTime);
  const randomDate = new Date(randomTime);
  return randomDate.toISOString().split('T')[0];
}

export function formatFriendlyDate(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC',
    });
  } catch {
    return dateStr;
  }
}

export function formatShortDate(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC',
    });
  } catch {
    return dateStr;
  }
}

export function formatDayOfWeek(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      timeZone: 'UTC',
    });
  } catch {
    return '';
  }
}

export function getDaysAgoText(dateStr: string): string {
  try {
    const target = new Date(dateStr + 'T00:00:00Z').getTime();
    const now = Date.now();
    const diffDays = Math.floor((now - target) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 365) return `${diffDays.toLocaleString()} days ago`;
    const years = Math.floor(diffDays / 365.25);
    const remainingDays = Math.floor(diffDays % 365.25);
    return `${years} ${years === 1 ? 'year' : 'years'} ago (${diffDays.toLocaleString()} days in cosmic time)`;
  } catch {
    return '';
  }
}

export function calculateMoonPhase(dateStr: string): MoonPhaseInfo {
  try {
    const date = new Date(dateStr + 'T12:00:00Z');
    // Known reference new moon: Jan 6, 2000 at 18:14 UTC
    const refNewMoon = new Date('2000-01-06T18:14:00Z').getTime();
    const synodicMonth = 29.53058867; // average days per lunar cycle
    const diffMs = date.getTime() - refNewMoon;
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    let cyclePosition = (diffDays % synodicMonth);
    if (cyclePosition < 0) cyclePosition += synodicMonth;

    const illumination = Math.round(
      (1 - Math.cos((cyclePosition / synodicMonth) * 2 * Math.PI)) * 50
    );

    let phaseName = 'New Moon';
    let emoji = '🌑';

    if (cyclePosition < 1.84) {
      phaseName = 'New Moon';
      emoji = '🌑';
    } else if (cyclePosition < 5.53) {
      phaseName = 'Waxing Crescent';
      emoji = '🌒';
    } else if (cyclePosition < 9.22) {
      phaseName = 'First Quarter';
      emoji = '🌓';
    } else if (cyclePosition < 12.91) {
      phaseName = 'Waxing Gibbous';
      emoji = '🌔';
    } else if (cyclePosition < 16.61) {
      phaseName = 'Full Moon';
      emoji = '🌕';
    } else if (cyclePosition < 20.30) {
      phaseName = 'Waning Gibbous';
      emoji = '🌖';
    } else if (cyclePosition < 23.99) {
      phaseName = 'Third Quarter';
      emoji = '🌗';
    } else if (cyclePosition < 27.68) {
      phaseName = 'Waning Crescent';
      emoji = '🌘';
    } else {
      phaseName = 'New Moon';
      emoji = '🌑';
    }

    const zodiacSign = getZodiacSign(dateStr);

    return {
      phaseName,
      illumination,
      moonAgeDays: Math.round(cyclePosition * 10) / 10,
      zodiacSign,
      emoji,
    };
  } catch {
    return {
      phaseName: 'Crescent Moon',
      illumination: 42,
      moonAgeDays: 14.5,
      zodiacSign: 'Cassiopeia',
      emoji: '🌒',
    };
  }
}

export function getZodiacSign(dateStr: string): string {
  try {
    const [, monthStr, dayStr] = dateStr.split('-');
    const m = parseInt(monthStr, 10);
    const d = parseInt(dayStr, 10);

    if ((m === 3 && d >= 21) || (m === 4 && d <= 19)) return 'Aries (The Ram)';
    if ((m === 4 && d >= 20) || (m === 5 && d <= 20)) return 'Taurus (The Bull)';
    if ((m === 5 && d >= 21) || (m === 6 && d <= 20)) return 'Gemini (The Twins)';
    if ((m === 6 && d >= 21) || (m === 7 && d <= 22)) return 'Cancer (The Crab)';
    if ((m === 7 && d >= 23) || (m === 8 && d <= 22)) return 'Leo (The Lion)';
    if ((m === 8 && d >= 23) || (m === 9 && d <= 22)) return 'Virgo (The Maiden)';
    if ((m === 9 && d >= 23) || (m === 10 && d <= 22)) return 'Libra (The Scales)';
    if ((m === 10 && d >= 23) || (m === 11 && d <= 21)) return 'Scorpio (The Scorpion)';
    if ((m === 11 && d >= 22) || (m === 12 && d <= 21)) return 'Sagittarius (The Archer)';
    if ((m === 12 && d >= 22) || (m === 1 && d <= 19)) return 'Capricorn (The Sea-Goat)';
    if ((m === 1 && d >= 20) || (m === 2 && d <= 18)) return 'Aquarius (The Water-Bearer)';
    return 'Pisces (The Fishes)';
  } catch {
    return 'Celestial Sky';
  }
}

export function getCosmicBadge(dateStr: string, title?: string): { label: string; type: 'pink' | 'cyan' | 'amber' } {
  const [, mStr, dStr] = dateStr.split('-');
  const m = parseInt(mStr, 10);
  const d = parseInt(dStr, 10);

  // Exact historic dates
  if (dateStr === '1995-06-16') return { label: '✦ The First APOD Ever', type: 'amber' };
  if (dateStr === '2022-07-12') return { label: '★ First Webb Deep Field', type: 'pink' };
  if (dateStr === '2024-04-08') return { label: '★ Great Solar Eclipse', type: 'cyan' };
  if (dateStr === '2020-04-24') return { label: '✦ Hubble 30th Anniversary', type: 'amber' };

  // Seasonal & holiday alignments
  if (m === 1 && d === 1) return { label: '★ New Year Celestial Dawn', type: 'cyan' };
  if (m === 2 && d === 14) return { label: '♥ Valentine Cosmic Romance', type: 'pink' };
  if (m === 3 && (d >= 19 && d <= 21)) return { label: '✦ Vernal Equinox', type: 'cyan' };
  if (m === 6 && (d >= 20 && d <= 22)) return { label: '✦ Summer Solstice Sun', type: 'amber' };
  if (m === 7 && d === 20) return { label: '★ Apollo 11 Moon Landing Day', type: 'cyan' };
  if (m === 8 && (d >= 11 && d <= 13)) return { label: '✦ Perseid Meteor Shower', type: 'pink' };
  if (m === 9 && (d >= 21 && d <= 23)) return { label: '✦ Autumnal Equinox', type: 'cyan' };
  if (m === 10 && d === 31) return { label: '✦ Celestial Shadows / All Hallows', type: 'pink' };
  if (m === 12 && (d >= 20 && d <= 22)) return { label: '✦ Winter Solstice Portal', type: 'cyan' };
  if (m === 12 && d === 25) return { label: '★ Solstice Holiday Starlight', type: 'pink' };

  // Title-based context
  if (title) {
    const lower = title.toLowerCase();
    if (lower.includes('nebula')) return { label: '✦ Deep Space Nebula', type: 'pink' };
    if (lower.includes('galaxy')) return { label: '✦ Extragalactic Island', type: 'cyan' };
    if (lower.includes('moon') || lower.includes('lunar')) return { label: '✦ Lunar Wonder', type: 'cyan' };
    if (lower.includes('sun') || lower.includes('solar')) return { label: '✦ Helios Solar Sphere', type: 'amber' };
    if (lower.includes('eclipse')) return { label: '★ Celestial Eclipse', type: 'amber' };
    if (lower.includes('hubble') || lower.includes('webb') || lower.includes('jwst')) return { label: '★ Space Observatory Sight', type: 'cyan' };
  }

  return { label: '✦ Astronomical Picture of the Day', type: 'amber' };
}
