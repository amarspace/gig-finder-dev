import { NextRequest, NextResponse } from 'next/server';
import { TicketAggregator } from '@/lib/ticketAggregator';

// Force dynamic rendering for fresh data on every request
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { artists, location } = body;

    if (!artists || !Array.isArray(artists) || artists.length === 0) {
      return NextResponse.json(
        { error: 'Please provide an array of artist names' },
        { status: 400 }
      );
    }

    const userCity = location?.city || 'Kyiv';

    console.log(`[API /events/search] Searching for ${artists.length} artists in ${userCity}`);

    // Use TicketAggregator to find events
    const aggregator = new TicketAggregator();
    const result = await aggregator.findEvents(artists, userCity);

    console.log(`[API /events/search] Found ${result.events.length} events from ${Object.values(result.sources).reduce((a, b) => a + b, 0)} total results`);

    return NextResponse.json({
      events: result.events,
      total: result.events.length,
      sources: result.sources,
      artistsWithEvents: result.artistsWithEvents,
      artistsWithoutEvents: result.artistsWithoutEvents,
      stats: {
        totalArtists: artists.length,
        artistsWithEvents: result.artistsWithEvents.length,
        artistsWithoutEvents: result.artistsWithoutEvents.length,
      },
    });
  } catch (error) {
    console.error('[API /events/search] Error:', error);
    return NextResponse.json(
      { error: 'Failed to search for events' },
      { status: 500 }
    );
  }
}
