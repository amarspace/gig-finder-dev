import { YouTubePlaylistItem, ExtractedArtist } from '@/types/youtube';

/**
 * Parse video title to extract artist name
 * Common formats:
 * - "Artist - Song Title"
 * - "Artist Name - Song Title (Official Video)"
 * - "Song Title by Artist Name"
 * - "Artist: Song Title"
 */
export function extractArtistFromTitle(title: string): string | null {
  // Remove common suffixes
  const cleaned = title
    .replace(/\(Official Video\)/gi, '')
    .replace(/\(Official Music Video\)/gi, '')
    .replace(/\(Official Audio\)/gi, '')
    .replace(/\(Lyric Video\)/gi, '')
    .replace(/\(Lyrics\)/gi, '')
    .replace(/\[Official Video\]/gi, '')
    .replace(/\[Official Music Video\]/gi, '')
    .replace(/\[Official Audio\]/gi, '')
    .trim();

  // Pattern 1: "Artist - Title" or "Artist: Title"
  const dashPattern = /^([^-:]+)[-:](.+)$/;
  const dashMatch = cleaned.match(dashPattern);
  if (dashMatch) {
    const artist = dashMatch[1].trim();
    // Filter out common non-artist prefixes
    if (
      !artist.toLowerCase().startsWith('official') &&
      artist.length > 0 &&
      artist.length < 100
    ) {
      return artist;
    }
  }

  // Pattern 2: "Title by Artist"
  const byPattern = /\s+by\s+([^([]+)/i;
  const byMatch = cleaned.match(byPattern);
  if (byMatch) {
    return byMatch[1].trim();
  }

  // Pattern 3: Use channel title as fallback if it's not "Various Artists" or "Topic"
  // This will be handled by the caller using channelTitle

  return null;
}

/**
 * Extract unique artists from a list of playlist items
 */
export function extractUniqueArtists(
  items: YouTubePlaylistItem[]
): ExtractedArtist[] {
  const artistCounts = new Map<string, number>();

  items.forEach((item) => {
    // Try to extract from title first
    let artist = extractArtistFromTitle(item.title);

    // Fallback to channel title if title parsing fails
    if (!artist || artist === 'Various Artists') {
      artist = item.channelTitle;
    }

    // Clean up channel title if it ends with " - Topic" (auto-generated channels)
    if (artist.endsWith(' - Topic')) {
      artist = artist.replace(' - Topic', '').trim();
    }

    // Skip if artist is empty or too generic
    if (
      !artist ||
      artist.toLowerCase() === 'various artists' ||
      artist.toLowerCase() === 'unknown artist' ||
      artist.length === 0
    ) {
      return;
    }

    // Normalize artist name (trim, capitalize properly)
    const normalizedArtist = normalizeArtistName(artist);

    // Count occurrences
    const currentCount = artistCounts.get(normalizedArtist) || 0;
    artistCounts.set(normalizedArtist, currentCount + 1);
  });

  // Convert to array and sort by count (descending)
  const artists: ExtractedArtist[] = Array.from(
    artistCounts.entries()
  ).map(([name, count]) => ({ name, count }));

  return artists.sort((a, b) => b.count - a.count);
}

/**
 * Normalize artist name for deduplication
 * - Trim whitespace
 * - Remove multiple spaces
 * - Consistent capitalization
 */
function normalizeArtistName(name: string): string {
  return name
    .trim()
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/\s*&\s*/g, ' & ') // Normalize ampersands
    .replace(/\s*,\s*/g, ', '); // Normalize commas
}

/**
 * Extract artists from playlist items (accepts array or Map)
 * Returns artists with their frequencies
 */
export function extractArtistsFromPlaylists(
  items: YouTubePlaylistItem[] | YouTubePlaylistItem[][]
): { artists: string[]; frequencies: Map<string, number> } {
  // Flatten if array of arrays
  const allItems = Array.isArray(items[0])
    ? (items as YouTubePlaylistItem[][]).flat()
    : (items as YouTubePlaylistItem[]);

  const artistCounts = new Map<string, number>();

  allItems.forEach((item) => {
    // Try to extract from title first
    let artist = extractArtistFromTitle(item.title);

    // Fallback to channel title if title parsing fails
    if (!artist || artist === 'Various Artists') {
      artist = item.channelTitle;
    }

    // Clean up channel title if it ends with " - Topic" (auto-generated channels)
    if (artist && artist.endsWith(' - Topic')) {
      artist = artist.replace(' - Topic', '').trim();
    }

    // Skip if artist is empty or too generic
    if (
      !artist ||
      artist.toLowerCase() === 'various artists' ||
      artist.toLowerCase() === 'unknown artist' ||
      artist.length === 0
    ) {
      return;
    }

    // Normalize artist name (trim, capitalize properly)
    const normalizedArtist = normalizeArtistName(artist);

    // Count occurrences
    const currentCount = artistCounts.get(normalizedArtist) || 0;
    artistCounts.set(normalizedArtist, currentCount + 1);
  });

  // Sort artists by frequency (most common first)
  const sortedArtists = Array.from(artistCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([name]) => name);

  return {
    artists: sortedArtists,
    frequencies: artistCounts,
  };
}
