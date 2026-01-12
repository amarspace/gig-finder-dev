/**
 * Genre Detection and Matching
 * Detects music genres from video titles and descriptions
 */

export interface GenreMatch {
  genre: string;
  confidence: number;
  frequency: number;
}

// Genre keywords mapping
const GENRE_KEYWORDS: Record<string, string[]> = {
  // Electronic Music
  'Electronic': ['electronic', 'edm', 'electronica'],
  'House': ['house', 'deep house', 'tech house', 'progressive house'],
  'Techno': ['techno', 'minimal techno', 'detroit techno'],
  'Afrohouse': ['afrohouse', 'afro house', 'afro-house', 'afrobeat house'],
  'Afrobeat': ['afrobeat', 'afro beat', 'afro-beat'],
  'Drum & Bass': ['drum and bass', 'dnb', 'd&b', 'drum & bass'],
  'Dubstep': ['dubstep', 'dub step'],
  'Trance': ['trance', 'progressive trance', 'uplifting trance'],

  // Hip-Hop & Rap
  'Hip-Hop': ['hip hop', 'hip-hop', 'hiphop'],
  'Rap': ['rap', 'rapper', 'mc'],
  'Trap': ['trap', 'trap music'],

  // Rock & Alternative
  'Rock': ['rock', 'rock music'],
  'Alternative': ['alternative', 'alt rock', 'indie rock'],
  'Indie': ['indie', 'indie music'],
  'Metal': ['metal', 'heavy metal', 'metalcore'],
  'Punk': ['punk', 'punk rock'],

  // Pop & R&B
  'Pop': ['pop', 'pop music'],
  'R&B': ['r&b', 'rnb', 'rhythm and blues'],
  'Soul': ['soul', 'soul music'],

  // Jazz & Blues
  'Jazz': ['jazz', 'jazz music'],
  'Blues': ['blues', 'blues music'],

  // Latin & World
  'Reggaeton': ['reggaeton', 'reggaetón'],
  'Latin': ['latin', 'latino', 'latina'],
  'Reggae': ['reggae', 'ska'],

  // Ukrainian & Local
  'Ukrainian Pop': ['ukrainian pop', 'ukrainian music', 'україна', 'ukrainian'],

  // Classical & Acoustic
  'Classical': ['classical', 'orchestra', 'symphony'],
  'Acoustic': ['acoustic', 'unplugged'],
};

// Genre to event category mapping (for Concert.ua/Kontramarka search)
export const GENRE_TO_CATEGORY: Record<string, string[]> = {
  'Electronic': ['electronic', 'dance', 'club'],
  'House': ['house', 'electronic', 'dance'],
  'Techno': ['techno', 'electronic', 'rave'],
  'Afrohouse': ['afrohouse', 'house', 'electronic'],
  'Afrobeat': ['afrobeat', 'world music', 'african'],
  'Hip-Hop': ['hip-hop', 'rap', 'urban'],
  'Rap': ['rap', 'hip-hop', 'urban'],
  'Rock': ['rock', 'alternative'],
  'Pop': ['pop', 'mainstream'],
  'Jazz': ['jazz', 'live music'],
  'Ukrainian Pop': ['pop', 'ukrainian'],
};

/**
 * Detect genres from a video title
 */
export function detectGenreFromTitle(title: string): string[] {
  const normalizedTitle = title.toLowerCase();
  const detectedGenres: string[] = [];

  for (const [genre, keywords] of Object.entries(GENRE_KEYWORDS)) {
    for (const keyword of keywords) {
      if (normalizedTitle.includes(keyword)) {
        detectedGenres.push(genre);
        break; // Only add genre once
      }
    }
  }

  return detectedGenres;
}

/**
 * Analyze genres from a collection of video titles
 */
export function analyzeGenres(videoTitles: string[]): GenreMatch[] {
  const genreFrequency = new Map<string, number>();

  // Count genre occurrences
  videoTitles.forEach((title) => {
    const genres = detectGenreFromTitle(title);
    genres.forEach((genre) => {
      genreFrequency.set(genre, (genreFrequency.get(genre) || 0) + 1);
    });
  });

  // Calculate confidence based on frequency
  const totalTitles = videoTitles.length;
  const genreMatches: GenreMatch[] = Array.from(genreFrequency.entries()).map(
    ([genre, frequency]) => ({
      genre,
      frequency,
      confidence: Math.min(100, Math.round((frequency / totalTitles) * 100)),
    })
  );

  // Sort by frequency (most common first)
  return genreMatches.sort((a, b) => b.frequency - a.frequency);
}

/**
 * Get top N genres from analysis
 */
export function getTopGenres(genreMatches: GenreMatch[], limit: number = 5): string[] {
  return genreMatches.slice(0, limit).map((match) => match.genre);
}

/**
 * Check if a genre is electronic/dance music
 */
export function isElectronicGenre(genre: string): boolean {
  const electronicGenres = ['Electronic', 'House', 'Techno', 'Afrohouse', 'Drum & Bass', 'Dubstep', 'Trance', 'Trap'];
  return electronicGenres.includes(genre);
}

/**
 * Get search keywords for a genre (for event scraping)
 */
export function getGenreSearchKeywords(genre: string): string[] {
  return GENRE_TO_CATEGORY[genre] || [genre.toLowerCase()];
}

/**
 * Calculate genre match percentage for an event
 * Based on how well the event's genre matches user's top genres
 */
export function calculateGenreMatchPercentage(
  eventGenre: string,
  userTopGenres: string[],
  genreMatches: GenreMatch[]
): number {
  // Check if event genre is in user's top genres
  const genreIndex = userTopGenres.indexOf(eventGenre);

  if (genreIndex === -1) {
    return 0; // No match
  }

  // Higher percentage for top genres
  const basePercentage = 60; // Minimum for genre match
  const bonusPercentage = 30; // Up to 30% bonus for top genres

  // Calculate bonus based on genre position (0 = top genre)
  const positionBonus = bonusPercentage * (1 - genreIndex / userTopGenres.length);

  // Add frequency bonus
  const genreMatch = genreMatches.find((m) => m.genre === eventGenre);
  const frequencyBonus = genreMatch ? Math.min(10, genreMatch.confidence / 10) : 0;

  return Math.round(basePercentage + positionBonus + frequencyBonus);
}
