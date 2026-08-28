import React, { useState } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw, ExternalLink, Download, Sparkles } from 'lucide-react';

interface ImageViewerModalProps {
  imageUrl: string;
  hdUrl?: string;
  title: string;
  date: string;
  copyright?: string;
  onClose: () => void;
}

export const ImageViewerModal: React.FC<ImageViewerModalProps> = ({
  imageUrl,
  hdUrl,
  title,
  date,
  copyright,
  onClose,
}) => {
  const [scale, setScale] = useState(1);
  const activeUrl = hdUrl || imageUrl;

  const handleZoomIn = () => setScale((s) => Math.min(s + 0.3, 3.5));
  const handleZoomOut = () => setScale((s) => Math.max(s - 0.3, 0.7));
  const handleReset = () => setScale(1);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-xl p-4 sm:p-6 overflow-hidden">
      {/* Top action bar */}
      <div className="flex items-center justify-between z-10 w-full max-w-7xl mx-auto pb-4 border-b border-white/10 text-white">
        <div className="max-w-[70%]">
          <h3 className="font-serif text-lg sm:text-xl font-bold text-[#ffd79b] truncate">
            {title}
          </h3>
          <p className="text-xs text-[#d6c4ac] flex items-center gap-2">
            <span>{date}</span>
            {copyright && <span>• {copyright}</span>}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <div className="hidden sm:flex items-center gap-1 bg-white/10 rounded-full px-2 py-1">
            <button
              onClick={handleZoomOut}
              title="Zoom out"
              className="p-1.5 hover:text-[#ffd79b] transition-colors"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono px-1">{Math.round(scale * 100)}%</span>
            <button
              onClick={handleZoomIn}
              title="Zoom in"
              className="p-1.5 hover:text-[#ffd79b] transition-colors"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleReset}
              title="Reset scale"
              className="p-1.5 hover:text-[#ffd79b] transition-colors border-l border-white/10 ml-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* External link */}
          <a
            href={activeUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Open full resolution in new tab"
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-[#ffd79b] transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
          </a>

          {/* Close */}
          <button
            onClick={onClose}
            id="close-lightbox-btn"
            title="Close viewer"
            className="p-2 rounded-full bg-white/10 hover:bg-red-500/30 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Image Stage */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing my-4">
        <div
          className="transition-transform duration-200 ease-out max-h-full max-w-full flex items-center justify-center"
          style={{ transform: `scale(${scale})` }}
        >
          <img
            src={activeUrl}
            alt={title}
            referrerPolicy="no-referrer"
            className="max-h-[82vh] max-w-[90vw] object-contain rounded-lg shadow-2xl select-none"
          />
        </div>
      </div>

      {/* Footer Info */}
      <div className="z-10 max-w-7xl mx-auto w-full flex justify-between items-center text-xs text-[#d6c4ac]/60 pt-2 border-t border-white/10">
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#ffd79b]" />
          NASA Astronomical Archive Observation
        </span>
        <span>Click and zoom to examine stellar features</span>
      </div>
    </div>
  );
};
