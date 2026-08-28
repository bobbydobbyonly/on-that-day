export interface ApodItem {
  date: string;
  title: string;
  explanation: string;
  url: string;
  hdurl?: string;
  media_type: 'image' | 'video' | string;
  copyright?: string;
  service_version?: string;
}

export interface UserSession {
  name: string;
  date: string; // YYYY-MM-DD
  isInitialSetup: boolean;
}

export interface MilestoneItem {
  id: string;
  date: string;
  title: string;
  subtitle: string;
  badge: string;
  thumbnailUrl: string;
  category: 'landmark' | 'telescope' | 'eclipse' | 'planet';
}

export interface MoonPhaseInfo {
  phaseName: string;
  illumination: number; // 0 to 100%
  moonAgeDays: number;
  zodiacSign: string;
  emoji: string;
}

export interface FavoriteDate {
  date: string;
  title: string;
  url: string;
  userName?: string;
  savedAt: number;
}

export interface PublicHoliday {
  date: string;
  localName: string;
  name: string;
  countryCode: string;
  fixed?: boolean;
  global?: boolean;
  counties?: string[] | null;
  launchYear?: number | null;
  types?: string[];
}
