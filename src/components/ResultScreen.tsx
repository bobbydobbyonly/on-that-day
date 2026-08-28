import React, { useState, useEffect } from 'react';
import { ApodItem, FavoriteDate } from '../types';
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
  Info,
  Layers,
  BookOpen,
} from 'lucide-react';

interface ResultScreenProps {
  item: ApodItem;
  userName: string;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onOpenLightbox: () => void;
  onOpenKeepsake: () => void;
  onSelectDate: (date: string) => void;
  isLoading: boolean;
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
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('story');
  const [isPlayingNarration, setIsPlayingNarration] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const moon = calculateMoonPhase(item.date);
  const zodiac = getZodiacSign(item.date);
  const daysAgo = getDaysAgoText(item.date);
  const cosmicBadge = getCosmicBadge(item.date, item.title);

  // Reset speech when changing dates
  useEffect(() => {
    stopSpeaking();
    setIsPlayingNarration(false);
  }, [item.date]);

  const handleToggleNarration = () => {
    if (isPlayingNarration) {
      stopSpeaking();
      setIsPlayingNarration(false);
    } else {
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

  const handleShareLink = () => {
    const shareText = `Check out what the cosmos looked like on ${formatFriendlyDate(item.date)}: "${item.title}" from NASA APOD!`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${shareText}\n${window.location.href}`);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
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
            {/* Corner Holiday / Cosmic Event Badge (pinned per design system) */}
            <div className="absolute top-3 left-3 z-20 pointer-events-none">
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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
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

              {/* Scientific Explanation (Per design system: body-md Inter with generous line-height) */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#d6c4ac]/60">
                  NASA Astronomical Explanation
                </h4>
                <div className="text-sm sm:text-base text-[#e4dffc]/95 leading-relaxed font-normal space-y-3 font-sans">
                  {item.explanation.split('\n\n').map((para, idx) => (
                    <p key={idx}>{para.replace(/^Explanation:\s*/i, '')}</p>
                  ))}
                </div>
              </div>

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
              <div className="bg-gradient-to-br from-[#1b192e] to-[#0e0c20] border border-[#ffd79b]/40 rounded-xl p-4 sm:p-5 relative overflow-hidden shadow-lg">
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
    </div>
  );
};
