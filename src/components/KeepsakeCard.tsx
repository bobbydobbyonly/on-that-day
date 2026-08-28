import React, { useState } from 'react';
import { ApodItem, MoonPhaseInfo } from '../types';
import { formatFriendlyDate, getZodiacSign, calculateMoonPhase } from '../utils/astronomyUtils';
import { Sparkles, Award, Share2, Copy, Check, Printer, X, Heart } from 'lucide-react';

interface KeepsakeCardProps {
  item: ApodItem;
  userName: string;
  onClose: () => void;
}

export const KeepsakeCard: React.FC<KeepsakeCardProps> = ({
  item,
  userName,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [dedication, setDedication] = useState(
    'May your journey through life shine as brightly as the ancient starlight recorded on this day.'
  );
  const moon = calculateMoonPhase(item.date);
  const zodiac = getZodiacSign(item.date);

  const handleCopyText = () => {
    const text = `✦ HEIRLOOM OF THE COSMOS ✦\nDedicated to: ${userName}\nCelestial Date: ${formatFriendlyDate(item.date)}\nCosmic Event: ${item.title}\nMoon Phase: ${moon.phaseName} (${moon.illumination}% lit)\nConstellation: ${zodiac}\n"${dedication}"\nArchive: NASA Astronomy Picture of the Day\nDiscovered on "On That Day"`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#131125] border border-[#ffd79b]/40 rounded-2xl shadow-[0_0_50px_rgba(255,179,0,0.25)] p-6 sm:p-8 my-8 text-[#e4dffc]">
        {/* Close Button */}
        <button
          onClick={onClose}
          id="close-keepsake-btn"
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-[#d6c4ac] hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Decorative celestial banner */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full bg-[#ffd79b]/10 border border-[#ffd79b]/30 text-[#ffd79b] text-xs font-semibold uppercase tracking-widest mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Official Cosmic Keepsake</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl text-[#ffd79b] font-bold">
            The Sky of {userName}
          </h2>
          <p className="text-xs sm:text-sm text-[#d6c4ac] mt-1">
            Astronomical Record for {formatFriendlyDate(item.date)}
          </p>
        </div>

        {/* The Card Frame (Printable heirloom layout) */}
        <div
          id="printable-keepsake"
          className="relative bg-gradient-to-b from-[#1b192e] to-[#0e0c20] border-2 border-[#ffd79b]/40 rounded-xl p-6 sm:p-8 shadow-inner overflow-hidden"
        >
          {/* Corner gold accents */}
          <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#ffd79b]" />
          <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[#ffd79b]" />
          <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#ffd79b]" />
          <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#ffd79b]" />

          {/* Background watermark nebula */}
          <div
            className="absolute inset-0 opacity-10 bg-cover bg-center pointer-events-none"
            style={{ backgroundImage: `url('${item.url}')` }}
          />

          <div className="relative z-10 space-y-5">
            {/* Header statement */}
            <div className="text-center border-b border-white/10 pb-4">
              <p className="text-[11px] uppercase tracking-[0.2em] text-[#d6c4ac]/70">
                NASA Astronomy Picture of the Day Archive
              </p>
              <h3 className="font-serif text-xl sm:text-2xl text-[#ffd79b] font-semibold mt-1">
                {item.title}
              </h3>
            </div>

            {/* Media preview and snapshot */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
              <div className="sm:col-span-1">
                <div className="relative rounded-lg overflow-hidden border border-white/20 aspect-square shadow-lg">
                  <img
                    src={item.url}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <span className="absolute bottom-2 left-2 text-[10px] text-white/80 bg-black/50 px-2 py-0.5 rounded backdrop-blur-sm">
                    {item.date}
                  </span>
                </div>
              </div>

              <div className="sm:col-span-2 space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-[#d6c4ac]/80">Cosmic Date:</span>
                  <span className="font-medium text-[#ffd79b]">{formatFriendlyDate(item.date)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-[#d6c4ac]/80">Lunar Aspect:</span>
                  <span className="font-medium text-[#85edff] flex items-center gap-1">
                    <span>{moon.emoji}</span>
                    <span>{moon.phaseName} ({moon.illumination}%)</span>
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-[#d6c4ac]/80">Solar Constellation:</span>
                  <span className="font-medium text-[#faabff]">{zodiac}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-[#d6c4ac]/80">Archive Heritage:</span>
                  <span className="font-medium text-white/90">Official APOD Registry</span>
                </div>
              </div>
            </div>

            {/* Dedication quote editable */}
            <div className="bg-[#131125]/70 border border-white/10 rounded-lg p-3 sm:p-4 text-center">
              <label className="text-[10px] uppercase font-semibold text-[#d6c4ac]/60 block mb-1">
                Personal Dedication Inscription
              </label>
              <textarea
                value={dedication}
                onChange={(e) => setDedication(e.target.value)}
                rows={2}
                className="w-full bg-transparent text-center italic text-xs sm:text-sm text-[#ffd79b] outline-none resize-none focus:border-b focus:border-[#ffd79b]/40"
              />
            </div>

            {/* Card Footer Stamp */}
            <div className="flex items-center justify-between pt-3 border-t border-white/10 text-[10px] text-[#d6c4ac]/60">
              <span>Verified NASA APOD Registry</span>
              <span className="font-serif italic">Humanizing the Cosmos</span>
              <span>Witnessed: {userName}</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-end gap-3 mt-6">
          <button
            onClick={handleCopyText}
            id="copy-keepsake-btn"
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 text-xs text-[#e4dffc] font-medium transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied Keepsake' : 'Copy Inscription'}</span>
          </button>

          <button
            onClick={handlePrint}
            id="print-keepsake-btn"
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#ffd79b]/15 hover:bg-[#ffd79b]/25 text-xs text-[#ffd79b] font-medium border border-[#ffd79b]/30 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print Heirloom</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-[#ffb300] hover:bg-[#ffba38] text-[#432c00] text-xs font-semibold glow-button transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
