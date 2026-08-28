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

export const SINGAPORE_HOLIDAYS_2026: PublicHoliday[] = [
  { date: '2026-01-01', localName: "New Year's Day", name: "New Year's Day", countryCode: 'SG' },
  { date: '2026-02-17', localName: 'Chinese New Year', name: 'Chinese New Year', countryCode: 'SG' },
  { date: '2026-02-18', localName: 'Chinese New Year', name: 'Chinese New Year', countryCode: 'SG' },
  { date: '2026-03-21', localName: 'Hari Raya Puasa', name: 'Hari Raya Puasa', countryCode: 'SG' },
  { date: '2026-04-03', localName: 'Good Friday', name: 'Good Friday', countryCode: 'SG' },
  { date: '2026-05-01', localName: 'Labour Day', name: 'Labour Day', countryCode: 'SG' },
  { date: '2026-05-27', localName: 'Hari Raya Haji', name: 'Hari Raya Haji', countryCode: 'SG' },
  { date: '2026-06-01', localName: 'Vesak Day', name: 'Vesak Day', countryCode: 'SG' },
  { date: '2026-08-10', localName: 'National Day', name: 'National Day', countryCode: 'SG' },
  { date: '2026-11-09', localName: 'Deepavali', name: 'Deepavali', countryCode: 'SG' },
  { date: '2026-12-25', localName: 'Christmas Day', name: 'Christmas Day', countryCode: 'SG' },
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
    if (res.ok) {
      const data = (await res.json()) as PublicHoliday[];
      if (Array.isArray(data) && data.length > 0) {
        memoryHolidayCache.set(cacheKey, data);
        try {
          localStorage.setItem(`holidays_${cacheKey}`, JSON.stringify(data));
        } catch {
          // Storage quota full
        }
        return data;
      }
    }
  } catch (err) {
    console.info('Failed to fetch holidays from backend:', err);
  }

  // Fallback to seeded Singapore holidays for 2026 if backend network has hiccups
  if (normalizedCountry === 'SG' && year === 2026) {
    memoryHolidayCache.set(cacheKey, SINGAPORE_HOLIDAYS_2026);
    return SINGAPORE_HOLIDAYS_2026;
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
