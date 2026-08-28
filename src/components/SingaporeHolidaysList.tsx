import React, { useState, useEffect } from 'react';
import { PublicHoliday } from '../types';
import { fetchHolidaysForYear, SINGAPORE_HOLIDAYS_2026 } from '../services/holidayService';
import { formatFriendlyDate, formatDayOfWeek } from '../utils/astronomyUtils';
import {
  PartyPopper,
  Calendar,
  Search,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
  ChevronLeft,
} from 'lucide-react';

interface SingaporeHolidaysListProps {
  onSelectHoliday: (date: string, holidayName: string) => void;
  todayStr: string;
  onBackToCustomDate?: () => void;
}

const AVAILABLE_YEARS = [2026, 2025, 2024, 2023, 2022, 2020];

export const SingaporeHolidaysList: React.FC<SingaporeHolidaysListProps> = ({
  onSelectHoliday,
  todayStr,
  onBackToCustomDate,
}) => {
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [holidays, setHolidays] = useState<PublicHoliday[]>(SINGAPORE_HOLIDAYS_2026);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetchHolidaysForYear(selectedYear, 'SG')
      .then((data) => {
        if (isMounted) {
          if (Array.isArray(data) && data.length > 0) {
            setHolidays(data);
          } else if (selectedYear === 2026) {
            setHolidays(SINGAPORE_HOLIDAYS_2026);
          }
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          if (selectedYear === 2026) {
            setHolidays(SINGAPORE_HOLIDAYS_2026);
          }
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [selectedYear]);

  const filteredHolidays = holidays.filter((h) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      h.name.toLowerCase().includes(q) ||
      (h.localName && h.localName.toLowerCase().includes(q)) ||
      h.date.includes(q)
    );
  });

  const getHolidayStatus = (dateStr: string) => {
    if (dateStr === todayStr) {
      return { label: 'Today!', type: 'today' };
    }
    if (dateStr > todayStr) {
      return { label: 'Upcoming', type: 'upcoming' };
    }
    return { label: 'Past archive', type: 'past' };
  };

  return (
    <div id="sg-holidays-container" className="space-y-4">
      {/* Header with Navigation */}
      <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#bd06da]/25 border border-[#faabff]/40 flex items-center justify-center text-[#faabff] text-base">
            🇸🇬
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>Singapore Public Holidays</span>
              <span className="text-[10px] font-mono bg-[#bd06da]/40 text-[#fff0fb] px-1.5 py-0.5 rounded border border-[#faabff]/30">
                {filteredHolidays.length} Events
              </span>
            </h3>
            <p className="text-[11px] text-[#d6c4ac]/70">
              Select any national holiday to view its NASA cosmic snapshot
            </p>
          </div>
        </div>

        {onBackToCustomDate && (
          <button
            type="button"
            id="btn-back-to-custom-date"
            onClick={onBackToCustomDate}
            className="inline-flex items-center gap-1 text-xs font-medium text-[#ffd79b] hover:text-white bg-white/5 hover:bg-white/10 px-2.5 py-1.5 rounded-lg border border-white/10 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Custom Date / [Today]</span>
          </button>
        )}
      </div>

      {/* Year Selector & Search Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {/* Year Pills */}
        <div className="flex items-center gap-1 overflow-x-auto py-1 no-scrollbar">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#d6c4ac]/60 mr-1 shrink-0">
            Year:
          </span>
          {AVAILABLE_YEARS.map((y) => (
            <button
              key={y}
              type="button"
              id={`year-filter-${y}`}
              onClick={() => setSelectedYear(y)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all shrink-0 ${
                selectedYear === y
                  ? 'bg-[#ffd79b] text-[#432c00] font-bold shadow-[0_0_10px_rgba(255,215,155,0.3)]'
                  : 'bg-[#131125]/80 hover:bg-[#2a273d] text-[#d6c4ac] border border-white/5'
              }`}
            >
              {y}
            </button>
          ))}
        </div>

        {/* Search Filter */}
        <div className="relative">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#d6c4ac]/50 pointer-events-none">
            <Search className="w-3.5 h-3.5" />
          </span>
          <input
            type="text"
            id="sg-holiday-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search holiday or date..."
            className="w-full bg-[#131125]/80 border border-white/10 focus:border-[#faabff] rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-[#d6c4ac]/40 outline-none transition-all"
          />
        </div>
      </div>

      {/* Holiday Cards List */}
      <div
        id="sg-holidays-scroll-list"
        className="max-h-[380px] overflow-y-auto space-y-2 pr-1 custom-scrollbar"
      >
        {loading ? (
          <div className="p-8 text-center text-xs text-[#d6c4ac]/70 space-y-2">
            <Sparkles className="w-5 h-5 text-[#ffd79b] animate-spin mx-auto" />
            <p>Loading Singapore public holidays from cosmic registry...</p>
          </div>
        ) : filteredHolidays.length === 0 ? (
          <div className="p-6 text-center text-xs text-[#d6c4ac]/70 bg-black/20 rounded-xl border border-white/5">
            <p>No holidays found matching &quot;{searchQuery}&quot; for {selectedYear}.</p>
          </div>
        ) : (
          filteredHolidays.map((holiday, idx) => {
            const status = getHolidayStatus(holiday.date);
            const dayOfWeek = formatDayOfWeek(holiday.date);
            const isToday = holiday.date === todayStr;

            return (
              <div
                key={`${holiday.date}-${idx}`}
                id={`sg-holiday-item-${holiday.date}`}
                className={`p-3 rounded-xl border transition-all duration-200 flex items-center justify-between gap-3 group ${
                  isToday
                    ? 'bg-gradient-to-r from-[#bd06da]/35 via-[#3f1246]/40 to-[#ffd79b]/15 border-[#faabff] shadow-[0_0_20px_rgba(189,6,218,0.3)]'
                    : 'bg-[#161327]/80 hover:bg-[#201c37] border-white/10 hover:border-[#faabff]/40'
                }`}
              >
                {/* Left: Date Badge and Details */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 border ${
                      isToday
                        ? 'bg-[#bd06da] border-[#faabff] text-white'
                        : 'bg-[#1f1d32] border-white/10 text-[#d6c4ac]'
                    }`}
                  >
                    <span className="text-[9px] font-semibold uppercase tracking-wider text-[#ffd79b]">
                      {holiday.date.split('-')[1]} / {dayOfWeek}
                    </span>
                    <span className="text-base font-bold font-mono leading-none mt-0.5 text-white">
                      {holiday.date.split('-')[2]}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-[#faabff] transition-colors">
                        {holiday.name}
                      </h4>
                      {isToday && (
                        <span className="text-[9px] font-bold bg-[#ffd79b] text-[#432c00] px-1.5 py-0.2 rounded-full animate-pulse flex items-center gap-0.5">
                          <Sparkles className="w-2.5 h-2.5" />
                          [Today]
                        </span>
                      )}
                      {!isToday && status.type === 'upcoming' && (
                        <span className="text-[9px] bg-[#85edff]/20 text-[#85edff] px-1.5 py-0.2 rounded border border-[#85edff]/30">
                          Upcoming
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-[#d6c4ac]/75 mt-0.5 flex-wrap">
                      <span>{formatFriendlyDate(holiday.date)}</span>
                      {holiday.localName && holiday.localName !== holiday.name && (
                        <span className="text-[#ffd79b]/80 italic">
                          ({holiday.localName})
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Action Button */}
                <button
                  type="button"
                  id={`btn-explore-sg-${holiday.date}`}
                  onClick={() => onSelectHoliday(holiday.date, holiday.name)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 flex items-center gap-1.5 transition-all duration-200 cursor-pointer shadow-sm ${
                    isToday
                      ? 'bg-[#ffd79b] hover:bg-[#ffba38] text-[#432c00] font-bold shadow-[0_0_12px_rgba(255,215,155,0.4)]'
                      : 'bg-[#bd06da]/80 hover:bg-[#bd06da] text-white group-hover:scale-105'
                  }`}
                  title={`View APOD for ${holiday.name} on ${holiday.date}`}
                >
                  <span className="hidden sm:inline">Explore Sky</span>
                  <span className="sm:hidden">Sky</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Helpful Footer Note */}
      <div className="pt-2 flex items-center justify-between text-[11px] text-[#d6c4ac]/60">
        <span>Public holidays retrieved via /api/holidays/SG</span>
        <span className="text-[#ffd79b]/80 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-[#ffd79b]" />
          Instant Cosmic Alignment
        </span>
      </div>
    </div>
  );
};
