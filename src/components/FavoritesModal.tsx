import React from 'react';
import { FavoriteDate } from '../types';
import { formatFriendlyDate } from '../utils/astronomyUtils';
import { X, Bookmark, Trash2, ArrowUpRight, Sparkles } from 'lucide-react';

interface FavoritesModalProps {
  favorites: FavoriteDate[];
  onSelectDate: (date: string) => void;
  onRemoveFavorite: (date: string) => void;
  onClose: () => void;
}

export const FavoritesModal: React.FC<FavoritesModalProps> = ({
  favorites,
  onSelectDate,
  onRemoveFavorite,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-[#131125] border border-white/15 rounded-2xl shadow-2xl p-6 text-[#e4dffc]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#bd06da]/20 border border-[#faabff]/30 flex items-center justify-center">
              <Bookmark className="w-4 h-4 text-[#faabff]" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-[#ffd79b]">
                Saved Cosmic Moments
              </h3>
              <p className="text-xs text-[#d6c4ac]">
                {favorites.length} {favorites.length === 1 ? 'day' : 'days'} preserved in your vault
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-[#d6c4ac] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of Favorites */}
        <div className="max-h-[60vh] overflow-y-auto my-4 space-y-2.5 pr-1">
          {favorites.length === 0 ? (
            <div className="text-center py-12 text-[#d6c4ac]/60">
              <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-40 text-[#ffd79b]" />
              <p className="text-sm font-medium">No saved moments yet</p>
              <p className="text-xs mt-1">
                Click the bookmark star on any cosmic day to keep it in your personal constellation.
              </p>
            </div>
          ) : (
            favorites.map((fav) => (
              <div
                key={fav.date}
                className="group flex items-center justify-between gap-3 p-2.5 rounded-xl bg-[#1b192e] border border-white/10 hover:border-[#ffd79b]/40 transition-all hover:bg-[#2a273d]"
              >
                {/* Thumbnail */}
                <div
                  onClick={() => {
                    onSelectDate(fav.date);
                    onClose();
                  }}
                  className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0 cursor-pointer bg-black/40"
                >
                  <img
                    src={fav.url}
                    alt={fav.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Details */}
                <div
                  onClick={() => {
                    onSelectDate(fav.date);
                    onClose();
                  }}
                  className="flex-1 min-w-0 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-[#ffd79b] font-semibold">
                      {fav.date}
                    </span>
                    <span className="text-[10px] text-[#d6c4ac]/60">
                      {formatFriendlyDate(fav.date)}
                    </span>
                  </div>
                  <h4 className="text-sm font-medium text-white truncate group-hover:text-[#ffd79b] transition-colors">
                    {fav.title}
                  </h4>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => {
                      onSelectDate(fav.date);
                      onClose();
                    }}
                    title="View this cosmic date"
                    className="p-1.5 rounded-full hover:bg-white/10 text-[#d6c4ac] hover:text-[#85edff]"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onRemoveFavorite(fav.date)}
                    title="Remove from favorites"
                    className="p-1.5 rounded-full hover:bg-red-500/20 text-[#d6c4ac] hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-medium text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
