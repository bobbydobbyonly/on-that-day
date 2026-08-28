import React, { useEffect, useState } from 'react';
import { MessageSquare, RefreshCw, Sparkles, ExternalLink } from 'lucide-react';
import { formatFriendlyDate } from '../utils/astronomyUtils';

interface DisqusCommentsProps {
  date: string;
  title: string;
}

declare global {
  interface Window {
    DISQUS?: {
      reset: (args: { reload: boolean; config?: () => void }) => void;
    };
    disqus_config?: () => void;
  }
}

export const DisqusComments: React.FC<DisqusCommentsProps> = ({ date, title }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [key, setKey] = useState(0);

  useEffect(() => {
    // Construct canonical URL and page identifier for this specific astronomical date
    const canonicalOrigin = window.location.origin || 'https://on-that-day.app';
    const pageUrl = `${canonicalOrigin}/?date=${date}`;
    const pageIdentifier = `apod-${date}`;
    const pageTitle = `${title} (${formatFriendlyDate(date)}) - On That Day`;

    // Configure Disqus
    const configFn = function (this: any) {
      this.page.url = pageUrl;
      this.page.identifier = pageIdentifier;
      this.page.title = pageTitle;
    };

    window.disqus_config = configFn;

    // If Disqus script is already loaded in the document, reset with the new date's thread
    if (window.DISQUS && typeof window.DISQUS.reset === 'function') {
      try {
        window.DISQUS.reset({
          reload: true,
          config: configFn,
        });
        setIsLoaded(true);
      } catch (err) {
        console.warn('Failed to reset Disqus:', err);
      }
    } else {
      // Check if script tag already exists
      const existingScript = document.getElementById('disqus-embed-script');
      if (!existingScript) {
        const d = document;
        const s = d.createElement('script');
        s.id = 'disqus-embed-script';
        s.src = 'https://on-that-day.disqus.com/embed.js';
        s.setAttribute('data-timestamp', String(+new Date()));
        s.async = true;
        s.onload = () => setIsLoaded(true);
        (d.head || d.body).appendChild(s);
      } else {
        setIsLoaded(true);
      }
    }
  }, [date, title, key]);

  const handleReload = () => {
    setKey((prev) => prev + 1);
  };

  return (
    <section
      id="cosmic-discussion-section"
      className="mt-8 rounded-2xl bg-[#131125] border border-white/10 p-5 sm:p-8 shadow-[0_0_40px_rgba(0,0,0,0.4)] relative overflow-hidden"
      style={{ colorScheme: 'dark' }}
    >
      {/* Subtle glowing ambient accent */}
      <div className="absolute -top-24 -right-24 w-60 h-60 bg-[#bd06da]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-[#00d5ed]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-white/10 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#bd06da]/25 to-[#ffd79b]/20 border border-white/15 flex items-center justify-center text-[#ffd79b] shadow-sm">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-serif text-lg sm:text-xl font-bold text-[#ffd79b] tracking-tight">
                Cosmic Community Discussion
              </h3>
              <span className="text-[10px] font-semibold bg-[#ffd79b]/15 text-[#ffd79b] border border-[#ffd79b]/30 px-2 py-0.5 rounded-full font-mono">
                Disqus
              </span>
            </div>
            <p className="text-xs text-[#d6c4ac]/80 mt-0.5">
              Discuss <span className="text-white font-medium">"{title}"</span> ({formatFriendlyDate(date)}), ask astrophysics questions, or leave your birthday memories.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#d6c4ac] hover:text-white border border-white/10 text-xs transition-colors cursor-pointer"
            title="Refresh comments thread"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Refresh Thread</span>
          </button>

          <a
            href="https://on-that-day.disqus.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[11px] text-[#85edff] hover:underline px-2 py-1"
            title="Visit Disqus channel"
          >
            <span className="hidden sm:inline">on-that-day.disqus.com</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* The Disqus container */}
      <div className="relative z-10 min-h-[220px]">
        <div id="disqus_thread" className="w-full text-[#e4dffc]" />

        <noscript>
          <div className="p-4 rounded-xl bg-black/40 border border-white/10 text-xs text-[#d6c4ac]">
            Please enable JavaScript to view the{' '}
            <a
              href="https://disqus.com/?ref_noscript"
              className="text-[#ffd79b] underline hover:text-white"
            >
              comments powered by Disqus.
            </a>
          </div>
        </noscript>
      </div>

      {/* Footer reassurance */}
      <div className="relative z-10 pt-4 mt-6 border-t border-white/5 flex flex-wrap items-center justify-between text-[11px] text-[#d6c4ac]/60 gap-2">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-[#faabff]" />
          <span>Comments are tied to celestial date <strong className="text-white/80">{date}</strong></span>
        </div>
        <span>Powered by Disqus Universal Code</span>
      </div>
    </section>
  );
};
