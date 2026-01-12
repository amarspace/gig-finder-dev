/**
 * Ticketmaster Service - Global Event Discovery
 * Uses Ticketmaster Discovery API v2 for worldwide event search
 * API Docs: https://developer.ticketmaster.com/products-and-docs/apis/discovery-api/v2/
 */

import { Event } from '@/types/event';

const API_BASE = 'https://app.ticketmaster.com/discovery/v2';
const API_KEY = process.env.TICKETMASTER_API_KEY;

export interface TicketmasterSearchOptions {
  latitude?: number;
  longitude?: number;
  radius?: number; // in kilometers
  genreIds?: string[]; // Ticketmaster genre IDs
  keyword?: string; // Search keyword (artist name, event name)
  size?: number; // Number of results (default: 15)
  sort?: string; // Sort order (default: 'distance,asc')
}

interface TicketmasterEvent {
  id: string;
  name: string;
  dates: {
    start: {
      localDate: string;
      localTime?: string;
    };
  };
  _embedded?: {
    venues: Array<{
      name: string;
      city: {
        name: string;
      };
      country: {
        name: string;
        countryCode: string;
      };
      location?: {
        latitude: string;
        longitude: string;
      };
    }>;
    attractions?: Array<{
      name: string;
      classifications?: Array<{
        genre?: { name: string };
        subGenre?: { name: string };
      }>;
    }>;
  };
  classifications?: Array<{
    genre?: { id: string; name: string };
    subGenre?: { id: string; name: string };
  }>;
  url: string;
  images?: Array<{
    url: string;
    width: number;
    height: number;
  }>;
  distance?: number;
}

interface TicketmasterResponse {
  _embedded?: {
    events: TicketmasterEvent[];
  };
  page: {
    size: number;
    totalElements: number;
    totalPages: number;
    number: number;
  };
}

/**
 * Ticketmaster Genre ID Mapping
 * Maps internal vibe categories to Ticketmaster genre/subgenre IDs
 * Reference: https://developer.ticketmaster.com/products-and-docs/apis/discovery-api/v2/#genre-ids
 */
export const TICKETMASTER_GENRE_MAP: Record<string, string[]> = {
  // Electronic & Dance
  AFROHOUSE: ['KnvZfZ7vAe1'], // Electronic/Dance
  TECHNO: ['KnvZfZ7vAe1'], // Electronic/Dance
  HOUSE: ['KnvZfZ7vAe1'], // Electronic/Dance
  ELECTRONIC: ['KnvZfZ7vAe1'], // Electronic/Dance
  DRUM_AND_BASS: ['KnvZfZ7vAe1'], // Electronic/Dance

  // Hip-Hop & Urban
  HIP_HOP: ['KnvZfZ7vAev'], // Hip-Hop/Rap
  TRAP: ['KnvZfZ7vAev'], // Hip-Hop/Rap

  // Rock & Alternative
  ROCK: ['KnvZfZ7vAeA'], // Rock
  INDIE: ['KnvZfZ7vAed'], // Alternative
  METAL: ['KnvZfZ7vAvv'], // Metal

  // Pop & Mainstream
  POP: ['KnvZfZ7vAev'], // Pop

  // R&B & Soul
  RNB: ['KnvZfZ7vAee'], // R&B

  // Jazz & Blues
  JAZZ: ['KnvZfZ7vAvE'], // Jazz

  // Latin & World
  REGGAETON: ['KnvZfZ7vAJ6'], // Latin

  // Ukrainian Music
  UKRAINIAN_POP: ['KnvZfZ7vAev'], // Pop (fallback)
};

export class TicketmasterService {
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || API_KEY || '';
    if (!this.apiKey) {
      throw new Error('Ticketmaster API key is required');
    }
  }

  /**
   * Search for events near a location
   * Returns up to 15 events sorted by distance
   */
  async searchNearestEvents(
    options: TicketmasterSearchOptions
  ): Promise<Event[]> {
    try {
      const {
        latitude,
        longitude,
        radius = 1000, // Default 1000km radius for global search
        genreIds,
        keyword,
        size = 15,
        sort = 'distance,asc',
      } = options;

      // Build query parameters
      const params = new URLSearchParams({
        apikey: this.apiKey,
        size: size.toString(),
        sort,
      });

      // Add geolocation if provided
      if (latitude !== undefined && longitude !== undefined) {
        params.append('geoPoint', `${latitude},${longitude}`);
        params.append('radius', radius.toString());
        params.append('unit', 'km');
      }

      // Add genre filtering if provided
      if (genreIds && genreIds.length > 0) {
        params.append('genreId', genreIds.join(','));
      }

      // Add keyword search if provided
      if (keyword) {
        params.append('keyword', keyword);
      }

      // Classification filters for music events only
      params.append('classificationName', 'music');

      const url = `${API_BASE}/events.json?${params.toString()}`;
      console.log(`[Ticketmaster] Fetching events: ${url.replace(this.apiKey, 'API_KEY')}`);

      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        console.error(`[Ticketmaster] HTTP ${response.status}: ${response.statusText}`);
        return [];
      }

      const data: TicketmasterResponse = await response.json();

      if (!data._embedded || !data._embedded.events) {
        console.log('[Ticketmaster] No events found');
        return [];
      }

      const events = data._embedded.events.map((tmEvent) =>
        this.mapToEvent(tmEvent)
      );

      console.log(`[Ticketmaster] Found ${events.length} events`);
      return events;
    } catch (error) {
      console.error('[Ticketmaster] Error fetching events:', error);
      return [];
    }
  }

  /**
   * Search for a specific artist globally
   */
  async searchArtist(
    artistName: string,
    options: Omit<TicketmasterSearchOptions, 'keyword'> = {}
  ): Promise<Event[]> {
    return this.searchNearestEvents({
      ...options,
      keyword: artistName,
    });
  }

  /**
   * Get upcoming events by genre
   */
  async searchByGenres(
    vibeCategories: string[],
    options: Omit<TicketmasterSearchOptions, 'genreIds'> = {}
  ): Promise<Event[]> {
    // Convert vibe categories to Ticketmaster genre IDs
    const genreIds: string[] = [];
    vibeCategories.forEach((vibe) => {
      const tmGenres = TICKETMASTER_GENRE_MAP[vibe];
      if (tmGenres) {
        genreIds.push(...tmGenres);
      }
    });

    // Remove duplicates
    const uniqueGenreIds = [...new Set(genreIds)];

    return this.searchNearestEvents({
      ...options,
      genreIds: uniqueGenreIds,
    });
  }

  /**
   * Map Ticketmaster event to internal Event type
   */
  private mapToEvent(tmEvent: TicketmasterEvent): Event {
    const venue = tmEvent._embedded?.venues?.[0];
    const attraction = tmEvent._embedded?.attractions?.[0];

    // Extract artist name (prefer attraction name, fallback to event name)
    const artistName = attraction?.name || tmEvent.name.split(' - ')[0] || tmEvent.name;

    // Extract genres
    const genres: string[] = [];
    if (tmEvent.classifications) {
      tmEvent.classifications.forEach((c) => {
        if (c.genre?.name) genres.push(c.genre.name);
        if (c.subGenre?.name) genres.push(c.subGenre.name);
      });
    }
    if (attraction?.classifications) {
      attraction.classifications.forEach((c) => {
        if (c.genre?.name) genres.push(c.genre.name);
        if (c.subGenre?.name) genres.push(c.subGenre.name);
      });
    }

    // Get best image (highest resolution)
    let imageUrl: string | undefined;
    if (tmEvent.images && tmEvent.images.length > 0) {
      const sortedImages = [...tmEvent.images].sort((a, b) => b.width - a.width);
      imageUrl = sortedImages[0].url;
    }

    // Build location string
    const city = venue?.city?.name || 'TBA';
    const country = venue?.country?.name || '';
    const location = country ? `${city}, ${country}` : city;

    return {
      id: `ticketmaster-${tmEvent.id}`,
      artistName,
      venue: venue?.name || 'Venue TBA',
      date: tmEvent.dates.start.localDate,
      time: tmEvent.dates.start.localTime,
      location,
      city,
      country,
      ticketUrl: tmEvent.url,
      source: 'ticketmaster',
      imageUrl,
      genres: genres.length > 0 ? [...new Set(genres)] : undefined,
      distance: tmEvent.distance, // Distance in km from search point
    };
  }

  /**
   * Calculate distance between two geographic points using Haversine formula
   * Returns distance in kilometers
   */
  static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private static toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}
