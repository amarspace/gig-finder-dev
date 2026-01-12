import { scrapeConcertUa } from './scrapers/concert-ua';
import { scrapeKontramarka } from './scrapers/kontramarka';
import { scrapeKarabas } from './scrapers/karabas';
import { Event } from '@/types/event';

/**
 * Generate search URL for Concert.ua
 */
export function getConcertUaSearchUrl(artistName: string): string {
  return `https://concert.ua/uk/search?q=${encodeURIComponent(artistName)}`;
}

/**
 * Generate search URL for Kontramarka
 */
export function getKontramarkaSearchUrl(artistName: string): string {
  return `https://kontramarka.ua/uk/search/${encodeURIComponent(artistName)}`;
}

/**
 * Generate search URL for Karabas
 */
export function getKarabasSearchUrl(artistName: string): string {
  return `https://karabas.com/search?query=${encodeURIComponent(artistName)}`;
}

/**
 * Ticket Aggregator Service
 * Coordinates all event scrapers and APIs to find events for given artists
 */
export class TicketAggregator {
  /**
   * Find events for a list of artists
   */
  async findEvents(
    artistNames: string[],
    userCity: string = 'Kyiv',
    limit: number = 20
  ): Promise<{
    events: Event[];
    sources: {
      'concert-ua': number;
      'kontramarka': number;
      'karabas': number;
      'bandsintown': number;
    };
    artistsWithEvents: string[];
    artistsWithoutEvents: string[];
  }> {
    // Limit artists to avoid timeout
    const topArtists = artistNames.slice(0, limit);

    console.log(`[TicketAggregator] Searching for ${topArtists.length} artists in ${userCity}`);

    // Run all scrapers in parallel
    const [concertUaEvents, kontramarkaEvents, karabasEvents] = await Promise.all([
      scrapeConcertUa(topArtists, userCity).catch((err) => {
        console.error('[TicketAggregator] Concert.ua error:', err.message);
        return [];
      }),
      scrapeKontramarka(topArtists, userCity).catch((err) => {
        console.error('[TicketAggregator] Kontramarka error:', err.message);
        return [];
      }),
      scrapeKarabas(topArtists, userCity).catch((err) => {
        console.error('[TicketAggregator] Karabas error:', err.message);
        return [];
      }),
    ]);

    // Combine all events
    const allEvents = [
      ...concertUaEvents,
      ...kontramarkaEvents,
      ...karabasEvents,
    ];

    // Deduplicate events
    const uniqueEvents = this.deduplicateEvents(allEvents);

    // Filter out past events
    const upcomingEvents = this.filterUpcomingEvents(uniqueEvents);

    // Sort by date
    const sortedEvents = this.sortByDate(upcomingEvents);

    // Track which artists have events
    const artistsWithEvents = [...new Set(sortedEvents.map((e) => e.artistName))];
    const artistsWithoutEvents = topArtists.filter(
      (artist) => !artistsWithEvents.includes(artist)
    );

    console.log(`[TicketAggregator] Found ${sortedEvents.length} events for ${artistsWithEvents.length}/${topArtists.length} artists`);

    return {
      events: sortedEvents,
      sources: {
        'concert-ua': concertUaEvents.length,
        'kontramarka': kontramarkaEvents.length,
        'karabas': karabasEvents.length,
        'bandsintown': 0, // TODO: Implement Bandsintown
      },
      artistsWithEvents,
      artistsWithoutEvents,
    };
  }

  /**
   * Deduplicate events based on artist + venue + date
   */
  private deduplicateEvents(events: Event[]): Event[] {
    const seen = new Map<string, Event>();

    for (const event of events) {
      const key = `${event.artistName.toLowerCase()}-${event.venue.toLowerCase()}-${event.date}`;

      if (!seen.has(key)) {
        seen.set(key, event);
      } else {
        // If we already have this event, prefer the one with a ticket URL
        const existing = seen.get(key)!;
        if (event.ticketUrl && !existing.ticketUrl) {
          seen.set(key, event);
        }
      }
    }

    return Array.from(seen.values());
  }

  /**
   * Filter out events that have already passed
   */
  private filterUpcomingEvents(events: Event[]): Event[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return events.filter((event) => {
      try {
        const eventDate = new Date(event.date);
        return eventDate >= today;
      } catch (err) {
        console.error(`[TicketAggregator] Invalid date for event ${event.id}:`, event.date);
        return true; // Keep events with unparseable dates
      }
    });
  }

  /**
   * Sort events by date (earliest first)
   */
  private sortByDate(events: Event[]): Event[] {
    return events.sort((a, b) => {
      try {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return dateA - dateB;
      } catch (err) {
        return 0;
      }
    });
  }

  /**
   * Generate fallback search URLs for artists without events
   */
  generateSearchLinks(artistName: string): {
    concertUa: string;
    kontramarka: string;
    karabas: string;
  } {
    return {
      concertUa: getConcertUaSearchUrl(artistName),
      kontramarka: getKontramarkaSearchUrl(artistName),
      karabas: getKarabasSearchUrl(artistName),
    };
  }
}

/**
 * Calculate match percentage based on user's artist frequency
 * Returns exact match percentage (artist in user's library)
 */
export function calculateMatchPercentage(
  artistName: string,
  artistFrequencies: Map<string, number>
): number {
  const frequency = artistFrequencies.get(artistName) || 0;

  if (frequency === 0) {
    return 0; // Artist not in library
  }

  const maxFrequency = Math.max(...Array.from(artistFrequencies.values()));

  // Calculate percentage (70-99% range based on frequency)
  const percentage = 70 + Math.floor((frequency / maxFrequency) * 29);

  return Math.min(99, Math.max(70, percentage));
}

/**
 * Calculate match percentage with genre weighting
 * Combines exact artist match with genre/style matching
 */
export function calculateSmartMatchPercentage(
  artistName: string,
  artistFrequencies: Map<string, number>,
  eventGenres: string[],
  userTopGenres: string[]
): number {
  // First, check for exact artist match
  const exactMatch = calculateMatchPercentage(artistName, artistFrequencies);

  if (exactMatch > 0) {
    return exactMatch; // Artist is in user's library - return exact match
  }

  // No exact match - check for genre/style match
  let genreMatchScore = 0;

  for (const eventGenre of eventGenres) {
    const genreIndex = userTopGenres.indexOf(eventGenre);

    if (genreIndex !== -1) {
      // Genre match found - calculate score based on position
      // Top genre = higher score
      const positionScore = 60 - (genreIndex * 10); // 60%, 50%, 40%, etc.
      genreMatchScore = Math.max(genreMatchScore, positionScore);
    }
  }

  return Math.min(85, Math.max(0, genreMatchScore)); // Style matches cap at 85%
}

/**
 * Get top N events sorted by match percentage
 */
export function getTopMatches(
  events: Event[],
  artistFrequencies: Map<string, number>,
  limit: number = 10
): (Event & { matchPercentage: number })[] {
  const eventsWithMatch = events.map((event) => ({
    ...event,
    matchPercentage: calculateMatchPercentage(event.artistName, artistFrequencies),
  }));

  // Sort by match percentage (highest first), then by date
  return eventsWithMatch
    .sort((a, b) => {
      if (a.matchPercentage !== b.matchPercentage) {
        return b.matchPercentage - a.matchPercentage;
      }
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    })
    .slice(0, limit);
}

/**
 * Get top matches with smart genre-based matching
 * Includes both exact artist matches and genre/style matches
 */
export function getSmartMatches(
  events: Event[],
  artistFrequencies: Map<string, number>,
  userTopGenres: string[],
  limit: number = 10
): (Event & { matchPercentage: number; isStyleMatch: boolean })[] {
  const eventsWithMatch = events.map((event) => {
    // First check for exact artist match
    const exactMatch = calculateMatchPercentage(event.artistName, artistFrequencies);

    if (exactMatch > 0) {
      return {
        ...event,
        matchPercentage: exactMatch,
        isStyleMatch: false,
      };
    }

    // No exact match - check for genre match
    const eventGenres = event.genres || [];
    const genreMatch = calculateSmartMatchPercentage(
      event.artistName,
      artistFrequencies,
      eventGenres,
      userTopGenres
    );

    return {
      ...event,
      matchPercentage: genreMatch,
      isStyleMatch: genreMatch > 0,
    };
  });

  // Filter out events with 0% match and sort
  return eventsWithMatch
    .filter((event) => event.matchPercentage > 0)
    .sort((a, b) => {
      // Prioritize exact matches over style matches
      if (a.isStyleMatch !== b.isStyleMatch) {
        return a.isStyleMatch ? 1 : -1;
      }
      // Then sort by match percentage
      if (a.matchPercentage !== b.matchPercentage) {
        return b.matchPercentage - a.matchPercentage;
      }
      // Finally sort by date
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    })
    .slice(0, limit);
}
