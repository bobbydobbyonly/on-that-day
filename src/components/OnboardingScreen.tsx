import React, { useState } from 'react';
import {
  Sparkles,
  User,
  Calendar,
  Info,
  ArrowRight,
  Compass,
  HelpCircle,
  PartyPopper,
  ChevronRight,
} from 'lucide-react';
import {
  APOD_MIN_DATE,
  getTodayDateString,
  getRandomApodDate,
  formatFriendlyDate,
  formatShortDate,
} from '../utils/astronomyUtils';
import { SingaporeHolidaysList } from './SingaporeHolidaysList';

interface OnboardingScreenProps {
  onStart: (name: string, date: string) => void;
  initialName?: string;
  initialDate?: string;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  onStart,
  initialName = '',
  initialDate = '',
}) => {
  const todayStr = getTodayDateString();
  const friendlyToday = formatFriendlyDate(todayStr);
  const shortToday = formatShortDate(todayStr);

  const [activeTab, setActiveTab] = useState<'custom' | 'sg-holidays'>('custom');
  const [name, setName] = useState(initialName);
  const [date, setDate] = useState(initialDate || todayStr);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const cleanName = name.trim() || 'Stargazer';
    if (!date) {
      setError('Please select a date to begin your journey.');
      return;
    }

    if (date < APOD_MIN_DATE) {
      setError('The NASA APOD archive starts on June 16, 1995.');
      return;
    }

    if (date > todayStr) {
      setError('The cosmos of tomorrow has not yet been recorded. Please pick a date up to today.');
      return;
    }

    setError(null);
    onStart(cleanName, date);
  };

  const handleQuickSelect = (quickDate: string, defaultName?: string) => {
    const chosenName = name.trim() || defaultName || 'Stargazer';
    setDate(quickDate);
    onStart(chosenName, quickDate);
  };

  const handleHolidaySelect = (holidayDate: string, holidayName: string) => {
    const chosenName = name.trim() || `${holidayName} Stargazer`;
    setDate(holidayDate);
    onStart(chosenName, holidayDate);
  };

  return (
    <div className="relative min-h-screen w-full cosmic-gradient flex flex-col justify-center items-center px-4 sm:px-6 py-10 antialiased overflow-x-hidden selection:bg-[#ffb300]/30 selection:text-[#ffd79b]">
      {/* Ambient Deep Space Nebula Background */}
      <div
        className="fixed inset-0 z-0 opacity-25 mix-blend-screen pointer-events-none bg-cover bg-center"
        style={{
          backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBdNlOV7SIbgN5PzLw3KnJdQFUASscJ5f6RTMEEprdwKgiuZ6CrQ5A7A0iIChl8cy4gba2rmghVMofNdxPZEJnS2LCLhh66t06p-xZL2dXWn-DEtVqW6ch88MKCg_hRobjoOHF7HsUF2Cm4aaJ1_oaQiYLMjtjpOpL_nRJDOAuFGScybOfQxtiyL1Y8ukuyTC0kJwJRSXv2VdkXkAuSPzaLWF7RsZAuFb_a8WtcqDy0uDmMc6c88kqxCw')`,
        }}
      />

      {/* Decorative cosmic glow orbs */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#00d5ed]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-10 right-10 w-80 h-80 bg-[#bd06da]/10 rounded-full blur-3xl pointer-events-none" />

      <main className="relative z-10 w-full max-w-lg sm:max-w-xl mx-auto my-auto">
        {/* Header Section */}
        <header className="text-center mb-6 sm:mb-8">
          <div
            id="app-sparkle-badge"
            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#2a273d] mb-4 shadow-[0_0_30px_rgba(255,215,155,0.22)] border border-[#ffd79b]/20 transition-transform duration-500 hover:scale-105"
          >
            <Sparkles className="w-8 h-8 text-[#ffd79b] fill-[#ffd79b]/80 animate-pulse" />
          </div>
          <h1
            id="app-title"
            className="font-serif text-3xl sm:text-4xl md:text-[42px] font-bold text-[#ffd79b] mb-2 tracking-tight leading-tight"
          >
            On That Day
          </h1>
          <p
            id="app-subtitle"
            className="text-base sm:text-lg text-[#d6c4ac] font-normal leading-relaxed"
          >
            What did the sky look like on your day?
          </p>
        </header>

        {/* Onboarding Form Card */}
        <section
          id="onboarding-card"
          className="glass-card rounded-2xl p-5 sm:p-7 shadow-2xl relative overflow-hidden transition-all duration-300"
        >
          {/* Decorative blur orb */}
          <div className="absolute -top-10 -right-10 w-36 h-36 bg-[#faabff]/10 rounded-full blur-2xl pointer-events-none" />

          {/* Mode Switcher Tabs */}
          <div className="flex rounded-xl bg-[#131125]/80 p-1 border border-white/10 mb-6">
            <button
              type="button"
              id="tab-btn-custom-date"
              onClick={() => setActiveTab('custom')}
              className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'custom'
                  ? 'bg-[#ffd79b] text-[#432c00] shadow-[0_0_15px_rgba(255,215,155,0.3)]'
                  : 'text-[#d6c4ac] hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Custom Date &amp; [Today]</span>
            </button>
            <button
              type="button"
              id="tab-btn-sg-holidays"
              onClick={() => setActiveTab('sg-holidays')}
              className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'sg-holidays'
                  ? 'bg-[#bd06da] text-[#fff0fb] shadow-[0_0_15px_rgba(189,6,218,0.4)] border border-[#faabff]/40'
                  : 'text-[#d6c4ac] hover:text-white'
              }`}
            >
              <PartyPopper className="w-3.5 h-3.5 text-[#faabff]" />
              <span>🇸🇬 Singapore Holidays</span>
              <span className="text-[10px] bg-black/40 px-1.5 py-0.5 rounded text-[#ffd79b] font-mono">
                11
              </span>
            </button>
          </div>

          {/* TAB 1: Custom Date and [Today] Cosmic Data */}
          {activeTab === 'custom' ? (
            <div>
              <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                {/* Name Input */}
                <div className="relative group">
                  <label
                    htmlFor="user-name"
                    className="text-xs font-semibold text-[#d6c4ac] uppercase tracking-wider mb-2 block transition-colors group-focus-within:text-[#ffd79b]"
                  >
                    Your Name
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#d6c4ac]/70 group-focus-within:text-[#ffd79b] transition-colors pointer-events-none">
                      <User className="w-5 h-5" />
                    </span>
                    <input
                      id="user-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="E.g., Stargazer"
                      className="w-full bg-[#1f1d32]/60 border-b-2 border-white/10 focus:border-[#ffd79b] focus:bg-[#2a273d]/70 rounded-t-lg pl-11 pr-4 py-3 text-base text-[#e4dffc] placeholder:text-[#d6c4ac]/40 transition-all outline-none"
                      autoComplete="name"
                    />
                  </div>
                </div>

                {/* Date Input with [Today] Shortcut */}
                <div className="relative group">
                  <div className="flex items-center justify-between mb-2">
                    <label
                      htmlFor="user-date"
                      className="text-xs font-semibold text-[#d6c4ac] uppercase tracking-wider block transition-colors group-focus-within:text-[#ffd79b]"
                    >
                      Your Special Date
                    </label>

                    {/* Prominent [Today] quick fill button */}
                    <button
                      type="button"
                      id="btn-use-today-fill"
                      onClick={() => {
                        setDate(todayStr);
                        setError(null);
                      }}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#ffd79b] hover:text-white bg-[#ffd79b]/15 hover:bg-[#ffd79b]/25 border border-[#ffd79b]/40 rounded-full px-2.5 py-0.5 transition-all cursor-pointer"
                      title="Set date to today"
                    >
                      <Sparkles className="w-3 h-3 text-[#ffd79b]" />
                      <span>Use [Today] ({shortToday})</span>
                    </button>
                  </div>

                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#d6c4ac]/70 group-focus-within:text-[#ffd79b] transition-colors pointer-events-none">
                      <Calendar className="w-5 h-5" />
                    </span>
                    <input
                      id="user-date"
                      type="date"
                      min={APOD_MIN_DATE}
                      max={todayStr}
                      value={date}
                      onChange={(e) => {
                        setDate(e.target.value);
                        setError(null);
                      }}
                      required
                      className="w-full bg-[#1f1d32]/60 border-b-2 border-white/10 focus:border-[#ffd79b] focus:bg-[#2a273d]/70 rounded-t-lg pl-11 pr-4 py-3 text-base text-[#e4dffc] placeholder:text-[#d6c4ac]/40 transition-all outline-none [color-scheme:dark]"
                    />
                  </div>

                  {/* Archive limit note */}
                  <p
                    id="archive-note"
                    className="text-xs text-[#d6c4ac]/70 mt-2.5 flex items-center justify-between flex-wrap gap-1"
                  >
                    <span className="flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-[#ffd79b]/80 shrink-0" />
                      <span>The archive begins June 16, 1995</span>
                    </span>
                    {date === todayStr && (
                      <span className="text-[#ffd79b] font-medium text-[11px]">
                        ★ Selected: Today&apos;s live sky
                      </span>
                    )}
                  </p>
                </div>

                {/* Error Message */}
                {error && (
                  <div
                    id="form-error"
                    className="text-sm text-[#ffb4ab] bg-[#93000a]/20 border border-[#ffb4ab]/30 rounded-lg p-3 flex items-start gap-2"
                  >
                    <HelpCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Submit Button (Amber glow) */}
                <button
                  id="submit-explore-btn"
                  type="submit"
                  className="w-full bg-[#ffb300] hover:bg-[#ffba38] active:scale-[0.98] text-[#6b4900] font-semibold text-base rounded-full py-3.5 glow-button transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:-translate-y-0.5"
                >
                  <span>
                    Start Exploring {date === todayStr ? `[Today] (${shortToday})` : date}
                  </span>
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </button>

                {/* Option to see [Today]'s Cosmic Data Directly */}
                <button
                  type="button"
                  id="btn-see-today-sky"
                  onClick={() => handleQuickSelect(todayStr, name.trim() || 'Stargazer')}
                  className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#2a273d] via-[#352f4c] to-[#25223a] hover:from-[#3a3454] hover:to-[#2e2b47] border border-[#ffd79b]/40 hover:border-[#ffd79b] text-[#ffd79b] font-medium text-xs sm:text-sm transition-all duration-300 flex items-center justify-between shadow-md group hover:shadow-[0_0_20px_rgba(255,215,155,0.25)] cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-[#ffd79b]/20 flex items-center justify-center text-[#ffd79b] group-hover:scale-110 transition-transform shrink-0">
                      <Sparkles className="w-3.5 h-3.5 fill-[#ffd79b]/60" />
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-semibold text-white group-hover:text-[#ffd79b] transition-colors">
                        See [Today]&apos;s Cosmic Data
                      </div>
                      <div className="text-[11px] text-[#d6c4ac]/70">
                        {friendlyToday} • Today&apos;s NASA APOD
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-[#ffd79b] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>View Sky</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </button>
              </form>

              {/* Quick Curated Celestial Moments */}
              <div className="mt-6 pt-5 border-t border-white/10">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#d6c4ac]/60 mb-2.5 text-center">
                  Or pick an iconic celestial moment
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {/* [Today] pill */}
                  <button
                    type="button"
                    id="quick-today-moment"
                    onClick={() => handleQuickSelect(todayStr, 'Stargazer')}
                    className="px-3 py-1.5 text-xs rounded-full bg-[#ffd79b]/20 hover:bg-[#ffd79b]/30 text-[#ffd79b] border border-[#ffd79b]/50 font-semibold transition-all flex items-center gap-1 shadow-[0_0_10px_rgba(255,215,155,0.15)] cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-[#ffd79b]" />
                    <span>[Today] • {shortToday}</span>
                  </button>

                  <button
                    type="button"
                    id="quick-first-apod"
                    onClick={() => handleQuickSelect('1995-06-16', 'Pioneer')}
                    className="px-3 py-1.5 text-xs rounded-full bg-[#1f1d32]/80 hover:bg-[#2a273d] text-[#e4dffc] border border-white/10 hover:border-[#ffd79b]/40 transition-colors cursor-pointer"
                  >
                    ✦ 1st APOD (1995)
                  </button>
                  <button
                    type="button"
                    id="quick-jwst"
                    onClick={() => handleQuickSelect('2022-07-12', 'Webb Stargazer')}
                    className="px-3 py-1.5 text-xs rounded-full bg-[#1f1d32]/80 hover:bg-[#2a273d] text-[#e4dffc] border border-white/10 hover:border-[#ffd79b]/40 transition-colors cursor-pointer"
                  >
                    ★ JWST Deep Sky
                  </button>
                  <button
                    type="button"
                    id="quick-eclipse"
                    onClick={() => handleQuickSelect('2024-04-08', 'Totality Observer')}
                    className="px-3 py-1.5 text-xs rounded-full bg-[#1f1d32]/80 hover:bg-[#2a273d] text-[#e4dffc] border border-white/10 hover:border-[#ffd79b]/40 transition-colors cursor-pointer"
                  >
                    🌑 Eclipse 2024
                  </button>
                  <button
                    type="button"
                    id="quick-random"
                    onClick={() => handleQuickSelect(getRandomApodDate(), 'Cosmic Voyager')}
                    className="px-3 py-1.5 text-xs rounded-full bg-[#1f1d32]/80 hover:bg-[#2a273d] text-[#85edff] border border-[#00d5ed]/30 hover:border-[#85edff] transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Compass className="w-3 h-3" />
                    <span>Random Day</span>
                  </button>
                </div>
              </div>

              {/* Singapore Public Holidays Home Banner */}
              <div
                id="home-sg-holidays-banner"
                onClick={() => setActiveTab('sg-holidays')}
                className="mt-6 p-3.5 rounded-xl bg-gradient-to-r from-[#bd06da]/15 via-[#1a162b] to-[#ffd79b]/10 border border-[#faabff]/30 hover:border-[#faabff]/60 transition-all cursor-pointer group flex items-center justify-between shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#bd06da]/25 border border-[#faabff]/40 flex items-center justify-center text-[#faabff] text-lg group-hover:scale-110 transition-transform shrink-0">
                    🇸🇬
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <span>Explore Singapore Public Holidays</span>
                      <span className="text-[10px] bg-[#bd06da]/50 text-[#fff0fb] px-1.5 py-0.2 rounded font-mono border border-[#faabff]/30">
                        11 Holidays
                      </span>
                    </div>
                    <p className="text-[11px] text-[#d6c4ac]/70">
                      Discover cosmic skies on National Day, Chinese New Year, Deepavali &amp; more
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#faabff] group-hover:translate-x-1 transition-transform shrink-0" />
              </div>
            </div>
          ) : (
            /* TAB 2: Singapore Public Holidays Explorer */
            <SingaporeHolidaysList
              onSelectHoliday={handleHolidaySelect}
              todayStr={todayStr}
              onBackToCustomDate={() => setActiveTab('custom')}
            />
          )}
        </section>

        {/* Subtitle Footer */}
        <footer className="mt-6 text-center">
          <p
            id="footer-quote"
            className="text-xs sm:text-sm text-[#d6c4ac]/60 font-medium tracking-wide"
          >
            Your journey through the cosmos awaits.
          </p>
        </footer>
      </main>
    </div>
  );
};

