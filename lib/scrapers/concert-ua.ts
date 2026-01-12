import * as cheerio from 'cheerio';
import { Event } from '@/types/event';

/**
 * Scraper for Concert.ua
 * Searches for events by artist name
 */
export async function scrapeConcertUa(
  artistNames: string[],
  userCity: string = 'Kyiv'
): Promise<Event[]> {
  const events: Event[] = [];

  for (const artist of artistNames) {
    try {
      // Concert.ua search URL (adjust based on actual site structure)
      const searchUrl = `https://concert.ua/uk/search?q=${encodeURIComponent(artist)}`;

      const response = await fetch(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });

      if (!response.ok) continue;

      const html = await response.text();
      const $ = cheerio.load(html);

      // Parse event cards (selectors need to be adjusted based on actual HTML structure)
      $('.event-card, .concert-item, article').each((_, element) => {
        try {
          const $el = $(element);

          // Extract event details
          const title = $el.find('h2, h3, .title, .event-title').first().text().trim();
          const venue = $el.find('.venue, .location, .place').first().text().trim();
          const dateText = $el.find('.date, time, .event-date').first().text().trim();
          const ticketUrl = $el.find('a.ticket, a.buy, .buy-button').first().attr('href');
          const location = $el.find('.city, .address').first().text().trim();

          // Only add if we have minimum required data
          if (title && dateText) {
            const event: Event = {
              id: `concert-ua-${events.length}`,
              artistName: artist,
              venue: venue || 'TBA',
              date: parseDateString(dateText),
              location: location || userCity,
              city: userCity,
              ticketUrl: ticketUrl ? `https://concert.ua${ticketUrl}` : undefined,
              source: 'concert-ua',
            };

            events.push(event);
          }
        } catch (err) {
          console.error('Error parsing event:', err);
        }
      });

      // Rate limiting - wait between requests
      await sleep(1000);
    } catch (error) {
      console.error(`Error scraping Concert.ua for ${artist}:`, error);
    }
  }

  return events;
}

function parseDateString(dateStr: string): string {
  try {
    // Try to parse Ukrainian date format
    // Example: "12 грудня 2024" or "12.12.2024"
    const ukrainianMonths: { [key: string]: string } = {
      'січня': '01', 'лютого': '02', 'березня': '03', 'квітня': '04',
      'травня': '05', 'червня': '06', 'липня': '07', 'серпня': '08',
      'вересня': '09', 'жовтня': '10', 'листопада': '11', 'грудня': '12',
    };

    for (const [ukMonth, numMonth] of Object.entries(ukrainianMonths)) {
      if (dateStr.includes(ukMonth)) {
        const parts = dateStr.split(' ');
        const day = parts[0].padStart(2, '0');
        const year = parts[2] || new Date().getFullYear();
        return `${year}-${numMonth}-${day}`;
      }
    }

    // Try DD.MM.YYYY format
    if (dateStr.match(/\d{1,2}\.\d{1,2}\.\d{4}/)) {
      const [day, month, year] = dateStr.split('.');
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }

    // Fallback: return as-is
    return dateStr;
  } catch (err) {
    return dateStr;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
