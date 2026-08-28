import React, { useState } from 'react';
import { Sparkles, User, Calendar, Info, ArrowRight, Compass, HelpCircle } from 'lucide-react';
import { APOD_MIN_DATE, getTodayDateString, getRandomApodDate } from '../utils/astronomyUtils';

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
  const [name, setName] = useState(initialName);
  const [date, setDate] = useState(initialDate || '2000-01-01');
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

  return (
    <div className="relative min-h-screen w-full cosmic-gradient flex flex-col justify-center items-center px-5 py-10 antialiased overflow-x-hidden selection:bg-[#ffb300]/30 selection:text-[#ffd79b]">
      {/* Ambient Deep Space Nebula Background (hotlinked from design HTML) */}
      <div
        className="fixed inset-0 z-0 opacity-25 mix-blend-screen pointer-events-none bg-cover bg-center"
        style={{
          backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBdNlOV7SIbgN5PzLw3KnJdQFUASscJ5f6RTMEEprdwKgiuZ6CrQ5A7A0iIChl8cy4gba2rmghVMofNdxPZEJnS2LCLhh66t06p-xZL2dXWn-DEtVqW6ch88MKCg_hRobjoOHF7HsUF2Cm4aaJ1_oaQiYLMjtjpOpL_nRJDOAuFGScybOfQxtiyL1Y8ukuyTC0kJwJRSXv2VdkXkAuSPzaLWF7RsZAuFb_a8WtcqDy0uDmMc6c88kqxCw')`,
        }}
      />

      {/* Decorative cosmic glow orbs */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#00d5ed]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-10 right-10 w-80 h-80 bg-[#bd06da]/10 rounded-full blur-3xl pointer-events-none" />

      <main className="relative z-10 w-full max-w-md mx-auto my-auto">
        {/* Header Section */}
        <header className="text-center mb-8 sm:mb-10">
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
          className="glass-card rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden transition-all duration-300"
        >
          {/* Decorative blur orb */}
          <div className="absolute -top-10 -right-10 w-36 h-36 bg-[#faabff]/10 rounded-full blur-2xl pointer-events-none" />

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            {/* Name Input */}
            <div className="relative group">
              <label
                htmlFor="user-name"
                className="text-xs font-semibold text-[#d6c4ac] uppercase tracking-wider mb-2 block transition-colors group-focus-within:text-[#ffd79b]"
              >
                First Name
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

            {/* Date Input */}
            <div className="relative group">
              <label
                htmlFor="user-date"
                className="text-xs font-semibold text-[#d6c4ac] uppercase tracking-wider mb-2 block transition-colors group-focus-within:text-[#ffd79b]"
              >
                Your Special Date
              </label>
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
                className="text-xs text-[#d6c4ac]/70 mt-2.5 flex items-center gap-1.5"
              >
                <Info className="w-3.5 h-3.5 text-[#ffd79b]/80 shrink-0" />
                <span>The archive begins June 16, 1995</span>
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
              className="w-full bg-[#ffb300] hover:bg-[#ffba38] active:scale-[0.98] text-[#6b4900] font-semibold text-base rounded-full py-4 mt-2 glow-button transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:-translate-y-0.5"
            >
              <span>Start Exploring</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>
          </form>

          {/* Quick Curated Celestial Dates */}
          <div className="mt-7 pt-5 border-t border-white/10">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#d6c4ac]/60 mb-2.5 text-center">
              Or pick an iconic celestial moment
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <button
                type="button"
                id="quick-first-apod"
                onClick={() => handleQuickSelect('1995-06-16', 'Pioneer')}
                className="px-3 py-1.5 text-xs rounded-full bg-[#1f1d32]/80 hover:bg-[#2a273d] text-[#e4dffc] border border-white/10 hover:border-[#ffd79b]/40 transition-colors"
              >
                ✦ 1st APOD (1995)
              </button>
              <button
                type="button"
                id="quick-jwst"
                onClick={() => handleQuickSelect('2022-07-12', 'Webb Stargazer')}
                className="px-3 py-1.5 text-xs rounded-full bg-[#1f1d32]/80 hover:bg-[#2a273d] text-[#e4dffc] border border-white/10 hover:border-[#ffd79b]/40 transition-colors"
              >
                ★ JWST Deep Sky
              </button>
              <button
                type="button"
                id="quick-eclipse"
                onClick={() => handleQuickSelect('2024-04-08', 'Totality Observer')}
                className="px-3 py-1.5 text-xs rounded-full bg-[#1f1d32]/80 hover:bg-[#2a273d] text-[#e4dffc] border border-white/10 hover:border-[#ffd79b]/40 transition-colors"
              >
                🌑 Eclipse 2024
              </button>
              <button
                type="button"
                id="quick-random"
                onClick={() => handleQuickSelect(getRandomApodDate(), 'Cosmic Voyager')}
                className="px-3 py-1.5 text-xs rounded-full bg-[#1f1d32]/80 hover:bg-[#2a273d] text-[#85edff] border border-[#00d5ed]/30 hover:border-[#85edff] transition-colors flex items-center gap-1"
              >
                <Compass className="w-3 h-3" />
                <span>Random Day</span>
              </button>
            </div>
          </div>
        </section>

        {/* Subtitle Footer */}
        <footer className="mt-8 text-center">
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
