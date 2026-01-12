import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { YouTubeService } from '@/lib/youtube';
import { extractArtistsFromPlaylists } from '@/lib/extractArtists';
import { TicketmasterService } from '@/lib/services/ticketmasterService';
import {
  analyzeUserVibeProfile,
  calculateVibeMatch,
  calculateExactArtistMatch,
  detectVibes,
  getVibeName,
  formatTasteProfile,
  type TasteProfile,
} from '@/lib/vibeMapper';
import { Event } from '@/types/event';

// Force dynamic rendering for fresh data on every request
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[API /user/matches] Fetching global event matches...');

    const body = await request.json();
    const { playlistIds, latitude, longitude } = body;

    // Validate geolocation
    if (
      latitude === undefined ||
      longitude === undefined ||
      typeof latitude !== 'number' ||
      typeof longitude !== 'number'
    ) {
      return NextResponse.json(
        {
          error: 'Geolocation required',
          message: 'Please provide valid latitude and longitude coordinates',
        },
        { status: 400 }
      );
    }

    console.log(`[API /user/matches] User location: ${latitude}, ${longitude}`);

    // Fetch user's YouTube playlists
    const youtubeService = new YouTubeService(session.accessToken as string);

    let playlistsToAnalyze: any[];

    if (playlistIds && playlistIds.length > 0) {
      // Use specific playlists provided by user
      const allPlaylists = await youtubeService.getAllPlaylists();
      playlistsToAnalyze = allPlaylists.filter((p) =>
        playlistIds.includes(p.id)
      );
      console.log(
        `[API /user/matches] Analyzing ${playlistsToAnalyze.length} selected playlists`
      );
    } else {
      // Default: analyze first 5 playlists for better genre detection
      const playlists = await youtubeService.getAllPlaylists();
      playlistsToAnalyze = playlists.slice(0, 5);
      console.log(
        `[API /user/matches] Analyzing first ${playlistsToAnalyze.length} playlists`
      );
    }

    if (playlistsToAnalyze.length === 0) {
      return NextResponse.json({
        topMatch: null,
        upcomingGigs: [],
        allMatches: [],
        artistFrequencies: {},
        tasteProfile: null,
        message: 'No playlists found',
      });
    }

    // Get all playlist items
    const playlistItems = await Promise.all(
      playlistsToAnalyze.map((playlist) =>
        youtubeService.getPlaylistItems(playlist.id)
      )
    );

    const allItems = playlistItems.flat();
    console.log(`[API /user/matches] Analyzing ${allItems.length} videos`);

    // Extract artists and calculate frequencies
    const { artists: topArtists, frequencies: artistFrequencies } =
      extractArtistsFromPlaylists(allItems);

    console.log(
      `[API /user/matches] Found ${topArtists.length} unique artists`
    );

    // Analyze user's taste profile from artists and video titles
    const videoTitles = allItems.map((item) => item.title);
    const userTasteProfile: TasteProfile = analyzeUserVibeProfile(
      topArtists,
      videoTitles
    );

    const tasteProfileFormatted = formatTasteProfile(userTasteProfile);
    console.log(
      `[API /user/matches] User taste profile:`,
      tasteProfileFormatted
    );

    // If no genres detected, use a broad "Music" search as ultimate fallback
    if (userTasteProfile.genreIds.length === 0) {
      console.log('[API /user/matches] ⚠️  No genres detected - will use broad music search');
      // Add a generic "Pop" genre as fallback to ensure we get some results
      userTasteProfile.genreIds.push('KnvZfZ7vAev'); // Pop genre ID
      userTasteProfile.topVibes.push('POP');
    }

    // Initialize Ticketmaster service
    const ticketmaster = new TicketmasterService();

    // Strategy: Genre-first approach with smart fallback
    // 1. Search by top genres to get a base set of events
    // 2. Try to find specific artists from user's library
    // 3. Ensure we always have 15 quality results

    let allEvents: Event[] = [];
    const radius = 1000; // 1000km radius for global coverage

    // STEP 1: Genre-based search (primary strategy)
    console.log(
      `[API /user/matches] Searching by genres: ${userTasteProfile.genreIds.join(', ')}`
    );

    if (userTasteProfile.genreIds.length > 0) {
      try {
        const genreEvents = await ticketmaster.searchNearestEvents({
          latitude,
          longitude,
          radius,
          genreIds: userTasteProfile.genreIds,
          size: 30, // Get more to have options after filtering
        });

        console.log(
          `[Ticketmaster] Found ${genreEvents.length} genre-based events`
        );

        // Mark as genre matches (Similar Vibe)
        const genreEventsMarked = genreEvents.map((event) => ({
          ...event,
          isStyleMatch: true,
        }));

        allEvents.push(...genreEventsMarked);
      } catch (error) {
        console.error('[Ticketmaster] Genre search error:', error);
      }
    }

    // STEP 2: Try to find exact artist matches (top 5 artists only to avoid rate limits)
    const topArtistsToSearch = topArtists.slice(0, 5);
    console.log(
      `[API /user/matches] Searching for top ${topArtistsToSearch.length} artists...`
    );

    // Add delay between requests to avoid rate limiting
    const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    for (const artist of topArtistsToSearch) {
      try {
        await delay(200); // 200ms delay between requests

        const artistEvents = await ticketmaster.searchNearestEvents({
          latitude,
          longitude,
          radius,
          keyword: artist,
          size: 3, // Limit results per artist
        });

        if (artistEvents.length > 0) {
          console.log(
            `[Ticketmaster] Found ${artistEvents.length} events for ${artist}`
          );

          // Mark as exact artist matches (not style matches)
          const exactMatches = artistEvents.map((event) => ({
            ...event,
            isStyleMatch: false,
            isExactMatch: true,
          }));

          allEvents.push(...exactMatches);
        }
      } catch (error) {
        console.error(`[Ticketmaster] Error searching for ${artist}:`, error);
      }
    }

    // STEP 3: Remove duplicates (same event ID)
    const uniqueEvents = Array.from(
      new Map(allEvents.map((event) => [event.id, event])).values()
    );

    console.log(
      `[API /user/matches] Total unique events: ${uniqueEvents.length}`
    );

    // STEP 4: Calculate vibe match percentage for each event
    const eventsWithScores = uniqueEvents.map((event) => {
      // Detect genres from event data
      const eventVibes = detectVibes(
        `${event.artistName} ${event.genres?.join(' ') || ''}`
      );

      let vibeMatch: number;

      // Check if this is an exact artist match first
      if ((event as any).isExactMatch) {
        vibeMatch = calculateExactArtistMatch(
          event.artistName,
          topArtists,
          artistFrequencies
        );
      } else {
        // Genre-based match
        vibeMatch = calculateVibeMatch(eventVibes, userTasteProfile);
      }

      // If no match found, give a minimum score based on being in the same genre family
      if (vibeMatch === 0 && event.isStyleMatch) {
        vibeMatch = 82; // Default for genre matches
      }

      return {
        ...event,
        vibeMatch,
        detectedVibes: eventVibes,
      };
    });

    // STEP 5: Filter out low-quality matches (< 75%) and sort
    const filteredEvents = eventsWithScores
      .filter((e) => e.vibeMatch >= 75) // Only show high-quality matches
      .sort((a, b) => {
        // Primary: Exact matches first
        if ((a as any).isExactMatch && !(b as any).isExactMatch) return -1;
        if (!(a as any).isExactMatch && (b as any).isExactMatch) return 1;

        // Secondary: Vibe match score (higher is better)
        if (a.vibeMatch !== b.vibeMatch) {
          return (b.vibeMatch || 0) - (a.vibeMatch || 0);
        }

        // Tertiary: Distance (closer is better)
        if (a.distance !== undefined && b.distance !== undefined) {
          return a.distance - b.distance;
        }

        return 0;
      });

    // STEP 6: Take exactly 15 best matches
    const top15Events = filteredEvents.slice(0, 15);

    console.log(
      `[API /user/matches] Returning ${top15Events.length} events (${
        top15Events.filter((e) => (e as any).isExactMatch).length
      } exact artist, ${
        top15Events.filter((e) => e.isStyleMatch && !(e as any).isExactMatch).length
      } similar vibe)`
    );

    // STEP 7: Fetch social media links for top matched artists (limit to first 3)
    const topMatchedArtists = top15Events
      .slice(0, 3)
      .map((e) => e.artistName);
    const socialsMap = await youtubeService.searchArtistSocials(
      topMatchedArtists
    );

    // Add social media URLs to matches
    const matchesWithSocials = top15Events.map((match) => {
      const socials = socialsMap.get(match.artistName);
      return {
        ...match,
        youtubeUrl: socials?.youtube || undefined,
        instagramUrl: socials?.instagram || undefined,
      };
    });

    return NextResponse.json(
      {
        topMatch: matchesWithSocials[0] || null,
        upcomingGigs: matchesWithSocials.slice(1, 4), // Next 3 top matches
        allMatches: matchesWithSocials, // All 15 events
        artistFrequencies: Object.fromEntries(artistFrequencies),
        tasteProfile: {
          topVibes: tasteProfileFormatted,
          vibeWeights: Object.fromEntries(userTasteProfile.vibeWeights),
          genreIds: userTasteProfile.genreIds,
        },
        stats: {
          totalPlaylists: playlistsToAnalyze.length,
          playlistsAnalyzed: playlistsToAnalyze.length,
          totalVideos: allItems.length,
          uniqueArtists: topArtists.length,
          eventsFound: top15Events.length,
          exactArtistMatches: top15Events.filter((e) => (e as any).isExactMatch).length,
          styleMatches: top15Events.filter(
            (e) => e.isStyleMatch && !(e as any).isExactMatch
          ).length,
          socialLinksFound: socialsMap.size,
          userLocation: { latitude, longitude },
        },
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    );
  } catch (error) {
    console.error('[API /user/matches] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch user matches',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
