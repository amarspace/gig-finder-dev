import * as cheerio from 'cheerio';
import { Event } from '@/types/event';

/**
 * Scraper for Kontramarka.ua
 * Searches for events by artist name
 */
export async function scrapeKontramarka(
  artistNames: string[],
  userCity: string = 'Kyiv'
): Promise<Event[]> {
  const events: Event[] = [];

  for (const artist of artistNames) {
    try {
      // Kontramarka search URL (adjust based on actual site structure)
      const searchUrl = `https://kontramarka.ua/uk/search/${encodeURIComponent(artist)}`;

      const response = await fetch(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });

      if (!response.ok) continue;

      const html = await response.text();
      const $ = cheerio.load(html);

      // Parse event cards (selectors need to be adjusted based on actual HTML structure)
      $('.event-item, .event-card, .concert-card').each((_, element) => {
        try {
          const $el = $(element);

          // Extract event details
          const title = $el.find('h2, h3, .event-title, .title').first().text().trim();
          const venue = $el.find('.venue-name, .location, .place-name').first().text().trim();
          const dateText = $el.find('.date, .event-date, time').first().text().trim();
          const timeText = $el.find('.time, .event-time').first().text().trim();
          const ticketLink = $el.find('a[href*="ticket"], a[href*="buy"]').first().attr('href');
          const location = $el.find('.city, .location-city').first().text().trim();

          // Only add if we have minimum required data
          if (title && dateText) {
            const event: Event = {
              id: `kontramarka-${events.length}`,
              artistName: artist,
              venue: venue || 'TBA',
              date: parseDateString(dateText),
              time: timeText || undefined,
              location: location || userCity,
              city: userCity,
              ticketUrl: ticketLink ? (ticketLink.startsWith('http') ? ticketLink : `https://kontramarka.ua${ticketLink}`) : undefined,
              source: 'kontramarka',
            };

            events.push(event);
          }
        } catch (err) {
          console.error('Error parsing Kontramarka event:', err);
        }
      });

      // Rate limiting
      await sleep(1000);
    } catch (error) {
      console.error(`Error scraping Kontramarka for ${artist}:`, error);
    }
  }

  return events;
}

function parseDateString(dateStr: string): string {
  try {
    const ukrainianMonths: { [key: string]: string } = {
      'січня': '01', 'лютого': '02', 'березня': '03', 'квітня': '04',
      'травня': '05', 'червня': '06', 'липня': '07', 'серпня': '08',
      'вересня': '09', 'жовтня': '10', 'листопада': '11', 'грудня': '12',
      'січ': '01', 'лют': '02', 'бер': '03', 'кві': '04',
      'тра': '05', 'чер': '06', 'лип': '07', 'сер': '08',
      'вер': '09', 'жов': '10', 'лис': '11', 'гру': '12',
    };

    for (const [ukMonth, numMonth] of Object.entries(ukrainianMonths)) {
      if (dateStr.toLowerCase().includes(ukMonth)) {
        const parts = dateStr.split(/\s+/);
        const day = parts[0].replace(/\D/g, '').padStart(2, '0');
        const year = parts.find(p => p.length === 4) || new Date().getFullYear().toString();
        return `${year}-${numMonth}-${day}`;
      }
    }

    // Try DD.MM.YYYY
    if (dateStr.match(/\d{1,2}\.\d{1,2}\.\d{4}/)) {
      const [day, month, year] = dateStr.split('.');
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }

    return dateStr;
  } catch (err) {
    return dateStr;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
