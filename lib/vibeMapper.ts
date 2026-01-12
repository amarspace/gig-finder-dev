/**
 * Vibe Mapper - Genre & Style Categorization
 * Maps artists and events to music genres/vibes for smart matching
 */

export interface VibeCategory {
  name: string;
  keywords: string[];
  searchTerms: string[]; // Terms to search on ticketing sites
  ticketmasterGenreId: string; // Ticketmaster Discovery API genre ID
  weight: number; // Higher = more specific match
}

// Comprehensive vibe categories with Ticketmaster genre IDs
export const VIBE_CATEGORIES: Record<string, VibeCategory> = {
  // Electronic & Dance
  AFROHOUSE: {
    name: 'Afrohouse',
    keywords: ['afrohouse', 'afro house', 'afro-house', 'afrobeat', 'organic house', 'amapiano'],
    searchTerms: ['afrohouse', 'afro house', 'organic house'],
    ticketmasterGenreId: 'KnvZfZ7vAe1', // Electronic
    weight: 95,
  },
  TECHNO: {
    name: 'Techno',
    keywords: ['techno', 'minimal techno', 'detroit techno', 'hard techno', 'industrial techno'],
    searchTerms: ['techno', 'techno party', 'rave'],
    ticketmasterGenreId: 'KnvZfZ7vAe1', // Electronic
    weight: 92,
  },
  HOUSE: {
    name: 'House',
    keywords: ['house', 'deep house', 'tech house', 'progressive house', 'bass house'],
    searchTerms: ['house music', 'deep house', 'tech house'],
    ticketmasterGenreId: 'KnvZfZ7vAe1', // Electronic
    weight: 88,
  },
  ELECTRONIC: {
    name: 'Electronic',
    keywords: [
      'electronic', 'edm', 'electronica', 'electronic music', 'dance music',
      'dj', 'mix', 'remix', 'club', 'rave', 'festival', 'beat', 'synth',
      'melodic', 'progressive', 'dubstep', 'trap music', 'bass music'
    ],
    searchTerms: ['electronic', 'edm', 'dance'],
    ticketmasterGenreId: 'KnvZfZ7vAe1', // Electronic
    weight: 75,
  },
  DRUM_AND_BASS: {
    name: 'Drum & Bass',
    keywords: ['drum and bass', 'dnb', 'd&b', 'jungle', 'liquid'],
    searchTerms: ['drum and bass', 'dnb'],
    ticketmasterGenreId: 'KnvZfZ7vAe1', // Electronic
    weight: 90,
  },
  TRANCE: {
    name: 'Trance',
    keywords: ['trance', 'psytrance', 'progressive trance', 'uplifting trance'],
    searchTerms: ['trance', 'psytrance'],
    ticketmasterGenreId: 'KnvZfZ7vAe1', // Electronic
    weight: 90,
  },

  // Hip-Hop & Urban
  HIP_HOP: {
    name: 'Hip-Hop',
    keywords: [
      'hip hop', 'hip-hop', 'hiphop', 'rap', 'rapper', 'mc',
      'ft.', 'feat.', 'featuring', 'cypher', 'freestyle', 'bars',
      'drill', 'grime', 'boom bap', 'conscious rap'
    ],
    searchTerms: ['hip hop', 'rap'],
    ticketmasterGenreId: 'KnvZfZ7vAev', // Hip-Hop/Rap
    weight: 85,
  },
  TRAP: {
    name: 'Trap',
    keywords: ['trap', 'trap music', 'trap beats'],
    searchTerms: ['trap'],
    ticketmasterGenreId: 'KnvZfZ7vAev', // Hip-Hop/Rap
    weight: 85,
  },

  // Rock & Alternative
  ROCK: {
    name: 'Rock',
    keywords: ['rock', 'rock music', 'classic rock'],
    searchTerms: ['rock', 'rock concert'],
    ticketmasterGenreId: 'KnvZfZ7vAeA', // Rock
    weight: 80,
  },
  INDIE: {
    name: 'Indie',
    keywords: ['indie', 'indie rock', 'indie pop', 'alternative', 'alt rock'],
    searchTerms: ['indie', 'alternative'],
    ticketmasterGenreId: 'KnvZfZ7vAed', // Alternative
    weight: 85,
  },
  METAL: {
    name: 'Metal',
    keywords: ['metal', 'heavy metal', 'metalcore', 'death metal', 'black metal'],
    searchTerms: ['metal', 'heavy metal'],
    ticketmasterGenreId: 'KnvZfZ7vAvv', // Metal
    weight: 90,
  },

  // Pop & Mainstream
  POP: {
    name: 'Pop',
    keywords: [
      'pop', 'pop music', 'mainstream', 'top 40', 'chart',
      'viral', 'hit', 'single', 'album', 'official video',
      'music video', 'lyric video'
    ],
    searchTerms: ['pop', 'pop concert'],
    ticketmasterGenreId: 'KnvZfZ7vAev', // Pop
    weight: 70,
  },

  // R&B & Soul
  RNB: {
    name: 'R&B',
    keywords: ['r&b', 'rnb', 'rhythm and blues', 'soul', 'neo soul'],
    searchTerms: ['rnb', 'soul'],
    ticketmasterGenreId: 'KnvZfZ7vAee', // R&B
    weight: 85,
  },

  // Jazz & Blues
  JAZZ: {
    name: 'Jazz',
    keywords: ['jazz', 'jazz music', 'bebop', 'smooth jazz', 'fusion'],
    searchTerms: ['jazz', 'jazz club'],
    ticketmasterGenreId: 'KnvZfZ7vAvE', // Jazz
    weight: 90,
  },

  // Latin & World
  REGGAETON: {
    name: 'Reggaeton',
    keywords: ['reggaeton', 'reggaetón', 'latin trap', 'dembow'],
    searchTerms: ['reggaeton', 'latin'],
    ticketmasterGenreId: 'KnvZfZ7vAJ6', // Latin
    weight: 90,
  },
  LATIN: {
    name: 'Latin',
    keywords: ['latin', 'salsa', 'bachata', 'merengue', 'cumbia'],
    searchTerms: ['latin', 'salsa'],
    ticketmasterGenreId: 'KnvZfZ7vAJ6', // Latin
    weight: 85,
  },

  // Country & Folk
  COUNTRY: {
    name: 'Country',
    keywords: ['country', 'country music', 'folk', 'americana'],
    searchTerms: ['country', 'folk'],
    ticketmasterGenreId: 'KnvZfZ7vAv6', // Country
    weight: 85,
  },

  // Ukrainian Music
  UKRAINIAN_POP: {
    name: 'Ukrainian Pop',
    keywords: ['ukrainian', 'ukrainian pop', 'ukrainian music', 'україна', 'українська'],
    searchTerms: ['ukrainian', 'ukraine'],
    ticketmasterGenreId: 'KnvZfZ7vAev', // Pop (fallback)
    weight: 95,
  },
};

/**
 * Detect vibe categories from text (artist name, event title, description)
 */
export function detectVibes(text: string): string[] {
  const normalizedText = text.toLowerCase();
  const detectedVibes: string[] = [];

  for (const [key, category] of Object.entries(VIBE_CATEGORIES)) {
    for (const keyword of category.keywords) {
      if (normalizedText.includes(keyword.toLowerCase())) {
        detectedVibes.push(key);
        break; // Only add once per category
      }
    }
  }

  return detectedVibes;
}

/**
 * Analyze user's music taste and return weighted taste profile
 */
export interface TasteProfile {
  topVibes: string[];
  vibeWeights: Map<string, number>; // Vibe key -> percentage weight (0-100)
  vibeScores: Map<string, number>; // Vibe key -> raw frequency score
  genreIds: string[]; // Ticketmaster genre IDs for top vibes
  searchTerms: string[]; // Search terms for genre-based event finding
}

export function analyzeUserVibeProfile(
  artistNames: string[],
  videoTitles: string[] = []
): TasteProfile {
  const vibeFrequency = new Map<string, number>();

  // Analyze artist names (higher weight)
  artistNames.forEach((artist) => {
    const vibes = detectVibes(artist);
    vibes.forEach((vibe) => {
      vibeFrequency.set(vibe, (vibeFrequency.get(vibe) || 0) + 1);
    });
  });

  // Analyze video titles for additional context (medium weight)
  videoTitles.forEach((title) => {
    const vibes = detectVibes(title);
    vibes.forEach((vibe) => {
      vibeFrequency.set(vibe, (vibeFrequency.get(vibe) || 0) + 0.5); // Increased from 0.3
    });
  });

  // Infer genres from music descriptor words if no vibes detected yet
  if (vibeFrequency.size === 0) {
    console.log('[VibeMapper] No vibes detected from keywords, analyzing descriptors...');

    const allText = [...artistNames, ...videoTitles].join(' ').toLowerCase();

    // Electronic music indicators
    if (/\b(dj|mix|remix|beat|club|rave|festival|edm|dance)\b/i.test(allText)) {
      vibeFrequency.set('ELECTRONIC', 0.5);
    }

    // Hip-hop indicators
    if (/\b(ft\.|feat\.|featuring|cypher|freestyle|bars)\b/i.test(allText)) {
      vibeFrequency.set('HIP_HOP', 0.5);
    }

    // Rock indicators
    if (/\b(live|concert|tour|band|guitar|session)\b/i.test(allText)) {
      vibeFrequency.set('ROCK', 0.3);
    }
  }

  // Sort by frequency and weight
  const sortedVibes = Array.from(vibeFrequency.entries())
    .map(([vibe, frequency]) => ({
      vibe,
      frequency,
      weight: VIBE_CATEGORIES[vibe]?.weight || 0,
      score: frequency * (VIBE_CATEGORIES[vibe]?.weight || 0),
    }))
    .sort((a, b) => b.score - a.score);

  const topVibes = sortedVibes.slice(0, 5).map((v) => v.vibe);

  // Calculate percentage weights (normalize to 100%)
  const totalScore = sortedVibes.reduce((sum, v) => sum + v.score, 0);
  const vibeWeights = new Map<string, number>();

  if (totalScore > 0) {
    topVibes.forEach((vibe) => {
      const vibeData = sortedVibes.find((v) => v.vibe === vibe);
      if (vibeData) {
        const percentage = Math.round((vibeData.score / totalScore) * 100);
        vibeWeights.set(vibe, percentage);
      }
    });
  }

  // Collect genre IDs and search terms from top vibes
  const genreIds: string[] = [];
  const searchTerms: string[] = [];

  topVibes.forEach((vibe) => {
    const category = VIBE_CATEGORIES[vibe];
    if (category) {
      genreIds.push(category.ticketmasterGenreId);
      searchTerms.push(...category.searchTerms);
    }
  });

  return {
    topVibes,
    vibeWeights,
    vibeScores: vibeFrequency,
    genreIds: [...new Set(genreIds)], // Remove duplicates
    searchTerms: [...new Set(searchTerms)], // Remove duplicates
  };
}

/**
 * Calculate vibe match percentage for genre-based matching
 * Returns a score between 80-98% for genre matches
 */
export function calculateVibeMatch(
  eventVibes: string[],
  userTasteProfile: TasteProfile
): number {
  if (eventVibes.length === 0 || userTasteProfile.topVibes.length === 0) {
    return 0;
  }

  let totalScore = 0;
  let matchCount = 0;

  eventVibes.forEach((eventVibe) => {
    const userIndex = userTasteProfile.topVibes.indexOf(eventVibe);
    if (userIndex !== -1) {
      // Found a match - calculate score based on position and weight
      const userWeight = userTasteProfile.vibeWeights.get(eventVibe) || 0;
      const positionBonus = 98 - (userIndex * 3); // 98, 95, 92, 89, 86
      const weightBonus = Math.min(5, userWeight / 10); // Up to +5% for high weight

      totalScore += Math.min(98, positionBonus + weightBonus);
      matchCount++;
    }
  });

  if (matchCount === 0) {
    // No exact vibe match, but check for similar genres
    const userGenreIds = new Set(userTasteProfile.genreIds);
    eventVibes.forEach((eventVibe) => {
      const eventGenreId = VIBE_CATEGORIES[eventVibe]?.ticketmasterGenreId;
      if (eventGenreId && userGenreIds.has(eventGenreId)) {
        totalScore += 80; // Base score for same genre family
        matchCount++;
      }
    });
  }

  if (matchCount === 0) return 0;

  // Average score, ensure it's between 80-98 for any match
  const averageScore = Math.round(totalScore / matchCount);
  return Math.max(80, Math.min(98, averageScore));
}

/**
 * Calculate match score for exact artist matches
 * Returns 95-100% for exact artist name matches
 */
export function calculateExactArtistMatch(
  artistName: string,
  userArtists: string[],
  artistFrequencies: Map<string, number>
): number {
  const normalizedArtistName = artistName.toLowerCase().trim();

  // Check if this artist is in user's library
  const matchedArtist = userArtists.find(
    (ua) => ua.toLowerCase().trim() === normalizedArtistName
  );

  if (!matchedArtist) return 0;

  // Base score for exact match
  let score = 95;

  // Bonus based on how frequently user listens to this artist
  const frequency = artistFrequencies.get(matchedArtist) || 1;
  if (frequency >= 10) score = 100;
  else if (frequency >= 5) score = 98;
  else if (frequency >= 3) score = 96;

  return score;
}

/**
 * Get human-readable vibe name
 */
export function getVibeName(vibeKey: string): string {
  return VIBE_CATEGORIES[vibeKey]?.name || vibeKey;
}

/**
 * Get search terms for a specific vibe
 */
export function getVibeSearchTerms(vibeKey: string): string[] {
  return VIBE_CATEGORIES[vibeKey]?.searchTerms || [];
}

/**
 * Get Ticketmaster genre ID for a vibe
 */
export function getTicketmasterGenreId(vibeKey: string): string | undefined {
  return VIBE_CATEGORIES[vibeKey]?.ticketmasterGenreId;
}

/**
 * Format taste profile as human-readable percentages
 */
export function formatTasteProfile(tasteProfile: TasteProfile): string[] {
  return tasteProfile.topVibes.map((vibe) => {
    const name = getVibeName(vibe);
    const weight = tasteProfile.vibeWeights.get(vibe) || 0;
    return `${name} (${weight}%)`;
  });
}
