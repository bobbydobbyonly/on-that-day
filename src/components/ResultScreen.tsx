import React, { useState, useEffect } from 'react';
import { ApodItem, FavoriteDate, PublicHoliday } from '../types';
import {
  formatFriendlyDate,
  getDaysAgoText,
  calculateMoonPhase,
  getZodiacSign,
  getCosmicBadge,
} from '../utils/astronomyUtils';
import { MILESTONES } from '../data/fallbackApodData';
import {
  speakText,
  stopSpeaking,
  isSpeaking,
} from '../utils/audioSynth';
import {
  fetchHolidayForDate,
  fetchHolidaysForYear,
  SUPPORTED_COUNTRIES,
} from '../services/holidayService';
import {
  fetchSinglishExplanation,
  SinglishResult,
} from '../services/singlishService';
import {
  Sparkles,
  Maximize2,
  Bookmark,
  Award,
  Volume2,
  Square,
  Moon,
  Compass,
  Calendar,
  Share2,
  Check,
  Clock,
  Orbit,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Info,
  Layers,
  BookOpen,
  PartyPopper,
  Globe,
  RefreshCw,
  Copy,
  Languages,
  MessageSquare,
} from 'lucide-react';
import { DisqusComments } from './DisqusComments';
import { ErrorBoundary } from './ErrorBoundary';

interface ResultScreenProps {
  item: ApodItem;
  userName: string;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onOpenLightbox: () => void;
  onOpenKeepsake: () => void;
  onSelectDate: (date: string) => void;
  isLoading: boolean;
  onHolidayLoaded?: (holiday: PublicHoliday | null) => void;
  onSinglishLoaded?: (singlish: SinglishResult) => void;
}

type TabType = 'story' | 'keepsake' | 'context' | 'milestones';

export const ResultScreen: React.FC<ResultScreenProps> = ({
  item,
  userName,
  isFavorite,
  onToggleFavorite,
  onOpenLightbox,
  onOpenKeepsake,
  onSelectDate,
  isLoading,
  onHolidayLoaded,
  onSinglishLoaded,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('story');
  const [isPlayingNarration, setIsPlayingNarration] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Singlish Explanation State
  const [singlishData, setSinglishData] = useState<SinglishResult | null>(null);
  const [isLoadingSinglish, setIsLoadingSinglish] = useState(false);
  const [isPlayingSinglishNarration, setIsPlayingSinglishNarration] = useState(false);
  const [copiedSinglish, setCopiedSinglish] = useState(false);
  const [explanationViewMode, setExplanationViewMode] = useState<'both' | 'singlish' | 'nasa'>('both');

  // Terrestrial Holiday State
  const [selectedCountry, setSelectedCountry] = useState<string>(() => {
    try {
      return localStorage.getItem('apod_country_code') || 'SG';
    } catch {
      return 'SG';
    }
  });
  const [holiday, setHoliday] = useState<PublicHoliday | null>(null);
  const [yearHolidays, setYearHolidays] = useState<PublicHoliday[]>([]);
  const [showYearHolidays, setShowYearHolidays] = useState(false);
  const [customCountryInput, setCustomCountryInput] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const moon = calculateMoonPhase(item.date);
  const zodiac = getZodiacSign(item.date);
  const daysAgo = getDaysAgoText(item.date);
  const cosmicBadge = getCosmicBadge(item.date, item.title);

  // Fetch holiday data from the backend connection (/api/holidays)
  useEffect(() => {
    let isMounted = true;

    fetchHolidayForDate(item.date, selectedCountry)
      .then((h) => {
        if (isMounted) {
          setHoliday(h);
          onHolidayLoaded?.(h);
        }
      })
      .catch(() => {
        if (isMounted) {
          setHoliday(null);
          onHolidayLoaded?.(null);
        }
      });

    const year = parseInt(item.date.split('-')[0], 10);
    if (!isNaN(year)) {
      fetchHolidaysForYear(year, selectedCountry).then((list) => {
        if (isMounted) {
          setYearHolidays(list);
        }
      });
    }

    return () => {
      isMounted = false;
    };
  }, [item.date, selectedCountry]);

  // Handle country ISO change
  const handleSelectCountry = (code: string) => {
    const normalized = code.trim().toUpperCase();
    if (/^[A-Z]{2}$/.test(normalized)) {
      setSelectedCountry(normalized);
      try {
        localStorage.setItem('apod_country_code', normalized);
      } catch {
        // ignore
      }
    }
  };

  const currentCountryMeta = SUPPORTED_COUNTRIES.find((c) => c.code === selectedCountry) || {
    code: selectedCountry,
    name: selectedCountry,
    flag: '🌐',
  };

  // Reset speech when changing dates
  useEffect(() => {
    stopSpeaking();
    setIsPlayingNarration(false);
    setIsPlayingSinglishNarration(false);
  }, [item.date]);

  // Fetch Singlish translation when date/title/explanation changes
  useEffect(() => {
    let isMounted = true;
    setIsLoadingSinglish(true);
    stopSpeaking();
    setIsPlayingNarration(false);
    setIsPlayingSinglishNarration(false);

    fetchSinglishExplanation(item.title, item.date, item.explanation)
      .then((res) => {
        if (isMounted) {
          setSinglishData(res);
          setIsLoadingSinglish(false);
          if (onSinglishLoaded) {
            onSinglishLoaded(res);
          }
        }
      })
      .catch(() => {
        if (isMounted) {
          setIsLoadingSinglish(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [item.date, item.title, item.explanation, onSinglishLoaded]);

  const handleToggleNarration = () => {
    if (isPlayingNarration) {
      stopSpeaking();
      setIsPlayingNarration(false);
    } else {
      stopSpeaking();
      setIsPlayingSinglishNarration(false);
      const fullText = `${item.title}. Recorded on ${formatFriendlyDate(item.date)}. ${item.explanation}`;
      const started = speakText(
        fullText,
        () => setIsPlayingNarration(true),
        () => setIsPlayingNarration(false),
        () => setIsPlayingNarration(false)
      );
      if (started) {
        setIsPlayingNarration(true);
      }
    }
  };

  const handleToggleSinglishNarration = () => {
    if (isPlayingSinglishNarration) {
      stopSpeaking();
      setIsPlayingSinglishNarration(false);
    } else {
      if (!singlishData) return;
      stopSpeaking();
      setIsPlayingNarration(false);
      const speechBody = `${singlishData.translation}. Singapore cosmic saying: ${singlishData.quote}`;
      const cleanSinglish = speechBody.replace(/\*\*/g, '').replace(/🇸🇬/g, '');
      const started = speakText(
        cleanSinglish,
        () => setIsPlayingSinglishNarration(true),
        () => setIsPlayingSinglishNarration(false),
        () => setIsPlayingSinglishNarration(false),
        { rate: 1.0 }
      );
      if (started) {
        setIsPlayingSinglishNarration(true);
      }
    }
  };

  const handleCopySinglish = () => {
    if (!singlishData) return;
    if (navigator.clipboard) {
      const copyPayload = `✦ SINGAPORE (SINGLISH) ASTRONOMICAL TRANSLATION ✦\nCelestial Record: ${item.title} (${formatFriendlyDate(item.date)})\n\n${singlishData.translation}\n\n🇸🇬 Singapore Cosmic Saying & Wisdom:\n"${singlishData.quote}"\n\nTakeaway: ${singlishData.summary}\n\nArchive: NASA Astronomy Picture of the Day`;
      navigator.clipboard.writeText(copyPayload);
      setCopiedSinglish(true);
      setTimeout(() => setCopiedSinglish(false), 2200);
    }
  };

  const handleRegenerateSinglish = async () => {
    try {
      localStorage.removeItem(`singlish_apod_v2_${item.date}`);
      localStorage.removeItem(`singlish_apod_${item.date}`);
    } catch {
      // ignore
    }
    setIsLoadingSinglish(true);
    const fresh = await fetchSinglishExplanation(item.title, item.date, item.explanation);
    setSinglishData(fresh);
    setIsLoadingSinglish(false);
    if (onSinglishLoaded) {
      onSinglishLoaded(fresh);
    }
  };

  const handleShareLink = () => {
    const shareText = `Check out what the cosmos looked like on ${formatFriendlyDate(item.date)}: "${item.title}" from NASA APOD!`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${shareText}\n${window.location.href}`);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const scrollToDiscussion = () => {
    const el = document.getElementById('cosmic-discussion-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 py-6 md:py-8 antialiased">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="glass-card-raised rounded-2xl p-6 text-center space-y-3 shadow-2xl border border-[#ffd79b]/30">
            <div className="w-12 h-12 mx-auto rounded-full bg-[#ffd79b]/10 flex items-center justify-center border border-[#ffd79b]/40">
              <Sparkles className="w-6 h-6 text-[#ffd79b] animate-spin" />
            </div>
            <p className="font-serif text-lg text-[#ffd79b]">Aligning Observatory Lenses...</p>
            <p className="text-xs text-[#d6c4ac]">Retrieving deep space imagery for {item.date}</p>
          </div>
        </div>
      )}

      {/* Main Two-Column Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* LEFT COLUMN: Media Container & Quick Image Actions (Cols 1-7) */}
        <div className="lg:col-span-7 space-y-4">
          {/* APOD Image/Video Card */}
          <div
            id="apod-image-card"
            className="group relative rounded-2xl overflow-hidden glass-card border border-white/15 shadow-2xl transition-all duration-300"
          >
            {/* Corner Holiday / Cosmic Event Badges (pinned per design system) */}
            <div className="absolute top-3 left-3 z-20 pointer-events-auto flex flex-wrap items-center gap-2 max-w-[80%]">
              {holiday && (
                <span
                  id="holiday-event-badge"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide backdrop-blur-md shadow-lg border bg-[#bd06da]/60 text-[#fff0fb] border-[#faabff]/70 shadow-[#bd06da]/40 transition-all hover:bg-[#bd06da]/80"
                  title={`Public Holiday in ${currentCountryMeta.name} (${holiday.countryCode}): ${holiday.name} (${holiday.localName})`}
                >
                  <PartyPopper className="w-3.5 h-3.5 text-[#ffd79b]" />
                  <span>{currentCountryMeta.flag} {holiday.name}</span>
                </span>
              )}

              <span
                id="cosmic-event-badge"
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide backdrop-blur-md shadow-lg border ${
                  cosmicBadge.type === 'pink'
                    ? 'bg-[#bd06da]/40 text-[#fff0fb] border-[#faabff]/50'
                    : cosmicBadge.type === 'cyan'
                    ? 'bg-[#00363d]/60 text-[#85edff] border-[#00d5ed]/50'
                    : 'bg-[#432c00]/60 text-[#ffd79b] border-[#ffd79b]/50'
                }`}
              >
                {cosmicBadge.label}
              </span>
            </div>

            {/* Top Right Quick Floating Actions */}
            <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
              {/* Lightbox / Zoom */}
              <button
                id="expand-image-btn"
                onClick={onOpenLightbox}
                title="Inspect High Resolution"
                className="p-2 rounded-full bg-black/60 hover:bg-black/80 text-white/90 hover:text-[#ffd79b] border border-white/15 backdrop-blur-md transition-all shadow-md"
              >
                <Maximize2 className="w-4 h-4" />
              </button>

              {/* Bookmark / Favorite */}
              <button
                id="bookmark-image-btn"
                onClick={onToggleFavorite}
                title={isFavorite ? 'Remove from saved celestial vault' : 'Save to your cosmic vault'}
                className={`p-2 rounded-full border backdrop-blur-md transition-all shadow-md ${
                  isFavorite
                    ? 'bg-[#bd06da]/60 border-[#faabff] text-[#faabff]'
                    : 'bg-black/60 hover:bg-black/80 text-white/80 hover:text-[#faabff] border-white/15'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${isFavorite ? 'fill-[#faabff]' : ''}`} />
              </button>
            </div>

            {/* Media Presentation: Image or Video */}
            <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] bg-[#0e0c20] flex items-center justify-center overflow-hidden">
              {item.media_type === 'video' ? (
                <iframe
                  src={item.url}
                  title={item.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              ) : (
                <img
                  id="main-apod-photo"
                  src={item.url}
                  alt={item.title}
                  referrerPolicy="no-referrer"
                  onClick={onOpenLightbox}
                  className="w-full h-full object-cover cursor-zoom-in group-hover:scale-[1.015] transition-transform duration-500 rounded-2xl"
                />
              )}

              {/* Subtle gradient overlay at bottom for readability */}
              <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />

              {/* Date stamp watermark */}
              <div className="absolute bottom-3 left-3 z-10 text-[11px] font-mono text-white/80 bg-black/50 px-2.5 py-0.5 rounded-full backdrop-blur-sm border border-white/10">
                {item.date}
              </div>
            </div>

            {/* Image Meta Bar */}
            <div className="p-3.5 sm:p-4 bg-[#1b192e]/80 flex flex-wrap items-center justify-between gap-2 text-xs text-[#d6c4ac] border-t border-white/10">
              <div className="flex items-center gap-1.5 truncate max-w-[70%]">
                <span className="text-[#ffd79b] font-medium">Credit:</span>
                <span className="truncate">{item.copyright || 'NASA / APOD Science Archive'}</span>
              </div>

              <div className="flex items-center gap-2">
                {item.hdurl && (
                  <button
                    onClick={onOpenLightbox}
                    className="text-[11px] font-semibold text-[#85edff] hover:underline flex items-center gap-1"
                  >
                    <span>HD 4K Ready</span>
                  </button>
                )}
                <button
                  onClick={handleShareLink}
                  title="Share this view"
                  className="p-1 rounded hover:text-white transition-colors"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Share2 className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Quick Action Bar under Media */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            <button
              onClick={onOpenLightbox}
              id="action-zoom-hd"
              className="glass-card hover:bg-white/10 p-2.5 rounded-xl flex items-center justify-center gap-2 text-xs font-medium text-[#e4dffc] transition-all"
            >
              <Maximize2 className="w-3.5 h-3.5 text-[#ffd79b]" />
              <span>Full Screen</span>
            </button>

            <button
              onClick={onToggleFavorite}
              id="action-favorite-toggle"
              className={`p-2.5 rounded-xl flex items-center justify-center gap-2 text-xs font-medium border transition-all ${
                isFavorite
                  ? 'bg-[#bd06da]/20 border-[#faabff]/60 text-[#faabff]'
                  : 'glass-card hover:bg-white/10 border-white/10 text-[#e4dffc]'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isFavorite ? 'fill-[#faabff]' : ''}`} />
              <span>{isFavorite ? 'Preserved' : 'Save Vault'}</span>
            </button>

            <button
              onClick={onOpenKeepsake}
              id="action-keepsake"
              className="glass-card hover:bg-[#ffb300]/10 border-white/10 hover:border-[#ffb300]/40 p-2.5 rounded-xl flex items-center justify-center gap-2 text-xs font-medium text-[#ffd79b] transition-all"
            >
              <Award className="w-3.5 h-3.5 text-[#ffd79b]" />
              <span>Heirloom</span>
            </button>

            <button
              onClick={handleToggleNarration}
              id="action-narration"
              className={`p-2.5 rounded-xl flex items-center justify-center gap-2 text-xs font-medium border transition-all ${
                isPlayingNarration
                  ? 'bg-[#00d5ed]/20 border-[#00d5ed] text-[#85edff]'
                  : 'glass-card hover:bg-white/10 border-white/10 text-[#e4dffc]'
              }`}
            >
              {isPlayingNarration ? (
                <>
                  <Square className="w-3.5 h-3.5 text-[#85edff]" />
                  <span>Stop Voice</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-[#85edff]" />
                  <span>Read Aloud</span>
                </>
              )}
            </button>

            <button
              onClick={scrollToDiscussion}
              id="action-discuss"
              className="glass-card hover:bg-white/10 hover:border-[#ffd79b]/40 p-2.5 rounded-xl flex items-center justify-center gap-2 text-xs font-medium text-[#ffd79b] transition-all cursor-pointer col-span-2 sm:col-span-1"
              title="Join the cosmic community discussion on Disqus"
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#ffd79b]" />
              <span>Discuss</span>
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Tabs, Scientific Narrative & Cosmic Insights (Cols 8-12) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Pill Tabs Selector (per design guidelines) */}
          <div
            id="result-tabs"
            className="flex p-1 bg-[#1b192e] rounded-full border border-white/10 relative shadow-inner overflow-x-auto"
          >
            <button
              id="tab-btn-story"
              onClick={() => setActiveTab('story')}
              className={`flex-1 py-2 px-3 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 flex items-center justify-center gap-1.5 ${
                activeTab === 'story'
                  ? 'bg-[#ffd79b] text-[#432c00] shadow-[0_0_15px_rgba(255,215,155,0.3)]'
                  : 'text-[#d6c4ac] hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Cosmic Story</span>
            </button>

            <button
              id="tab-btn-keepsake"
              onClick={() => setActiveTab('keepsake')}
              className={`flex-1 py-2 px-3 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 flex items-center justify-center gap-1.5 ${
                activeTab === 'keepsake'
                  ? 'bg-[#ffd79b] text-[#432c00] shadow-[0_0_15px_rgba(255,215,155,0.3)]'
                  : 'text-[#d6c4ac] hover:text-white'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Keepsake</span>
            </button>

            <button
              id="tab-btn-context"
              onClick={() => setActiveTab('context')}
              className={`flex-1 py-2 px-3 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 flex items-center justify-center gap-1.5 ${
                activeTab === 'context'
                  ? 'bg-[#ffd79b] text-[#432c00] shadow-[0_0_15px_rgba(255,215,155,0.3)]'
                  : 'text-[#d6c4ac] hover:text-white'
              }`}
            >
              <Orbit className="w-3.5 h-3.5" />
              <span>Sky Facts</span>
            </button>

            <button
              id="tab-btn-milestones"
              onClick={() => setActiveTab('milestones')}
              className={`flex-1 py-2 px-3 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 flex items-center justify-center gap-1.5 ${
                activeTab === 'milestones'
                  ? 'bg-[#ffd79b] text-[#432c00] shadow-[0_0_15px_rgba(255,215,155,0.3)]'
                  : 'text-[#d6c4ac] hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Milestones</span>
            </button>

            <button
              id="tab-btn-discussion"
              onClick={scrollToDiscussion}
              className="flex-1 py-2 px-3 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 flex items-center justify-center gap-1.5 text-[#ffd79b] hover:text-white hover:bg-white/5 cursor-pointer"
              title="Jump to Disqus Discussion"
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#ffd79b]" />
              <span>Discuss</span>
            </button>
          </div>

          {/* TAB 1: COSMIC STORY */}
          {activeTab === 'story' && (
            <div className="glass-card rounded-2xl p-5 sm:p-6 space-y-5 border border-white/10">
              <div>
                <div className="flex items-center justify-between text-xs text-[#d6c4ac]/80 mb-1.5">
                  <span className="font-mono text-[#ffd79b] font-medium">
                    {formatFriendlyDate(item.date)}
                  </span>
                  <span className="flex items-center gap-1 text-[11px]">
                    <Clock className="w-3 h-3 text-[#faabff]" />
                    {daysAgo}
                  </span>
                </div>

                <h2
                  id="apod-story-title"
                  className="font-serif text-2xl sm:text-3xl font-bold text-[#ffd79b] tracking-tight leading-snug"
                >
                  {item.title}
                </h2>
              </div>

              {/* Text-to-speech audio reader pill */}
              <div className="p-3 rounded-xl bg-[#1b192e] border border-white/10 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center ${
                      isPlayingNarration
                        ? 'bg-[#00d5ed]/20 text-[#85edff]'
                        : 'bg-white/5 text-[#d6c4ac]'
                    }`}
                  >
                    <Volume2 className={`w-3.5 h-3.5 ${isPlayingNarration ? 'animate-pulse' : ''}`} />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-white">Narrated Cosmic Reading</p>
                    <p className="text-[10px] text-[#d6c4ac]/70">
                      {isPlayingNarration ? 'Playing calm narration...' : 'Listen to this day’s story'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleToggleNarration}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                    isPlayingNarration
                      ? 'bg-[#ffb4ab]/20 text-[#ffb4ab] border border-[#ffb4ab]/40 hover:bg-[#ffb4ab]/30'
                      : 'bg-[#ffb300] text-[#432c00] hover:bg-[#ffba38]'
                  }`}
                >
                  {isPlayingNarration ? 'Stop' : 'Listen'}
                </button>
              </div>

              {/* Explanation Editions Switcher */}
              <div className="pt-2 border-t border-white/10 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-1.5 text-xs text-[#d6c4ac]/80 font-medium">
                  <Languages className="w-3.5 h-3.5 text-[#faabff]" />
                  <span>Language Editions:</span>
                </div>
                <div className="flex rounded-full bg-[#161326] p-0.5 border border-white/10 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setExplanationViewMode('both')}
                    className={`px-2.5 py-1 rounded-full font-medium transition-all cursor-pointer ${
                      explanationViewMode === 'both'
                        ? 'bg-[#ffd79b] text-[#432c00] font-semibold shadow'
                        : 'text-[#d6c4ac] hover:text-white'
                    }`}
                  >
                    Both (NASA + 🇸🇬 Singlish)
                  </button>
                  <button
                    type="button"
                    onClick={() => setExplanationViewMode('singlish')}
                    className={`px-2.5 py-1 rounded-full font-medium transition-all cursor-pointer flex items-center gap-1 ${
                      explanationViewMode === 'singlish'
                        ? 'bg-[#bd06da] text-white font-semibold shadow'
                        : 'text-[#d6c4ac] hover:text-white'
                    }`}
                  >
                    <span>🇸🇬 Singlish Only</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setExplanationViewMode('nasa')}
                    className={`px-2.5 py-1 rounded-full font-medium transition-all cursor-pointer ${
                      explanationViewMode === 'nasa'
                        ? 'bg-[#2a273d] text-[#ffd79b] font-semibold shadow border border-white/10'
                        : 'text-[#d6c4ac] hover:text-white'
                    }`}
                  >
                    NASA English Only
                  </button>
                </div>
              </div>

              {/* 1. NASA Astronomical Explanation */}
              {(explanationViewMode === 'both' || explanationViewMode === 'nasa') && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-[#d6c4ac]/70 flex items-center gap-2">
                      <span>NASA Astronomical Explanation</span>
                      <span className="text-[10px] font-mono bg-white/5 border border-white/10 text-[#ffd79b] px-1.5 py-0.5 rounded">
                        Archival English
                      </span>
                    </h4>
                  </div>
                  <div className="text-sm sm:text-base text-[#e4dffc]/95 leading-relaxed font-normal space-y-3 font-sans">
                    {item.explanation.split('\n\n').map((para, idx) => (
                      <p key={idx}>{para.replace(/^Explanation:\s*/i, '')}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. Singapore (Singlish) Astronomical Breakdown - Right below NASA Explanation */}
              {(explanationViewMode === 'both' || explanationViewMode === 'singlish') && (
                <div
                  id="singapore-singlish-explanation"
                  className="rounded-2xl p-4 sm:p-5 bg-gradient-to-br from-[#2c1a3b]/90 via-[#1e172e]/95 to-[#161224] border border-[#faabff]/35 shadow-xl relative overflow-hidden space-y-3.5 transition-all mt-4"
                >
                  {/* Ambient accent background blur */}
                  <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#bd06da]/15 rounded-full blur-2xl pointer-events-none" />

                  {/* Header Row */}
                  <div className="flex flex-wrap items-start justify-between gap-3 relative z-10">
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#bd06da]/25 border border-[#faabff]/50 flex items-center justify-center text-base shadow-sm shrink-0 mt-0.5">
                        🇸🇬
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-xs sm:text-sm font-bold text-[#faabff] tracking-wide">
                            Singapore (Singlish) Story & Humor
                          </h4>
                          <span className="text-[10px] font-semibold bg-[#ffd79b]/15 text-[#ffd79b] border border-[#ffd79b]/30 px-2 py-0.5 rounded-full font-mono">
                            Cosmic Story & Wit
                          </span>
                        </div>
                        <p className="text-[11px] text-[#d6c4ac]/80 mt-0.5">
                          Translates dense NASA science into a crystal-clear story with relatable Singaporean humor, local analogies & cosmic wisdom
                        </p>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center gap-1.5 shrink-0 ml-auto">
                      {/* Audio listen button */}
                      <button
                        type="button"
                        id="btn-listen-singlish"
                        onClick={handleToggleSinglishNarration}
                        disabled={isLoadingSinglish || !singlishData}
                        className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                          isPlayingSinglishNarration
                            ? 'bg-[#faabff] text-[#4a0058] shadow-[0_0_12px_rgba(250,171,255,0.5)] animate-pulse'
                            : 'bg-[#bd06da]/30 hover:bg-[#bd06da]/50 text-[#faabff] border border-[#faabff]/40'
                        } disabled:opacity-50`}
                        title="Listen to Singlish translation"
                      >
                        {isPlayingSinglishNarration ? (
                          <>
                            <Square className="w-3 h-3 text-[#4a0058]" />
                            <span>Stop Audio</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3 h-3" />
                            <span>Listen Singlish</span>
                          </>
                        )}
                      </button>

                      {/* Copy Singlish text */}
                      <button
                        type="button"
                        id="btn-copy-singlish"
                        onClick={handleCopySinglish}
                        disabled={isLoadingSinglish || !singlishData}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#d6c4ac] hover:text-white border border-white/10 transition-colors cursor-pointer disabled:opacity-50"
                        title="Copy Singlish translation & quote"
                      >
                        {copiedSinglish ? (
                          <Check className="w-3.5 h-3.5 text-green-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {/* Regenerate Singlish */}
                      <button
                        type="button"
                        id="btn-regenerate-singlish"
                        onClick={handleRegenerateSinglish}
                        disabled={isLoadingSinglish}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#d6c4ac] hover:text-white border border-white/10 transition-colors cursor-pointer disabled:opacity-50"
                        title="Regenerate Singlish translation"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isLoadingSinglish ? 'animate-spin' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* Body Content */}
                  {isLoadingSinglish ? (
                    <div className="py-6 px-4 text-center rounded-xl bg-black/20 border border-white/5 space-y-2">
                      <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#faabff]/15 text-[#faabff] animate-spin">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <p className="text-xs font-medium text-[#faabff]">
                        Translating NASA explanation into clean Singapore English...
                      </p>
                      <p className="text-[11px] text-[#d6c4ac]/60">
                        Synthesizing accurate astronomical ideas and relatable Singapore quotes
                      </p>
                    </div>
                  ) : singlishData ? (
                    <div className="space-y-3 relative z-10">
                      {/* Translation text */}
                      <div className="space-y-2.5">
                        {(singlishData.translation || singlishData.singlish)
                          .split('\n\n')
                          .filter((p) => !p.includes('Relatable Singapore Saying:') && !p.includes('Quick Takeaway:') && !p.includes('Kopitiam Takeaway:'))
                          .map((para, pIdx) => (
                            <p
                              key={pIdx}
                              className="text-xs sm:text-sm text-[#e4dffc]/95 leading-relaxed font-normal"
                            >
                              {para}
                            </p>
                          ))}
                      </div>

                      {/* Relatable Singapore Quote / Saying Highlight Box */}
                      {singlishData.quote && (
                        <div className="mt-3 p-3.5 sm:p-4 rounded-xl bg-gradient-to-r from-[#bd06da]/20 via-[#ffd79b]/15 to-[#161224] border border-[#faabff]/40 shadow-sm space-y-2">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-[#faabff] uppercase tracking-wider">
                              <span>🇸🇬</span>
                              <span>Relatable Singaporean Quote & Wisdom</span>
                            </div>
                            <button
                              type="button"
                              onClick={onOpenKeepsake}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#ffd79b] hover:text-white bg-[#ffd79b]/15 hover:bg-[#ffd79b]/25 border border-[#ffd79b]/30 px-2.5 py-1 rounded-full transition-colors cursor-pointer"
                            >
                              <Award className="w-3.5 h-3.5" />
                              <span>View on Keepsake Certificate</span>
                            </button>
                          </div>

                          <p className="font-serif italic text-xs sm:text-sm text-[#ffd79b] leading-relaxed">
                            "{singlishData.quote}"
                          </p>

                          {singlishData.summary && (
                            <div className="pt-2 border-t border-white/10 text-xs text-[#e4dffc]/90 flex items-start gap-1.5">
                              <span className="text-[#85edff] font-semibold shrink-0">✦ Quick Takeaway:</span>
                              <span className="text-[#d6c4ac]">{singlishData.summary}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Quality & Origin Chips */}
                      <div className="pt-2.5 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-[10px] text-[#d6c4ac]/70">
                        <div className="flex flex-wrap gap-1.5">
                          <span className="px-2 py-0.5 rounded-full bg-[#bd06da]/20 text-[#faabff] border border-[#faabff]/30 font-mono">
                            ✦ Direct Translation
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-[#00d5ed]/15 text-[#85edff] border border-[#00d5ed]/30 font-mono">
                            ✦ Family-Friendly
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-[#ffd79b]/15 text-[#ffd79b] border border-[#ffd79b]/30 font-mono">
                            ✦ 🇸🇬 Keepsake Inscription Ready
                          </span>
                        </div>

                        <span className="font-mono text-[#faabff]/80">
                          {singlishData.source === 'gemini' ? '✦ Powered by Gemini AI' : '✦ Verified Engine'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-[#d6c4ac]">
                      No Singlish explanation available for this date.
                    </p>
                  )}
                </div>
              )}

              {/* Astronomical Metadata Chips */}
              <div className="pt-4 border-t border-white/10 flex flex-wrap gap-2 text-xs">
                <span className="px-2.5 py-1 rounded-lg bg-[#2a273d] text-[#85edff] border border-white/10 flex items-center gap-1">
                  <span>{moon.emoji}</span>
                  <span>{moon.phaseName}</span>
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-[#2a273d] text-[#faabff] border border-white/10">
                  ✦ {zodiac}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-[#2a273d] text-[#ffd79b] border border-white/10">
                  ★ NASA Registry
                </span>
              </div>

              {/* Community Discussion Shortcut */}
              <div className="pt-2 flex items-center justify-between gap-3 text-xs bg-[#161224] p-3.5 rounded-xl border border-white/10">
                <div className="flex items-center gap-2 min-w-0">
                  <MessageSquare className="w-4 h-4 text-[#ffd79b] shrink-0" />
                  <span className="text-[#e4dffc] truncate">Have memories or thoughts on this celestial date?</span>
                </div>
                <button
                  type="button"
                  onClick={scrollToDiscussion}
                  className="px-3 py-1.5 rounded-full bg-[#ffd79b]/15 hover:bg-[#ffd79b]/25 border border-[#ffd79b]/30 text-[#ffd79b] font-medium text-xs transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
                >
                  <span>Join Discussion</span>
                  <ChevronDown className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: HEIRLOOM KEEPSAKE PREVIEW */}
          {activeTab === 'keepsake' && (
            <div className="glass-card rounded-2xl p-5 sm:p-6 space-y-5 border border-white/10">
              <div className="text-center pb-3 border-b border-white/10">
                <span className="text-[10px] uppercase font-semibold tracking-widest text-[#ffd79b] block mb-1">
                  Personalized Heirloom
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#ffd79b]">
                  {userName}’s Sky Certificate
                </h3>
                <p className="text-xs text-[#d6c4ac] mt-0.5">
                  The celestial arrangement over Earth on {formatFriendlyDate(item.date)}
                </p>
              </div>

              {/* Card mini-preview */}
              <div className="bg-gradient-to-br from-[#1b192e] to-[#0e0c20] border border-[#ffd79b]/40 rounded-xl p-4 sm:p-5 relative overflow-hidden shadow-lg space-y-3">
                <div className="relative z-10 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] text-[#d6c4ac]/70 uppercase tracking-widest">
                        Cosmic Heirloom
                      </p>
                      <h4 className="font-serif text-base font-semibold text-[#ffd79b]">
                        {item.title}
                      </h4>
                    </div>
                    <span className="text-xs font-mono text-[#ffd79b]">{item.date}</span>
                  </div>

                  <p className="text-xs italic text-[#e4dffc]/80 border-l-2 border-[#ffd79b] pl-3 py-1">
                    "On the day marked for {userName}, the universe revealed this wonder across the starry void."
                  </p>

                  {/* Singapore Cosmic Quote in mini preview */}
                  {singlishData?.quote && (
                    <div className="bg-gradient-to-r from-[#bd06da]/15 via-[#ffd79b]/15 to-[#131125] border border-[#faabff]/35 rounded-lg p-2.5 text-center">
                      <span className="text-[9px] uppercase font-bold tracking-wider text-[#faabff] block mb-0.5">
                        🇸🇬 Singapore Cosmic Saying & Wisdom
                      </span>
                      <p className="font-serif italic text-xs text-[#ffd79b]">
                        "{singlishData.quote}"
                      </p>
                      {singlishData.summary && (
                        <p className="text-[10px] text-[#d6c4ac]/80 mt-1 font-sans">
                          ✦ {singlishData.summary}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-[#d6c4ac]/80 pt-2 border-t border-white/10">
                    <div>
                      <span className="text-white/50 block">Lunar Light:</span>
                      <span className="text-[#85edff]">{moon.phaseName} ({moon.illumination}%)</span>
                    </div>
                    <div>
                      <span className="text-white/50 block">Constellation:</span>
                      <span className="text-[#faabff]">{zodiac}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                <button
                  onClick={onOpenKeepsake}
                  id="open-full-keepsake-btn"
                  className="flex-1 py-3 px-4 rounded-full bg-[#ffb300] hover:bg-[#ffba38] text-[#432c00] text-xs font-bold glow-button transition-all flex items-center justify-center gap-2"
                >
                  <Award className="w-4 h-4" />
                  <span>Customize & Print Keepsake</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: SKY CONTEXT & ASTRONOMICAL FACTS */}
          {activeTab === 'context' && (
            <div className="glass-card rounded-2xl p-5 sm:p-6 space-y-4 border border-white/10">
              <h3 className="font-serif text-lg font-bold text-[#ffd79b]">
                Astronomical Context for {item.date}
              </h3>

              <div className="space-y-3">
                {/* Moon Aspect */}
                <div className="p-3.5 rounded-xl bg-[#1b192e] border border-white/10 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-2xl">
                    {moon.emoji}
                  </div>
                  <div className="flex-1">
                    <h5 className="text-xs font-semibold text-white">
                      Moon Phase: {moon.phaseName}
                    </h5>
                    <p className="text-[11px] text-[#d6c4ac]/70">
                      Illumination was {moon.illumination}% with a lunar age of {moon.moonAgeDays} days in cycle.
                    </p>
                  </div>
                </div>

                {/* Solar & Constellation */}
                <div className="p-3.5 rounded-xl bg-[#1b192e] border border-white/10 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-[#faabff]">
                    <Orbit className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h5 className="text-xs font-semibold text-white">
                      Sun Constellation: {zodiac}
                    </h5>
                    <p className="text-[11px] text-[#d6c4ac]/70">
                      As Earth moved along its elliptical orbit, the sun sat positioned against this backdrop of stars.
                    </p>
                  </div>
                </div>

                {/* Cosmic Scale & Photons */}
                <div className="p-3.5 rounded-xl bg-[#1b192e] border border-white/10 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-[#85edff]">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h5 className="text-xs font-semibold text-white">
                      Cosmic Time & Light Travel
                    </h5>
                    <p className="text-[11px] text-[#d6c4ac]/70">
                      Deep sky objects recorded in this portrait emit photons that traveled across thousands to millions of light-years before reaching our instruments.
                    </p>
                  </div>
                </div>

                {/* Days elapsed */}
                <div className="p-3.5 rounded-xl bg-[#1b192e] border border-white/10 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-[#ffd79b]">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h5 className="text-xs font-semibold text-white">
                      Earth Time Elapsed
                    </h5>
                    <p className="text-[11px] text-[#d6c4ac]/70">
                      {daysAgo} have passed since this exact view was chronicled into NASA’s daily registry.
                    </p>
                  </div>
                </div>

                {/* Terrestrial Public Holiday & Cultural Calendar (Powered by /api/holidays) */}
                <div id="holiday-context-card" className="p-4 rounded-xl bg-[#161327] border border-white/10 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#bd06da]/20 border border-[#faabff]/40 flex items-center justify-center text-[#faabff]">
                        <PartyPopper className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="text-xs font-semibold text-white flex items-center gap-1.5">
                          <span>Terrestrial Public Holidays</span>
                          <span className="text-[9px] text-[#85edff] font-mono bg-[#85edff]/10 px-1.5 py-0.5 rounded border border-[#85edff]/20">
                            /api/holidays
                          </span>
                        </h5>
                        <p className="text-[10px] text-[#d6c4ac]/70">
                          Civil calendar events in {currentCountryMeta.flag} {currentCountryMeta.name}
                        </p>
                      </div>
                    </div>

                    {/* Country Code Switcher */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <select
                        id="country-iso-select"
                        value={selectedCountry}
                        onChange={(e) => handleSelectCountry(e.target.value)}
                        className="bg-[#131125] text-xs text-[#ffd79b] border border-white/20 rounded-lg px-2 py-1 outline-none focus:border-[#ffd79b]"
                      >
                        {SUPPORTED_COUNTRIES.map((c) => (
                          <option key={c.code} value={c.code} className="bg-[#131125] text-[#ffd79b]">
                            {c.flag} {c.code} ({c.name})
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        id="custom-iso-toggle-btn"
                        onClick={() => setShowCustomInput(!showCustomInput)}
                        className="text-[10px] text-[#85edff] hover:underline px-1 py-0.5"
                      >
                        {showCustomInput ? 'Cancel' : 'Swap ISO...'}
                      </button>
                    </div>
                  </div>

                  {/* Optional Custom ISO Code Prompt */}
                  {showCustomInput && (
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-black/40 border border-[#85edff]/30 text-xs">
                      <input
                        type="text"
                        placeholder="2-letter ISO (e.g. DE, JP, FR)"
                        maxLength={2}
                        value={customCountryInput}
                        onChange={(e) => setCustomCountryInput(e.target.value.toUpperCase())}
                        className="bg-transparent text-white px-2 py-1 uppercase font-mono tracking-widest outline-none border-b border-[#85edff]/50 w-28 text-center"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (customCountryInput.trim().length === 2) {
                            handleSelectCountry(customCountryInput);
                            setShowCustomInput(false);
                          }
                        }}
                        className="px-2.5 py-1 rounded bg-[#85edff]/20 hover:bg-[#85edff]/30 text-[#85edff] text-xs font-medium transition-colors"
                      >
                        Apply ISO
                      </button>
                      <span className="text-[10px] text-[#d6c4ac]/60">
                        Swap SG for any ISO code
                      </span>
                    </div>
                  )}

                  {/* Active Holiday on this Date */}
                  {holiday ? (
                    <div className="p-3 rounded-lg bg-gradient-to-r from-[#bd06da]/20 to-[#432c00]/30 border border-[#faabff]/40 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-[#faabff] flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-[#ffd79b]" />
                          Official Public Holiday in {currentCountryMeta.name} ({holiday.countryCode})
                        </span>
                        <span className="text-[10px] font-mono text-[#ffd79b] bg-black/40 px-2 py-0.5 rounded">
                          {holiday.date}
                        </span>
                      </div>
                      <p className="text-sm font-serif font-bold text-white">
                        {currentCountryMeta.flag} {holiday.name}
                      </p>
                      {holiday.localName && holiday.localName !== holiday.name && (
                        <p className="text-xs text-[#ffd79b]/80 italic">
                          Local Name: {holiday.localName}
                        </p>
                      )}
                      <p className="text-[11px] text-[#d6c4ac]/90 leading-relaxed pt-1">
                        While citizens on Earth celebrated {holiday.name}, light from the heavens was captured by NASA instruments to form this astronomical heirloom.
                      </p>
                    </div>
                  ) : (
                    <div className="p-3 rounded-lg bg-white/5 border border-white/5 space-y-1">
                      <div className="flex items-center justify-between text-xs text-[#d6c4ac]">
                        <span>Civic Calendar in {currentCountryMeta.flag} {currentCountryMeta.name}:</span>
                        <span className="text-[11px] text-[#ffd79b] font-medium">Regular Civil Day</span>
                      </div>
                      <p className="text-[11px] text-[#d6c4ac]/70">
                        No official public holiday was recorded on {item.date} in {currentCountryMeta.name}.
                      </p>
                    </div>
                  )}

                  {/* Year Holiday Explorer Dropdown */}
                  <div className="pt-1">
                    <button
                      type="button"
                      id="toggle-year-holidays-btn"
                      onClick={() => setShowYearHolidays(!showYearHolidays)}
                      className="w-full flex items-center justify-between text-xs text-[#d6c4ac] hover:text-[#ffd79b] py-1 transition-colors"
                    >
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#ffd79b]" />
                        <span>All Public Holidays in {item.date.split('-')[0]} for {currentCountryMeta.name} ({yearHolidays.length})</span>
                      </span>
                      {showYearHolidays ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {showYearHolidays && (
                      <div className="mt-2 max-h-48 overflow-y-auto space-y-1.5 pr-1 text-xs">
                        {yearHolidays.length === 0 ? (
                          <p className="text-[11px] text-[#d6c4ac]/60 italic py-1">
                            Loading public holidays for {currentCountryMeta.code}...
                          </p>
                        ) : (
                          yearHolidays.map((h, idx) => {
                            const isCurrent = h.date === item.date;
                            return (
                              <div
                                key={`${h.date}-${idx}`}
                                onClick={() => onSelectDate(h.date)}
                                title={`Jump to APOD for ${h.date}`}
                                className={`p-2 rounded-lg flex items-center justify-between cursor-pointer transition-all ${
                                  isCurrent
                                    ? 'bg-[#bd06da]/30 border border-[#faabff]/60 text-white font-semibold'
                                    : 'bg-black/30 hover:bg-white/10 border border-white/5 text-[#d6c4ac] hover:text-white'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-[10px] text-[#ffd79b]">
                                    {h.date}
                                  </span>
                                  <span>{h.name}</span>
                                </div>
                                <div className="flex items-center gap-1 text-[10px] text-[#85edff]">
                                  {isCurrent ? (
                                    <span className="text-[#ffd79b] font-medium">Viewing Now</span>
                                  ) : (
                                    <span>Explore APOD →</span>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: MILESTONES ARCHIVE */}
          {activeTab === 'milestones' && (
            <div className="glass-card rounded-2xl p-5 sm:p-6 space-y-4 border border-white/10">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#ffd79b]">
                  Historical Cosmic Milestones
                </h3>
                <p className="text-xs text-[#d6c4ac]">
                  Jump to celebrated snapshots across 30+ years of the APOD archive
                </p>
              </div>

              <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
                {MILESTONES.map((ms) => (
                  <div
                    key={ms.id}
                    onClick={() => onSelectDate(ms.date)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-3 group ${
                      item.date === ms.date
                        ? 'bg-[#ffd79b]/10 border-[#ffd79b]'
                        : 'bg-[#1b192e] border-white/10 hover:border-[#ffd79b]/40 hover:bg-[#2a273d]'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-white/10">
                      <img
                        src={ms.thumbnailUrl}
                        alt={ms.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono text-[#ffd79b] font-medium">
                          {ms.date}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/10 text-white/80">
                          {ms.badge}
                        </span>
                      </div>
                      <h4 className="text-xs font-semibold text-white truncate group-hover:text-[#ffd79b] transition-colors">
                        {ms.title}
                      </h4>
                      <p className="text-[11px] text-[#d6c4ac]/60 truncate">
                        {ms.subtitle}
                      </p>
                    </div>

                    <ChevronRight className="w-4 h-4 text-[#d6c4ac]/50 group-hover:text-[#ffd79b] transition-colors shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* COSMIC COMMUNITY DISCUSSION (DISQUS UNIVERSAL EMBED) */}
      <ErrorBoundary fallbackTitle="Cosmic Discussion Offline">
        <DisqusComments date={item.date} title={item.title} />
      </ErrorBoundary>
    </div>
  );
};
