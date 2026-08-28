import { PublicHoliday } from '../types';

const memoryHolidayCache = new Map<string, PublicHoliday[]>();

export const SUPPORTED_COUNTRIES = [
  { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿' },
];

export async function fetchHolidaysForYear(
  year: number,
  countryCode: string = 'SG'
): Promise<PublicHoliday[]> {
  const normalizedCountry = countryCode.toUpperCase();
  const cacheKey = `${year}_${normalizedCountry}`;

  if (memoryHolidayCache.has(cacheKey)) {
    return memoryHolidayCache.get(cacheKey)!;
  }

  // Try local storage cache
  try {
    const stored = localStorage.getItem(`holidays_${cacheKey}`);
    if (stored) {
      const parsed = JSON.parse(stored) as PublicHoliday[];
      memoryHolidayCache.set(cacheKey, parsed);
      return parsed;
    }
  } catch {
    // Ignore storage parse error
  }

  try {
    const res = await fetch(`/api/holidays/${year}/${normalizedCountry}`);
    if (!res.ok) {
      return [];
    }

    const data = (await res.json()) as PublicHoliday[];
    if (Array.isArray(data)) {
      memoryHolidayCache.set(cacheKey, data);
      try {
        localStorage.setItem(`holidays_${cacheKey}`, JSON.stringify(data));
      } catch {
        // Storage quota full
      }
      return data;
    }
  } catch (err) {
    console.info('Failed to fetch holidays from backend:', err);
  }

  return [];
}

export async function fetchHolidayForDate(
  dateStr: string,
  countryCode: string = 'SG'
): Promise<PublicHoliday | null> {
  if (!dateStr || !dateStr.includes('-')) return null;

  const year = parseInt(dateStr.split('-')[0], 10);
  if (isNaN(year)) return null;

  try {
    const holidays = await fetchHolidaysForYear(year, countryCode);
    const match = holidays.find((h) => h.date === dateStr);
    return match || null;
  } catch {
    return null;
  }
}
