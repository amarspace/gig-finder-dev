/**
 * Kontramarka.ua Scraper - Production Implementation
 * Scrapes real event data from Kontramarka for Ukraine
 */

import * as cheerio from 'cheerio';
import { Event } from '@/types/event';

const BASE_URL = 'https://kontramarka.ua';

export interface ScraperOptions {
  city?: string;
  limit?: number;
}

/**
 * Search Kontramarka for an artist
 */
export async function searchArtist(
  artistName: string,
  options: ScraperOptions = {}
): Promise<Event[]> {
  try {
    const searchUrl = `${BASE_URL}/ua/search/?query=${encodeURIComponent(artistName)}`;
    console.log(`[Kontramarka] Searching for: ${artistName}`);

    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error(`[Kontramarka] HTTP ${response.status} for ${artistName}`);
      return [];
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const events: Event[] = [];

    // Parse event listings
    $('article, .event, .event-card, .show-item').each((_, element) => {
      try {
        const $el = $(element);

        const title = $el.find('h2, h3, .title, .event-name').first().text().trim();
        const venue = $el.find('.venue, .place, .location').first().text().trim();
        const dateText = $el.find('.date, time, .event-date').first().text().trim();
        const link = $el.find('a').first().attr('href');

        if (!title || !link) return;

        const eventDate = parseDateFromText(dateText);

        // Determine city
        let city = options.city || 'Kyiv';
        const locationText = (title + ' ' + venue).toLowerCase();
        if (locationText.includes('київ') || locationText.includes('kyiv')) {
          city = 'Kyiv';
        } else if (locationText.includes('львів') || locationText.includes('lviv')) {
          city = 'Lviv';
        } else if (locationText.includes('одеса') || locationText.includes('odesa')) {
          city = 'Odesa';
        } else if (locationText.includes('харків') || locationText.includes('kharkiv')) {
          city = 'Kharkiv';
        }

        events.push({
          id: `kontramarka-${link.replace(/\D/g, '') || Date.now()}`,
          artistName,
          venue: venue || 'Venue TBA',
          date: eventDate,
          location: city,
          city,
          ticketUrl: link.startsWith('http') ? link : `${BASE_URL}${link}`,
          source: 'kontramarka',
        });
      } catch (err) {
        console.error('[Kontramarka] Error parsing event:', err);
      }
    });

    console.log(`[Kontramarka] Found ${events.length} events for ${artistName}`);
    return events.slice(0, options.limit || 10);
  } catch (error) {
    console.error(`[Kontramarka] Error scraping ${artistName}:`, error);
    return [];
  }
}

/**
 * Search for genre-based events
 */
export async function searchGenre(
  genreKeyword: string,
  options: ScraperOptions = {}
): Promise<Event[]> {
  try {
    const searchUrl = `${BASE_URL}/ua/search/?query=${encodeURIComponent(genreKeyword)}`;
    console.log(`[Kontramarka] Searching genre: ${genreKeyword}`);

    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error(`[Kontramarka] HTTP ${response.status} for genre ${genreKeyword}`);
      return [];
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const events: Event[] = [];

    $('article, .event, .event-card, .show-item').each((_, element) => {
      try {
        const $el = $(element);

        const title = $el.find('h2, h3, .title, .event-name').first().text().trim();
        const venue = $el.find('.venue, .place, .location').first().text().trim();
        const dateText = $el.find('.date, time, .event-date').first().text().trim();
        const link = $el.find('a').first().attr('href');

        if (!title || !link) return;

        const eventDate = parseDateFromText(dateText);
        const artistName = title.split('-')[0].trim() || title.substring(0, 50);

        let city = options.city || 'Kyiv';
        const locationText = (title + ' ' + venue).toLowerCase();
        if (locationText.includes('київ') || locationText.includes('kyiv')) {
          city = 'Kyiv';
        } else if (locationText.includes('львів') || locationText.includes('lviv')) {
          city = 'Lviv';
        } else if (locationText.includes('одеса') || locationText.includes('odesa')) {
          city = 'Odesa';
        }

        events.push({
          id: `kontramarka-genre-${link.replace(/\D/g, '') || Date.now()}`,
          artistName,
          venue: venue || 'Venue TBA',
          date: eventDate,
          location: city,
          city,
          ticketUrl: link.startsWith('http') ? link : `${BASE_URL}${link}`,
          source: 'kontramarka',
          genres: [genreKeyword],
          isStyleMatch: true,
        });
      } catch (err) {
        console.error('[Kontramarka] Error parsing genre event:', err);
      }
    });

    console.log(`[Kontramarka] Found ${events.length} genre events for ${genreKeyword}`);
    return events.slice(0, options.limit || 5);
  } catch (error) {
    console.error(`[Kontramarka] Error scraping genre ${genreKeyword}:`, error);
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
    // Kontramarka city-specific paths
    const cityPaths: Record<string, string> = {
      Kyiv: '/ua/events/kyiv',
      Lviv: '/ua/events/lviv',
      Odesa: '/ua/events/odesa',
      Kharkiv: '/ua/events/kharkiv',
    };

    const cityPath = cityPaths[city] || cityPaths['Kyiv'];
    const url = `${BASE_URL}${cityPath}`;

    console.log(`[Kontramarka] Fetching upcoming events in ${city}`);

    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error(`[Kontramarka] HTTP ${response.status} for ${city}`);
      return [];
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const events: Event[] = [];

    $('article, .event, .event-card, .show-item').each((_, element) => {
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
          id: `kontramarka-upcoming-${link.replace(/\D/g, '') || Date.now()}`,
          artistName,
          venue: venue || 'Venue TBA',
          date: eventDate,
          location: city,
          city,
          ticketUrl: link.startsWith('http') ? link : `${BASE_URL}${link}`,
          source: 'kontramarka',
        });
      } catch (err) {
        console.error('[Kontramarka] Error parsing upcoming event:', err);
      }
    });

    console.log(`[Kontramarka] Found ${events.length} upcoming events in ${city}`);
    return events.slice(0, limit);
  } catch (error) {
    console.error(`[Kontramarka] Error fetching upcoming events:`, error);
    return [];
  }
}

/**
 * Parse date from Ukrainian/English date text
 */
function parseDateFromText(dateText: string): string {
  try {
    if (!dateText) return new Date().toISOString().split('T')[0];

    const normalized = dateText.toLowerCase().trim();

    // Ukrainian month names
    const months: Record<string, number> = {
      'січня': 0, 'січень': 0, 'січ': 0,
      'лютого': 1, 'лютий': 1, 'лют': 1,
      'березня': 2, 'березень': 2, 'бер': 2,
      'квітня': 3, 'квітень': 3, 'кві': 3,
      'травня': 4, 'травень': 4, 'тра': 4,
      'червня': 5, 'червень': 5, 'чер': 5,
      'липня': 6, 'липень': 6, 'лип': 6,
      'серпня': 7, 'серпень': 7, 'сер': 7,
      'вересня': 8, 'вересень': 8, 'вер': 8,
      'жовтня': 9, 'жовтень': 9, 'жов': 9,
      'листопада': 10, 'листопад': 10, 'лис': 10,
      'грудня': 11, 'грудень': 11, 'гру': 11,
    };

    // Parse Ukrainian date format
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
