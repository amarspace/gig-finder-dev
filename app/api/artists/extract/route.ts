import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { YouTubeService } from '@/lib/youtube';
import { extractArtistsFromPlaylists } from '@/lib/extractArtists';

// Force dynamic rendering for fresh data on every request
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in with Google' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { playlistIds } = body;

    if (!playlistIds || !Array.isArray(playlistIds) || playlistIds.length === 0) {
      return NextResponse.json(
        { error: 'Please provide an array of playlist IDs' },
        { status: 400 }
      );
    }

    const youtube = new YouTubeService(session.accessToken);

    // Fetch all items from selected playlists
    const playlistsMap = await youtube.getMultiplePlaylistItems(playlistIds);

    // Convert Map to array of playlist items
    const allItems = Array.from(playlistsMap.values());

    // Extract unique artists
    const artists = extractArtistsFromPlaylists(allItems);

    return NextResponse.json({
      artists,
      totalTracks: Array.from(playlistsMap.values()).reduce(
        (sum, items) => sum + items.length,
        0
      ),
      playlistCount: playlistIds.length,
    });
  } catch (error) {
    console.error('Error in /api/artists/extract:', error);
    return NextResponse.json(
      { error: 'Failed to extract artists' },
      { status: 500 }
    );
  }
}
