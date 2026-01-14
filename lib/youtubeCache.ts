/**
 * YouTube API Cache
 * Caches YouTube API responses to reduce quota usage
 * Cache is stored in memory and expires after specified TTL
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class YouTubeCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private defaultTTL: number = 1000 * 60 * 60; // 1 hour default

  /**
   * Get cached data if available and not expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      console.log(`[YouTubeCache] ⏰ Cache expired for key: ${key}`);
      return null;
    }

    console.log(`[YouTubeCache] ✓ Cache hit for key: ${key}`);
    return entry.data as T;
  }

  /**
   * Set cache entry with optional custom TTL
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const expiresAt = Date.now() + (ttl || this.defaultTTL);

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresAt,
    });

    console.log(`[YouTubeCache] 💾 Cached data for key: ${key} (expires in ${Math.round((ttl || this.defaultTTL) / 1000 / 60)}min)`);
  }

  /**
   * Clear specific cache entry
   */
  clear(key: string): void {
    this.cache.delete(key);
    console.log(`[YouTubeCache] 🗑️  Cleared cache for key: ${key}`);
  }

  /**
   * Clear all cache entries
   */
  clearAll(): void {
    const size = this.cache.size;
    this.cache.clear();
    console.log(`[YouTubeCache] 🗑️  Cleared all cache (${size} entries)`);
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// Export singleton instance
export const youtubeCache = new YouTubeCache();

/**
 * Generate cache key for playlists
 */
export function getPlaylistsCacheKey(userId: string): string {
  return `playlists:${userId}`;
}

/**
 * Generate cache key for playlist items
 */
export function getPlaylistItemsCacheKey(playlistId: string): string {
  return `playlist-items:${playlistId}`;
}

/**
 * Generate cache key for artist socials
 */
export function getArtistSocialsCacheKey(artistName: string): string {
  return `artist-socials:${artistName.toLowerCase()}`;
}
