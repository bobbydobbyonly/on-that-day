import React, { useState, useEffect } from 'react';
import { ApodItem, UserSession, FavoriteDate, PublicHoliday } from './types';
import { OnboardingScreen } from './components/OnboardingScreen';
import { CosmicHeader } from './components/CosmicHeader';
import { ResultScreen } from './components/ResultScreen';
import { ImageViewerModal } from './components/ImageViewerModal';
import { KeepsakeCard } from './components/KeepsakeCard';
import { FavoritesModal } from './components/FavoritesModal';
import {
  fetchApodByDate,
  getSavedFavorites,
  saveFavoriteItem,
  removeFavoriteItem,
  isFavoriteDate,
} from './services/apodService';
import {
  toggleCosmicSound,
  isCosmicSoundActive,
  stopCosmicSound,
} from './utils/audioSynth';
import { getTodayDateString, APOD_MIN_DATE } from './utils/astronomyUtils';

const USER_SESSION_KEY = 'on_that_day_session_v1';

export default function App() {
  const [session, setSession] = useState<UserSession>(() => {
    try {
      const saved = localStorage.getItem(USER_SESSION_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return {
      name: '',
      date: '',
      isInitialSetup: true,
    };
  });

  const [apodItem, setApodItem] = useState<ApodItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [favorites, setFavorites] = useState<FavoriteDate[]>(() => getSavedFavorites());
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  const [showKeepsake, setShowKeepsake] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [activeHoliday, setActiveHoliday] = useState<PublicHoliday | null>(null);

  // Load APOD whenever session date changes (when not in initial setup)
  useEffect(() => {
    if (!session.isInitialSetup && session.date) {
      let isMounted = true;
      setIsLoading(true);

      fetchApodByDate(session.date)
        .then((data) => {
          if (isMounted) {
            setApodItem(data);
            setIsLoading(false);
          }
        })
        .catch((err) => {
          console.error('Error fetching APOD:', err);
          if (isMounted) {
            setIsLoading(false);
          }
        });

      return () => {
        isMounted = false;
      };
    }
  }, [session.date, session.isInitialSetup]);

  // Handle onboarding form submit
  const handleStartExploring = (name: string, date: string) => {
    const newSession: UserSession = {
      name: name || 'Stargazer',
      date,
      isInitialSetup: false,
    };
    setSession(newSession);
    try {
      localStorage.setItem(USER_SESSION_KEY, JSON.stringify(newSession));
    } catch {
      // ignore
    }
  };

  // Handle date change from header or navigation
  const handleDateChange = (newDate: string) => {
    const updated = { ...session, date: newDate };
    setSession(updated);
    try {
      localStorage.setItem(USER_SESSION_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  // Reset back to onboarding screen
  const handleResetUser = () => {
    setSession((prev) => ({
      ...prev,
      isInitialSetup: true,
    }));
  };

  // Audio synthesizer toggle
  const handleToggleAudio = () => {
    const active = toggleCosmicSound();
    setIsAudioPlaying(active);
  };

  // Favorite toggle
  const handleToggleFavorite = () => {
    if (!apodItem) return;
    const date = apodItem.date;
    if (isFavoriteDate(date)) {
      removeFavoriteItem(date);
    } else {
      saveFavoriteItem({
        date: apodItem.date,
        title: apodItem.title,
        url: apodItem.url,
        userName: session.name,
        savedAt: Date.now(),
      });
    }
    setFavorites(getSavedFavorites());
  };

  const handleRemoveFavorite = (date: string) => {
    removeFavoriteItem(date);
    setFavorites(getSavedFavorites());
  };

  // If in initial setup mode, display the pixel-perfect onboarding screen
  if (session.isInitialSetup || !apodItem) {
    return (
      <OnboardingScreen
        onStart={handleStartExploring}
        initialName={session.name}
        initialDate={session.date || '2000-01-01'}
      />
    );
  }

  const isCurrentFavorite = isFavoriteDate(apodItem.date);

  return (
    <div className="relative min-h-screen bg-[#131125] text-[#e4dffc] cosmic-gradient antialiased flex flex-col selection:bg-[#ffb300]/30 selection:text-[#ffd79b]">
      {/* Deep Space Nebula Background (hotlinked from HTML specification) */}
      <div
        className="fixed inset-0 z-0 opacity-20 mix-blend-screen pointer-events-none bg-cover bg-center"
        style={{
          backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBdNlOV7SIbgN5PzLw3KnJdQFUASscJ5f6RTMEEprdwKgiuZ6CrQ5A7A0iIChl8cy4gba2rmghVMofNdxPZEJnS2LCLhh66t06p-xZL2dXWn-DEtVqW6ch88MKCg_hRobjoOHF7HsUF2Cm4aaJ1_oaQiYLMjtjpOpL_nRJDOAuFGScybOfQxtiyL1Y8ukuyTC0kJwJRSXv2VdkXkAuSPzaLWF7RsZAuFb_a8WtcqDy0uDmMc6c88kqxCw')`,
        }}
      />

      {/* Decorative cosmic nebula glow spots */}
      <div className="fixed -top-20 -left-20 w-96 h-96 bg-[#00d5ed]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed -bottom-20 -right-20 w-96 h-96 bg-[#bd06da]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Navigation Header */}
      <CosmicHeader
        userName={session.name || 'Stargazer'}
        currentDate={session.date}
        onDateChange={handleDateChange}
        onResetUser={handleResetUser}
        onOpenKeepsake={() => setShowKeepsake(true)}
        onOpenFavorites={() => setShowFavorites(true)}
        favoritesCount={favorites.length}
        isAudioPlaying={isAudioPlaying}
        onToggleAudio={handleToggleAudio}
      />

      {/* Primary Result Content */}
      <main className="relative z-10 flex-1">
        <ResultScreen
          item={apodItem}
          userName={session.name || 'Stargazer'}
          isFavorite={isCurrentFavorite}
          onToggleFavorite={handleToggleFavorite}
          onOpenLightbox={() => setShowLightbox(true)}
          onOpenKeepsake={() => setShowKeepsake(true)}
          onSelectDate={handleDateChange}
          isLoading={isLoading}
          onHolidayLoaded={setActiveHoliday}
        />
      </main>

      {/* High-Resolution Lightbox Modal */}
      {showLightbox && (
        <ImageViewerModal
          imageUrl={apodItem.url}
          hdUrl={apodItem.hdurl}
          title={apodItem.title}
          date={apodItem.date}
          copyright={apodItem.copyright}
          onClose={() => setShowLightbox(false)}
        />
      )}

      {/* Heirloom Keepsake Modal */}
      {showKeepsake && (
        <KeepsakeCard
          item={apodItem}
          userName={session.name || 'Stargazer'}
          holiday={activeHoliday}
          onClose={() => setShowKeepsake(false)}
        />
      )}

      {/* Saved Favorites Vault Modal */}
      {showFavorites && (
        <FavoritesModal
          favorites={favorites}
          onSelectDate={handleDateChange}
          onRemoveFavorite={handleRemoveFavorite}
          onClose={() => setShowFavorites(false)}
        />
      )}
    </div>
  );
}
