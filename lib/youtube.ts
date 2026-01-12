import axios from 'axios';
import {
  YouTubePlaylist,
  YouTubePlaylistItem,
  YouTubeApiResponse,
} from '@/types/youtube';
import { MOCK_PLAYLISTS, MOCK_PLAYLIST_ITEMS } from './mockData';

const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_YOUTUBE === 'true';

export class YouTubeService {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  /**
   * Fetch all playlists from the user's library
   * Uses pagination to get ALL playlists
   */
  async getAllPlaylists(): Promise<YouTubePlaylist[]> {
    // Use mock data if enabled or if quota exceeded
    if (USE_MOCK_DATA) {
      console.log('[YouTubeService] ⚠️  Using MOCK playlist data (quota exceeded or dev mode)');
      return Promise.resolve(MOCK_PLAYLISTS);
    }

    const playlists: YouTubePlaylist[] = [];
    let pageToken: string | undefined = undefined;

    console.log('[YouTubeService] Fetching playlists with OAuth token');

    try {
      do {
        console.log(`[YouTubeService] Fetching page ${pageToken ? `(token: ${pageToken.substring(0, 10)}...)` : '(first page)'}`);

        const response: { data: YouTubeApiResponse<any> } = await axios.get<YouTubeApiResponse<any>>(
          `${YOUTUBE_API_BASE}/playlists`,
          {
            params: {
              part: 'snippet,contentDetails',
              mine: true,
              maxResults: 50,
              pageToken,
            },
            headers: {
              Authorization: `Bearer ${this.accessToken}`,
            },
          }
        );

        console.log('[YouTubeService] ✓ Received', response.data.items?.length || 0, 'playlists in this page');
        console.log('[YouTubeService] Raw response:', JSON.stringify(response.data, null, 2).substring(0, 500));

        const items = response.data.items.map((item) => ({
          id: item.id,
          title: item.snippet.title,
          description: item.snippet.description || '',
          thumbnailUrl:
            item.snippet.thumbnails?.medium?.url ||
            item.snippet.thumbnails?.default?.url ||
            '',
          itemCount: item.contentDetails.itemCount || 0,
        }));

        playlists.push(...items);
        pageToken = response.data.nextPageToken;
      } while (pageToken);

      return playlists;
    } catch (error: any) {
      console.error('[YouTubeService] ✗ Error fetching playlists');
      console.error('[YouTubeService] Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText,
      });

      // Return more specific error message
      if (error.response?.status === 401) {
        throw new Error('YouTube authentication failed. Please sign in again.');
      } else if (error.response?.status === 403) {
        throw new Error('YouTube API quota exceeded. Please try again later.');
      } else if (error.response?.data?.error?.message) {
        throw new Error(`YouTube API error: ${error.response.data.error.message}`);
      } else {
        throw new Error('Failed to fetch playlists from YouTube');
      }
    }
  }

  /**
   * Fetch all items (videos) from a specific playlist
   * Uses pagination to get ALL items
   */
  async getPlaylistItems(playlistId: string): Promise<YouTubePlaylistItem[]> {
    // Use mock data if enabled
    if (USE_MOCK_DATA) {
      console.log(`[YouTubeService] ⚠️  Using MOCK playlist items for ${playlistId}`);
      return Promise.resolve(MOCK_PLAYLIST_ITEMS[playlistId] || []);
    }

    const items: YouTubePlaylistItem[] = [];
    let pageToken: string | undefined = undefined;

    try {
      do {
        const response: { data: YouTubeApiResponse<any> } = await axios.get<YouTubeApiResponse<any>>(
          `${YOUTUBE_API_BASE}/playlistItems`,
          {
            params: {
              part: 'snippet',
              playlistId,
              maxResults: 50,
              pageToken,
            },
            headers: {
              Authorization: `Bearer ${this.accessToken}`,
            },
          }
        );

        const playlistItems = response.data.items.map((item) => ({
          id: item.id,
          title: item.snippet.title,
          videoId: item.snippet.resourceId.videoId,
          channelTitle: item.snippet.channelTitle || '',
          thumbnailUrl:
            item.snippet.thumbnails?.medium?.url ||
            item.snippet.thumbnails?.default?.url ||
            '',
        }));

        items.push(...playlistItems);
        pageToken = response.data.nextPageToken;
      } while (pageToken);

      return items;
    } catch (error) {
      console.error(`Error fetching playlist items for ${playlistId}:`, error);
      throw new Error('Failed to fetch playlist items from YouTube');
    }
  }

  /**
   * Fetch items from multiple playlists in parallel
   */
  async getMultiplePlaylistItems(
    playlistIds: string[]
  ): Promise<Map<string, YouTubePlaylistItem[]>> {
    const results = new Map<string, YouTubePlaylistItem[]>();

    // Process in batches to avoid rate limits
    const batchSize = 5;
    for (let i = 0; i < playlistIds.length; i += batchSize) {
      const batch = playlistIds.slice(i, i + batchSize);
      const promises = batch.map(async (id) => {
        const items = await this.getPlaylistItems(id);
        return { id, items };
      });

      const batchResults = await Promise.all(promises);
      batchResults.forEach(({ id, items }) => {
        results.set(id, items);
      });
    }

    return results;
  }

  /**
   * Search for a YouTube channel by artist name
   * Returns the channel URL if found, null otherwise
   */
  async searchArtistChannel(artistName: string): Promise<string | null> {
    try {
      const response = await axios.get<YouTubeApiResponse<any>>(
        `${YOUTUBE_API_BASE}/search`,
        {
          params: {
            part: 'snippet',
            q: artistName,
            type: 'channel',
            maxResults: 1,
          },
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        }
      );

      const channels = response.data.items || [];
      if (channels.length === 0) {
        return null;
      }

      const channelId = channels[0].id.channelId;
      return `https://www.youtube.com/channel/${channelId}`;
    } catch (error) {
      console.error(`Error searching for channel: ${artistName}`, error);
      return null;
    }
  }

  /**
   * Batch fetch YouTube channels for multiple artists
   */
  async searchArtistChannels(
    artistNames: string[]
  ): Promise<Map<string, string>> {
    const channelMap = new Map<string, string>();

    // Limit to first 5 artists to avoid rate limiting
    const limitedArtists = artistNames.slice(0, 5);

    const results = await Promise.allSettled(
      limitedArtists.map(async (artist) => {
        const channelUrl = await this.searchArtistChannel(artist);
        return { artist, channelUrl };
      })
    );

    results.forEach((result) => {
      if (result.status === 'fulfilled' && result.value.channelUrl) {
        channelMap.set(result.value.artist, result.value.channelUrl);
      }
    });

    return channelMap;
  }

  /**
   * Search for an artist's Instagram profile
   * Returns Instagram URL if found, null otherwise
   */
  async searchInstagramProfile(artistName: string): Promise<string | null> {
    try {
      // Use YouTube channel description to find Instagram links
      const channelUrl = await this.searchArtistChannel(artistName);

      if (!channelUrl) {
        return null;
      }

      // Extract channel ID from URL
      const channelId = channelUrl.split('/').pop();

      if (!channelId) {
        return null;
      }

      // Fetch channel details including description
      const response = await axios.get<YouTubeApiResponse<any>>(
        `${YOUTUBE_API_BASE}/channels`,
        {
          params: {
            part: 'snippet',
            id: channelId,
          },
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        }
      );

      const channels = response.data.items || [];
      if (channels.length === 0) {
        return null;
      }

      const description = channels[0].snippet.description || '';

      // Search for Instagram URL in description
      const instagramPattern = /(?:https?:\/\/)?(?:www\.)?instagram\.com\/([a-zA-Z0-9._]+)/i;
      const match = description.match(instagramPattern);

      if (match) {
        return `https://www.instagram.com/${match[1]}`;
      }

      // Fallback: construct Instagram URL from artist name
      const username = artistName.toLowerCase().replace(/\s+/g, '');
      return `https://www.instagram.com/${username}`;
    } catch (error) {
      console.error(`Error searching for Instagram: ${artistName}`, error);
      return null;
    }
  }

  /**
   * Batch fetch social media links (YouTube + Instagram) for multiple artists
   */
  async searchArtistSocials(
    artistNames: string[]
  ): Promise<Map<string, { youtube?: string; instagram?: string }>> {
    const socialsMap = new Map<string, { youtube?: string; instagram?: string }>();

    // Limit to first 5 artists to avoid rate limiting
    const limitedArtists = artistNames.slice(0, 5);

    const results = await Promise.allSettled(
      limitedArtists.map(async (artist) => {
        const [youtubeUrl, instagramUrl] = await Promise.all([
          this.searchArtistChannel(artist),
          this.searchInstagramProfile(artist),
        ]);
        return { artist, youtubeUrl, instagramUrl };
      })
    );

    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        const { artist, youtubeUrl, instagramUrl } = result.value;
        socialsMap.set(artist, {
          youtube: youtubeUrl || undefined,
          instagram: instagramUrl || undefined,
        });
      }
    });

    return socialsMap;
  }
}
