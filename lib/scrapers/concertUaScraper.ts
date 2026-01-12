/**
 * Concert.ua Scraper - Production Implementation
 * Scrapes real event data from Concert.ua for Ukraine
 */

import * as cheerio from 'cheerio';
import { Event } from '@/types/event';

const BASE_URL = 'https://concert.ua';

export interface ScraperOptions {
  city?: string;
  limit?: number;
}

/**
 * Search Concert.ua for an artist
 */
export async function searchArtist(
  artistName: string,
  options: ScraperOptions = {}
): Promise<Event[]> {
  try {
    const searchUrl = `${BASE_URL}/uk/search?q=${encodeURIComponent(artistName)}`;
    console.log(`[Concert.ua] Searching for: ${artistName}`);

    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error(`[Concert.ua] HTTP ${response.status} for ${artistName}`);
      return [];
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const events: Event[] = [];

    // Parse event cards from search results
    $('.event-card, .concert-item, .event-item, article').each((_, element) => {
      try {
        const $el = $(element);

        // Extract event details
        const title = $el.find('h2, h3, .title, .event-title').first().text().trim();
        const venue = $el.find('.venue, .location, .place').first().text().trim();
        const dateText = $el.find('.date, .event-date, time').first().text().trim();
        const link = $el.find('a').first().attr('href');

        if (!title || !link) return;

        // Parse date
        const eventDate = parseDateFromText(dateText);

        // Extract city
        let city = options.city || 'Kyiv';
        const locationText = venue.toLowerCase();
        if (locationText.includes('київ') || locationText.includes('kyiv')) {
          city = 'Kyiv';
        } else if (locationText.includes('львів') || locationText.includes('lviv')) {
          city = 'Lviv';
        } else if (locationText.includes('одеса') || locationText.includes('odesa')) {
          city = 'Odesa';
        }

        events.push({
          id: `concert-ua-${link.replace(/\D/g, '') || Date.now()}`,
          artistName,
          venue: venue || 'Venue TBA',
          date: eventDate,
          location: city,
          city,
          ticketUrl: link.startsWith('http') ? link : `${BASE_URL}${link}`,
          source: 'concert-ua',
        });
      } catch (err) {
        console.error('[Concert.ua] Error parsing event:', err);
      }
    });

    console.log(`[Concert.ua] Found ${events.length} events for ${artistName}`);
    return events.slice(0, options.limit || 10);
  } catch (error) {
    console.error(`[Concert.ua] Error scraping ${artistName}:`, error);
    return [];
  }
}

/**
 * Search for genre-based events (e.g., "techno party", "afrohouse")
 */
export async function searchGenre(
  genreKeyword: string,
  options: ScraperOptions = {}
): Promise<Event[]> {
  try {
    const searchUrl = `${BASE_URL}/uk/search?q=${encodeURIComponent(genreKeyword)}`;
    console.log(`[Concert.ua] Searching genre: ${genreKeyword}`);

    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error(`[Concert.ua] HTTP ${response.status} for genre ${genreKeyword}`);
      return [];
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const events: Event[] = [];

    $('.event-card, .concert-item, .event-item, article').each((_, element) => {
      try {
        const $el = $(element);

        const title = $el.find('h2, h3, .title, .event-title').first().text().trim();
        const venue = $el.find('.venue, .location, .place').first().text().trim();
        const dateText = $el.find('.date, .event-date, time').first().text().trim();
        const link = $el.find('a').first().attr('href');

        if (!title || !link) return;

        const eventDate = parseDateFromText(dateText);

        // Extract artist name from title (usually format: "Artist - Event" or "Event Name")
        let artistName = title.split('-')[0].trim();
        if (artistName.length > 50) {
          artistName = title.substring(0, 47) + '...';
        }

        let city = options.city || 'Kyiv';
        const locationText = venue.toLowerCase();
        if (locationText.includes('київ') || locationText.includes('kyiv')) {
          city = 'Kyiv';
        } else if (locationText.includes('львів') || locationText.includes('lviv')) {
          city = 'Lviv';
        } else if (locationText.includes('одеса') || locationText.includes('odesa')) {
          city = 'Odesa';
        }

        events.push({
          id: `concert-ua-genre-${link.replace(/\D/g, '') || Date.now()}`,
          artistName,
          venue: venue || 'Venue TBA',
          date: eventDate,
          location: city,
          city,
          ticketUrl: link.startsWith('http') ? link : `${BASE_URL}${link}`,
          source: 'concert-ua',
          genres: [genreKeyword],
          isStyleMatch: true,
        });
      } catch (err) {
        console.error('[Concert.ua] Error parsing genre event:', err);
      }
    });

    console.log(`[Concert.ua] Found ${events.length} genre events for ${genreKeyword}`);
    return events.slice(0, options.limit || 5);
  } catch (error) {
    console.error(`[Concert.ua] Error scraping genre ${genreKeyword}:`, error);
    return [];
  }
}

/**
 * Get upcoming events in a city
 */
export async function getUpcomingEvents(
  city: string = 'Kyiv',
  limit: number = 20
): Promise<Event[]> {
  try {
    // Concert.ua city-specific URLs
    const cityUrls: Record<string, string> = {
      Kyiv: '/uk/kyiv',
      Lviv: '/uk/lviv',
      Odesa: '/uk/odesa',
    };

    const cityPath = cityUrls[city] || cityUrls['Kyiv'];
    const url = `${BASE_URL}${cityPath}`;

    console.log(`[Concert.ua] Fetching upcoming events in ${city}`);

    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error(`[Concert.ua] HTTP ${response.status} for ${city}`);
      return [];
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const events: Event[] = [];

    $('.event-card, .concert-item, .event-item, article').each((_, element) => {
      try {
        const $el = $(element);

        const title = $el.find('h2, h3, .title, .event-title').first().text().trim();
        const venue = $el.find('.venue, .location, .place').first().text().trim();
        const dateText = $el.find('.date, .event-date, time').first().text().trim();
        const link = $el.find('a').first().attr('href');

        if (!title || !link) return;

        const artistName = title.split('-')[0].trim() || title;
        const eventDate = parseDateFromText(dateText);

        events.push({
          id: `concert-ua-upcoming-${link.replace(/\D/g, '') || Date.now()}`,
          artistName,
          venue: venue || 'Venue TBA',
          date: eventDate,
          location: city,
          city,
          ticketUrl: link.startsWith('http') ? link : `${BASE_URL}${link}`,
          source: 'concert-ua',
        });
      } catch (err) {
        console.error('[Concert.ua] Error parsing upcoming event:', err);
      }
    });

    console.log(`[Concert.ua] Found ${events.length} upcoming events in ${city}`);
    return events.slice(0, limit);
  } catch (error) {
    console.error(`[Concert.ua] Error fetching upcoming events:`, error);
    return [];
  }
}

/**
 * Parse date from Ukrainian date text
 * Examples: "23 листопада", "15 грудня 2024", "Today 19:00"
 */
function parseDateFromText(dateText: string): string {
  try {
    if (!dateText) return new Date().toISOString().split('T')[0];

    const normalized = dateText.toLowerCase().trim();

    // Ukrainian month names to numbers
    const months: Record<string, number> = {
      'січня': 0, 'січень': 0,
      'лютого': 1, 'лютий': 1,
      'березня': 2, 'березень': 2,
      'квітня': 3, 'квітень': 3,
      'травня': 4, 'травень': 4,
      'червня': 5, 'червень': 5,
      'липня': 6, 'липень': 6,
      'серпня': 7, 'серпень': 7,
      'вересня': 8, 'вересень': 8,
      'жовтня': 9, 'жовтень': 9,
      'листопада': 10, 'листопад': 10,
      'грудня': 11, 'грудень': 11,
    };

    // Parse "DD month YYYY" format
    for (const [monthName, monthNum] of Object.entries(months)) {
      if (normalized.includes(monthName)) {
        const parts = normalized.split(/\s+/);
        const day = parseInt(parts[0]) || 1;
        const year = parts[2] ? parseInt(parts[2]) : new Date().getFullYear();
        const date = new Date(year, monthNum, day);
        return date.toISOString().split('T')[0];
      }
    }

    // Try standard date parsing
    const parsed = new Date(dateText);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString().split('T')[0];
    }

    // Fallback to current date
    return new Date().toISOString().split('T')[0];
  } catch {
    return new Date().toISOString().split('T')[0];
  }
}
