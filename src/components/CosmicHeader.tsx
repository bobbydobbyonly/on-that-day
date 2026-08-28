import React, { useState } from 'react';
import {
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Shuffle,
  Volume2,
  VolumeX,
  Award,
  Bookmark,
  ArrowLeft,
  User,
} from 'lucide-react';
import { APOD_MIN_DATE, getTodayDateString, getRandomApodDate, formatFriendlyDate } from '../utils/astronomyUtils';

interface CosmicHeaderProps {
  userName: string;
  currentDate: string;
  onDateChange: (newDate: string) => void;
  onResetUser: () => void;
  onOpenKeepsake: () => void;
  onOpenFavorites: () => void;
  favoritesCount: number;
  isAudioPlaying: boolean;
  onToggleAudio: () => void;
}

export const CosmicHeader: React.FC<CosmicHeaderProps> = ({
  userName,
  currentDate,
  onDateChange,
  onResetUser,
  onOpenKeepsake,
  onOpenFavorites,
  favoritesCount,
  isAudioPlaying,
  onToggleAudio,
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [inputDate, setInputDate] = useState(currentDate);
  const todayStr = getTodayDateString();

  const handlePrevDay = () => {
    const current = new Date(currentDate + 'T12:00:00Z');
    current.setUTCDate(current.getUTCDate() - 1);
    const newDateStr = current.toISOString().split('T')[0];
    if (newDateStr >= APOD_MIN_DATE) {
      onDateChange(newDateStr);
    }
  };

  const handleNextDay = () => {
    const current = new Date(currentDate + 'T12:00:00Z');
    current.setUTCDate(current.getUTCDate() + 1);
    const newDateStr = current.toISOString().split('T')[0];
    if (newDateStr <= todayStr) {
      onDateChange(newDateStr);
    }
  };

  const handleRandomDate = () => {
    const random = getRandomApodDate();
    onDateChange(random);
  };

  const handleDateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputDate >= APOD_MIN_DATE && inputDate <= todayStr) {
      onDateChange(inputDate);
      setShowDatePicker(false);
    }
  };

  const isPrevDisabled = currentDate <= APOD_MIN_DATE;
  const isNextDisabled = currentDate >= todayStr;

  return (
    <header className="sticky top-0 z-40 w-full glass-card border-b border-white/10 px-4 py-3 sm:px-6 backdrop-blur-xl">
      <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left: Brand & Return / User Greeting */}
        <div className="flex items-center justify-between w-full md:w-auto gap-3">
          <div className="flex items-center gap-2.5">
            <button
              id="back-to-home-btn"
              onClick={onResetUser}
              title="Return to start screen"
              className="p-1.5 rounded-lg text-[#d6c4ac] hover:text-[#ffd79b] hover:bg-white/5 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 cursor-pointer" onClick={onResetUser}>
              <div className="w-8 h-8 rounded-full bg-[#2a273d] border border-[#ffd79b]/30 flex items-center justify-center shadow-[0_0_15px_rgba(255,215,155,0.2)]">
                <Sparkles className="w-4 h-4 text-[#ffd79b]" />
              </div>
              <div>
                <h1 className="font-serif font-bold text-lg text-[#ffd79b] tracking-tight leading-none">
                  On That Day
                </h1>
                <p className="text-[11px] text-[#d6c4ac]/70 flex items-center gap-1 mt-0.5">
                  <span>✦ {userName}’s Sky</span>
                </p>
              </div>
            </div>
          </div>

          {/* Quick mobile controls */}
          <div className="flex md:hidden items-center gap-1.5">
            <button
              onClick={onToggleAudio}
              title={isAudioPlaying ? 'Mute ambient space drone' : 'Play cosmic ambient drone'}
              className={`p-2 rounded-full border transition-all ${
                isAudioPlaying
                  ? 'bg-[#00d5ed]/20 border-[#00d5ed] text-[#85edff] shadow-[0_0_10px_rgba(0,213,237,0.3)]'
                  : 'bg-white/5 border-white/10 text-[#d6c4ac]/80'
              }`}
            >
              {isAudioPlaying ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={onOpenKeepsake}
              title="Generate Keepsake"
              className="p-2 rounded-full bg-[#ffb300]/15 border border-[#ffb300]/40 text-[#ffd79b]"
            >
              <Award className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Center: Cosmic Date Navigator */}
        <div className="flex items-center gap-1.5 sm:gap-2 bg-[#1b192e]/80 border border-white/10 rounded-full px-2 py-1 shadow-inner">
          {/* Previous Day */}
          <button
            id="prev-day-btn"
            onClick={handlePrevDay}
            disabled={isPrevDisabled}
            title="Previous Day in Cosmos"
            className="p-1.5 rounded-full text-[#d6c4ac] hover:text-[#ffd79b] hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Date Picker trigger */}
          <div className="relative">
            <button
              id="header-date-picker-btn"
              onClick={() => {
                setInputDate(currentDate);
                setShowDatePicker(!showDatePicker);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-xs sm:text-sm font-medium text-[#e4dffc] hover:text-[#ffd79b] transition-colors"
            >
              <Calendar className="w-3.5 h-3.5 text-[#ffd79b]" />
              <span className="font-mono tracking-tight">{currentDate}</span>
            </button>

            {/* Dropdown date selector */}
            {showDatePicker && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 p-3 rounded-xl glass-card-raised shadow-2xl z-50">
                <form onSubmit={handleDateSubmit} className="space-y-2.5">
                  <label className="text-[11px] font-semibold text-[#d6c4ac] uppercase tracking-wider block">
                    Jump to Cosmic Date
                  </label>
                  <input
                    type="date"
                    min={APOD_MIN_DATE}
                    max={todayStr}
                    value={inputDate}
                    onChange={(e) => setInputDate(e.target.value)}
                    className="w-full bg-[#131125] border border-white/20 rounded-lg px-2.5 py-1.5 text-xs text-[#e4dffc] outline-none focus:border-[#ffd79b] [color-scheme:dark]"
                  />
                  <div className="flex justify-between gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowDatePicker(false)}
                      className="px-2.5 py-1 text-xs text-[#d6c4ac]/70 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 text-xs font-semibold bg-[#ffb300] text-[#432c00] rounded-full hover:bg-[#ffba38]"
                    >
                      Go
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Next Day */}
          <button
            id="next-day-btn"
            onClick={handleNextDay}
            disabled={isNextDisabled}
            title="Next Day in Cosmos"
            className="p-1.5 rounded-full text-[#d6c4ac] hover:text-[#ffd79b] hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Divider */}
          <div className="w-[1px] h-4 bg-white/10 mx-0.5" />

          {/* Random Date */}
          <button
            id="random-day-btn"
            onClick={handleRandomDate}
            title="Wander to a random cosmic date"
            className="p-1.5 rounded-full text-[#85edff] hover:text-[#00d5ed] hover:bg-white/5 transition-colors"
          >
            <Shuffle className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right: Actions & Tools (Desktop) */}
        <div className="hidden md:flex items-center gap-2">
          {/* Ambient Sound Toggle */}
          <button
            id="ambient-audio-toggle"
            onClick={onToggleAudio}
            title={isAudioPlaying ? 'Mute celestial synthesizer' : 'Turn on cosmic ambient drone'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              isAudioPlaying
                ? 'bg-[#00d5ed]/15 border-[#00d5ed]/60 text-[#85edff] shadow-[0_0_12px_rgba(0,213,237,0.3)]'
                : 'bg-white/5 border-white/10 text-[#d6c4ac] hover:border-white/20'
            }`}
          >
            {isAudioPlaying ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-[#85edff] animate-pulse" />
                <span>Cosmic Sound On</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-[#d6c4ac]/60" />
                <span>Cosmic Sound</span>
              </>
            )}
          </button>

          {/* Heirloom Keepsake Modal */}
          <button
            id="header-keepsake-btn"
            onClick={onOpenKeepsake}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#ffb300] hover:bg-[#ffba38] text-[#432c00] glow-button transition-all shadow-md"
          >
            <Award className="w-3.5 h-3.5" />
            <span>Heirloom Keepsake</span>
          </button>

          {/* Saved Favorites */}
          <button
            id="header-favorites-btn"
            onClick={onOpenFavorites}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white/5 hover:bg-white/10 text-[#e4dffc] border border-white/10 transition-colors"
          >
            <Bookmark className="w-3.5 h-3.5 text-[#faabff]" />
            <span>Favorites ({favoritesCount})</span>
          </button>
        </div>
      </div>
    </header>
  );
};
