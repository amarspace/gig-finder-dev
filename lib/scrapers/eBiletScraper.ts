/**
 * eBilet.pl Scraper - Production Implementation
 * Scrapes real event data from eBilet for Poland
 */

import * as cheerio from 'cheerio';
import { Event } from '@/types/event';

const BASE_URL = 'https://www.ebilet.pl';

export interface ScraperOptions {
  city?: string;
  limit?: number;
}

/**
 * Search eBilet for an artist
 */
export async function searchArtist(
  artistName: string,
  options: ScraperOptions = {}
): Promise<Event[]> {
  try {
    const searchUrl = `${BASE_URL}/szukaj?q=${encodeURIComponent(artistName)}`;
    console.log(`[eBilet.pl] Searching for: ${artistName}`);

    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error(`[eBilet.pl] HTTP ${response.status} for ${artistName}`);
      return [];
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const events: Event[] = [];

    // Parse event cards
    $('article, .event-item, .event-card, .result-item').each((_, element) => {
      try {
        const $el = $(element);

        const title = $el.find('h2, h3, .title, .event-name').first().text().trim();
        const venue = $el.find('.venue, .place, .location').first().text().trim();
        const dateText = $el.find('.date, time, .event-date').first().text().trim();
        const link = $el.find('a').first().attr('href');

        if (!title || !link) return;

        const eventDate = parseDateFromText(dateText);

        // Determine city
        let city = options.city || 'Warsaw';
        const locationText = (title + ' ' + venue).toLowerCase();
        if (locationText.includes('warszawa') || locationText.includes('warsaw')) {
          city = 'Warsaw';
        } else if (locationText.includes('kraków') || locationText.includes('krakow')) {
          city = 'Krakow';
        } else if (locationText.includes('wrocław') || locationText.includes('wroclaw')) {
          city = 'Wroclaw';
        } else if (locationText.includes('poznań') || locationText.includes('poznan')) {
          city = 'Poznan';
        }

        events.push({
          id: `ebilet-${link.replace(/\D/g, '') || Date.now()}`,
          artistName,
          venue: venue || 'Venue TBA',
          date: eventDate,
          location: city,
          city,
          ticketUrl: link.startsWith('http') ? link : `${BASE_URL}${link}`,
          source: 'bandsintown',
        });
      } catch (err) {
        console.error('[eBilet.pl] Error parsing event:', err);
      }
    });

    console.log(`[eBilet.pl] Found ${events.length} events for ${artistName}`);
    return events.slice(0, options.limit || 10);
  } catch (error) {
    console.error(`[eBilet.pl] Error scraping ${artistName}:`, error);
    return [];
  }
}

/**
 * Search for genre-based events in Poland
 */
export async function searchGenre(
  genreKeyword: string,
  options: ScraperOptions = {}
): Promise<Event[]> {
  try {
    const searchUrl = `${BASE_URL}/szukaj?q=${encodeURIComponent(genreKeyword)}`;
    console.log(`[eBilet.pl] Searching genre: ${genreKeyword}`);

    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error(`[eBilet.pl] HTTP ${response.status} for genre ${genreKeyword}`);
      return [];
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const events: Event[] = [];

    $('article, .event-item, .event-card, .result-item').each((_, element) => {
      try {
        const $el = $(element);

        const title = $el.find('h2, h3, .title, .event-name').first().text().trim();
        const venue = $el.find('.venue, .place, .location').first().text().trim();
        const dateText = $el.find('.date, time, .event-date').first().text().trim();
        const link = $el.find('a').first().attr('href');

        if (!title || !link) return;

        const eventDate = parseDateFromText(dateText);
        const artistName = title.split('-')[0].trim() || title.substring(0, 50);

        let city = options.city || 'Warsaw';
        const locationText = (title + ' ' + venue).toLowerCase();
        if (locationText.includes('warszawa') || locationText.includes('warsaw')) {
          city = 'Warsaw';
        } else if (locationText.includes('kraków') || locationText.includes('krakow')) {
          city = 'Krakow';
        } else if (locationText.includes('wrocław') || locationText.includes('wroclaw')) {
          city = 'Wroclaw';
        }

        events.push({
          id: `ebilet-genre-${link.replace(/\D/g, '') || Date.now()}`,
          artistName,
          venue: venue || 'Venue TBA',
          date: eventDate,
          location: city,
          city,
          ticketUrl: link.startsWith('http') ? link : `${BASE_URL}${link}`,
          source: 'bandsintown',
          genres: [genreKeyword],
          isStyleMatch: true,
        });
      } catch (err) {
        console.error('[eBilet.pl] Error parsing genre event:', err);
      }
    });

    console.log(`[eBilet.pl] Found ${events.length} genre events for ${genreKeyword}`);
    return events.slice(0, options.limit || 5);
  } catch (error) {
    console.error(`[eBilet.pl] Error scraping genre ${genreKeyword}:`, error);
    return [];
  }
}

/**
 * Get upcoming events in a Polish city
 */
export async function getUpcomingEvents(
  city: string = 'Warsaw',
  limit: number = 20
): Promise<Event[]> {
  try {
    // eBilet city-specific paths
    const cityPaths: Record<string, string> = {
      Warsaw: '/koncerty/warszawa',
      Krakow: '/koncerty/krakow',
      Wroclaw: '/koncerty/wroclaw',
      Poznan: '/koncerty/poznan',
      Gdansk: '/koncerty/gdansk',
    };

    const cityPath = cityPaths[city] || cityPaths['Warsaw'];
    const url = `${BASE_URL}${cityPath}`;

    console.log(`[eBilet.pl] Fetching upcoming events in ${city}`);

    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error(`[eBilet.pl] HTTP ${response.status} for ${city}`);
      return [];
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const events: Event[] = [];

    $('article, .event-item, .event-card, .result-item').each((_, element) => {
      try {
        const $el = $(element);

        const title = $el.find('h2, h3, .title, .event-name').first().text().trim();
        const venue = $el.find('.venue, .place, .location').first().text().trim();
        const dateText = $el.find('.date, time, .event-date').first().text().trim();
        const link = $el.find('a').first().attr('href');

        if (!title || !link) return;

        const artistName = title.split('-')[0].trim() || title;
        const eventDate = parseDateFromText(dateText);

        events.push({
          id: `ebilet-upcoming-${link.replace(/\D/g, '') || Date.now()}`,
          artistName,
          venue: venue || 'Venue TBA',
          date: eventDate,
          location: city,
          city,
          ticketUrl: link.startsWith('http') ? link : `${BASE_URL}${link}`,
          source: 'bandsintown',
        });
      } catch (err) {
        console.error('[eBilet.pl] Error parsing upcoming event:', err);
      }
    });

    console.log(`[eBilet.pl] Found ${events.length} upcoming events in ${city}`);
    return events.slice(0, limit);
  } catch (error) {
    console.error(`[eBilet.pl] Error fetching upcoming events:`, error);
    return [];
  }
}

/**
 * Parse date from Polish date text
 */
function parseDateFromText(dateText: string): string {
  try {
    if (!dateText) return new Date().toISOString().split('T')[0];

    const normalized = dateText.toLowerCase().trim();

    // Polish month names
    const months: Record<string, number> = {
      'stycznia': 0, 'styczeń': 0, 'sty': 0,
      'lutego': 1, 'luty': 1, 'lut': 1,
      'marca': 2, 'marzec': 2, 'mar': 2,
      'kwietnia': 3, 'kwiecień': 3, 'kwi': 3,
      'maja': 4, 'maj': 4,
      'czerwca': 5, 'czerwiec': 5, 'cze': 5,
      'lipca': 6, 'lipiec': 6, 'lip': 6,
      'sierpnia': 7, 'sierpień': 7, 'sie': 7,
      'września': 8, 'wrzesień': 8, 'wrz': 8,
      'października': 9, 'październik': 9, 'paź': 9,
      'listopada': 10, 'listopad': 10, 'lis': 10,
      'grudnia': 11, 'grudzień': 11, 'gru': 11,
    };

    // Parse Polish date format
    for (const [monthName, monthNum] of Object.entries(months)) {
      if (normalized.includes(monthName)) {
        const parts = normalized.split(/\s+/);
        const day = parseInt(parts[0]) || 1;
        const yearMatch = normalized.match(/\b(20\d{2})\b/);
        const year = yearMatch ? parseInt(yearMatch[0]) : new Date().getFullYear();
        const date = new Date(year, monthNum, day);
        return date.toISOString().split('T')[0];
      }
    }

    // Try ISO format
    const isoMatch = normalized.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (isoMatch) {
      return isoMatch[0];
    }

    // Try DD.MM.YYYY format
    const ddmmyyyyMatch = normalized.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/);
    if (ddmmyyyyMatch) {
      const day = parseInt(ddmmyyyyMatch[1]);
      const month = parseInt(ddmmyyyyMatch[2]) - 1;
      const year = parseInt(ddmmyyyyMatch[3]);
      return new Date(year, month, day).toISOString().split('T')[0];
    }

    // Fallback
    return new Date().toISOString().split('T')[0];
  } catch {
    return new Date().toISOString().split('T')[0];
  }
}
