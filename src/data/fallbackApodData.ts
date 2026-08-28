import { ApodItem, MilestoneItem } from '../types';

export const MILESTONES: MilestoneItem[] = [
  {
    id: 'first-apod',
    date: '1995-06-16',
    title: 'The Very First APOD',
    subtitle: 'Where it all began on June 16, 1995',
    badge: 'Origin',
    thumbnailUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=600&q=80',
    category: 'landmark',
  },
  {
    id: 'jwst-carina',
    date: '2022-07-12',
    title: 'Cosmic Cliffs of Carina',
    subtitle: 'Webb’s first breathtaking deep infrared view',
    badge: 'JWST Era',
    thumbnailUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
    category: 'telescope',
  },
  {
    id: 'pillars-creation',
    date: '1995-10-25',
    title: 'Pillars of Creation',
    subtitle: 'Eagle Nebula star-forming gas spires in Serpens',
    badge: 'Hubble Icon',
    thumbnailUrl: 'https://images.unsplash.com/photo-1543722530-d2c3201371e7?auto=format&fit=crop&w=600&q=80',
    category: 'telescope',
  },
  {
    id: 'solar-eclipse-2024',
    date: '2024-04-08',
    title: 'The Great North American Eclipse',
    subtitle: 'Solar Corona & Prominences in totality',
    badge: 'Solar Event',
    thumbnailUrl: 'https://images.unsplash.com/photo-1532693322450-2cb5c511067d?auto=format&fit=crop&w=600&q=80',
    category: 'eclipse',
  },
  {
    id: 'pluto-new-horizons',
    date: '2015-07-14',
    title: 'Pluto’s Frozen Heart',
    subtitle: 'New Horizons historical flyby of Tombaugh Regio',
    badge: 'Planetary Flyby',
    thumbnailUrl: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=600&q=80',
    category: 'planet',
  },
  {
    id: 'hubble-30',
    date: '2020-04-24',
    title: 'Cosmic Reef: 30 Years of Hubble',
    subtitle: 'Giant red nebula NGC 2014 & blue NGC 2020',
    badge: 'Anniversary',
    thumbnailUrl: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=600&q=80',
    category: 'telescope',
  },
  {
    id: 'millennium-sky',
    date: '2000-01-01',
    title: 'Dawn of the New Millennium',
    subtitle: 'The cosmic horizon entering the 21st century',
    badge: 'Millennium',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    category: 'landmark',
  }
];

export const FALLBACK_APOD_CATALOG: Record<string, ApodItem> = {
  '1995-06-16': {
    date: '1995-06-16',
    title: 'Neutron Star with Superstrong Magnetic Field',
    explanation:
      'Explanation: What would happen if a normal star collapsed to the size of a city? A neutron star is born! In 1995, Robert Nemiroff and Jerry Bonnell inaugurated the Astronomy Picture of the Day (APOD) archive to chronicle humanity’s daily gaze into deep space. This first historic entry commemorates the extreme density, intense magnetic fields, and rhythmic pulsars of stellar remnants that populate our Milky Way.',
    url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1400&q=85',
    hdurl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=2400&q=95',
    media_type: 'image',
    copyright: 'NASA / GSFC & MTU Astronomy Archive',
  },
  '2022-07-12': {
    date: '2022-07-12',
    title: 'Cosmic Cliffs in the Carina Nebula',
    explanation:
      'Explanation: What looks like craggy mountains on a moonlit evening is actually the edge of a nearby, young, star-forming region NGC 3324 in the Carina Nebula. Captured in infrared light by NASA’s James Webb Space Telescope, this reveals previously obscured areas of stellar birth. The blistering ultraviolet radiation and stellar winds from massive, hot, young stars shape the towering cavernous wall of ionized gas and dust.',
    url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1400&q=85',
    hdurl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=2400&q=95',
    media_type: 'image',
    copyright: 'NASA, ESA, CSA, STScI, Webb ERO Production Team',
  },
  '1995-10-25': {
    date: '1995-10-25',
    title: 'Eagle Nebula: Pillars of Creation',
    explanation:
      'Explanation: Undersea world or cosmic nursery? These ethereal gas spires in the Eagle Nebula (M16) span several light years across. The cold molecular hydrogen and dust act as incubator cocoons for embryonic protostars. Ultraviolet radiation from newly formed stars slowly boils away the outer layers, sculpting stellar fingers pointing toward the stellar wind.',
    url: 'https://images.unsplash.com/photo-1543722530-d2c3201371e7?auto=format&fit=crop&w=1400&q=85',
    hdurl: 'https://images.unsplash.com/photo-1543722530-d2c3201371e7?auto=format&fit=crop&w=2400&q=95',
    media_type: 'image',
    copyright: 'Jeff Hester & Paul Scowen (Arizona State University), NASA / STScI',
  },
  '2024-04-08': {
    date: '2024-04-08',
    title: 'Totality: The Great North American Solar Eclipse',
    explanation:
      'Explanation: For a few spellbinding minutes along the path of totality, day turned into deep twilight. As the Moon fully occluded the blinding solar photosphere, the sun’s pearly white outer atmosphere—the solar corona—burst into view alongside fiery ruby-red magnetic prominences leaping into the vacuum of space.',
    url: 'https://images.unsplash.com/photo-1532693322450-2cb5c511067d?auto=format&fit=crop&w=1400&q=85',
    hdurl: 'https://images.unsplash.com/photo-1532693322450-2cb5c511067d?auto=format&fit=crop&w=2400&q=95',
    media_type: 'image',
    copyright: 'NASA Solar Observation Network',
  },
  '2015-07-14': {
    date: '2015-07-14',
    title: 'Pluto’s Beating Heart: Tombaugh Regio',
    explanation:
      'Explanation: After a nine-year, three-billion-mile voyage across the solar system, NASA’s New Horizons spacecraft captured the first close-up portrait of the mysterious dwarf planet Pluto. Dominating the landscape is a vast, smooth plain of nitrogen and carbon monoxide ice unofficially named Sputnik Planitia, bordering towering water-ice mountain ranges.',
    url: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=1400&q=85',
    hdurl: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=2400&q=95',
    media_type: 'image',
    copyright: 'NASA / Johns Hopkins University APL / Southwest Research Institute',
  },
  '2020-04-24': {
    date: '2020-04-24',
    title: 'The Cosmic Reef: Celebrating 30 Years of Hubble',
    explanation:
      'Explanation: Nicknamed the Cosmic Reef, this portrait features the giant red nebula NGC 2014 and its smaller blue neighbor NGC 2020 in the Large Magellanic Cloud, a satellite galaxy of our Milky Way. Radiation from bright young stars thirty times more massive than our Sun drives this undersea-like tapestry of interstellar gas.',
    url: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1400&q=85',
    hdurl: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=2400&q=95',
    media_type: 'image',
    copyright: 'NASA, ESA, and STScI',
  },
  '2000-01-01': {
    date: '2000-01-01',
    title: 'Millennium Starlight & The Celestial Vault',
    explanation:
      'Explanation: As Earth clocks rolled over into the 21st century, humanity looked upward to celebrate the passage of terrestrial time measured against the backdrop of eternal cosmic stellar clocks. The stars overhead shine with ancient photons that began their voyage long before our modern calendar existed.',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1400&q=85',
    hdurl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=2400&q=95',
    media_type: 'image',
    copyright: 'NASA / APOD Archive',
  }
};
