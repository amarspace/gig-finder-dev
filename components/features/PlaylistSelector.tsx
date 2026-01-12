'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { YouTubePlaylist } from '@/types/youtube';
import Checkbox from '@/components/ui/Checkbox';
import Button from '@/components/ui/Button';
import { Music, Loader2, RefreshCw } from 'lucide-react';
import Image from 'next/image';

interface PlaylistSelectorProps {
  onAnalyze: (selectedPlaylistIds: string[]) => void;
  loading?: boolean;
}

export default function PlaylistSelector({
  onAnalyze,
  loading: analyzing = false,
}: PlaylistSelectorProps) {
  const router = useRouter();
  const [playlists, setPlaylists] = useState<YouTubePlaylist[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const fetchPlaylists = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      console.log('[PlaylistSelector] Starting playlist fetch...');

      // Add timestamp to prevent caching
      const timestamp = new Date().getTime();
      console.log('[PlaylistSelector] Fetching from:', `/api/playlists?t=${timestamp}`);

      const response = await fetch(`/api/playlists?t=${timestamp}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });

      console.log('[PlaylistSelector] Response status:', response.status, response.statusText);

      if (!response.ok) {
        const data = await response.json();
        console.error('[PlaylistSelector] API error response:', data);

        // Handle all authentication errors that require re-login
        if (
          data.error === 'TokenExpired' ||
          data.error === 'TokenInvalid' ||
          data.error === 'AuthRequired' ||
          data.requiresReauth
        ) {
          console.error('[PlaylistSelector] Authentication error:', data.error);
          alert(data.message || 'Your session has expired. Please sign in again.');
          await signOut({ callbackUrl: '/profile' });
          return;
        }

        // Handle quota errors
        if (data.error === 'QuotaExceeded') {
          throw new Error('YouTube API quota exceeded. Please try again in a few hours.');
        }

        throw new Error(data.message || data.error || 'Failed to fetch playlists');
      }

      const data = await response.json();
      console.log('[PlaylistSelector] Successfully fetched', data.playlists?.length || 0, 'playlists');
      setPlaylists(data.playlists);

      if (isManualRefresh) {
        console.log(`[PlaylistSelector] Refreshed - found ${data.playlists.length} playlists`);
      }
    } catch (err: any) {
      console.error('[PlaylistSelector] ✗ Error fetching playlists:', err);
      console.error('[PlaylistSelector] Error details:', err.message, err.stack);
      setError(err.message || 'Failed to load your playlists. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchPlaylists(true);
  };

  const togglePlaylist = (playlistId: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(playlistId)) {
      newSelected.delete(playlistId);
    } else {
      newSelected.add(playlistId);
    }
    setSelectedIds(newSelected);
  };

  const toggleAll = () => {
    if (selectedIds.size === playlists.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(playlists.map((p) => p.id)));
    }
  };

  const handleAnalyze = () => {
    onAnalyze(Array.from(selectedIds));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-12 h-12 text-brand-purple animate-spin mb-4" />
        <p className="text-gray-600">Loading your playlists...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Music className="w-8 h-8 text-red-500" />
        </div>
        <p className="text-red-600 mb-4">{error}</p>
        <Button variant="purple" onClick={() => fetchPlaylists()}>
          Try Again
        </Button>
      </div>
    );
  }

  if (playlists.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Music className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-600 mb-2">No playlists found</p>
        <p className="text-sm text-gray-500">
          Create some playlists on YouTube Music first
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with select all and refresh button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h3 className="text-lg font-semibold text-[#2D2D2D]">
              Select Playlists
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {selectedIds.size} of {playlists.length} selected
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
            title="Refresh playlists"
          >
            <RefreshCw
              className={`w-5 h-5 text-brand-purple ${refreshing ? 'animate-spin' : ''}`}
            />
          </button>
        </div>
        <button
          onClick={toggleAll}
          className="text-sm font-medium text-brand-purple hover:text-[#7C3AED] transition-colors"
        >
          {selectedIds.size === playlists.length ? 'Deselect All' : 'Select All'}
        </button>
      </div>

      {/* Playlist list */}
      <div className="space-y-3 max-h-[50vh] overflow-y-auto">
        {playlists.map((playlist) => (
          <div
            key={playlist.id}
            onClick={() => togglePlaylist(playlist.id)}
            className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
              selectedIds.has(playlist.id)
                ? 'border-brand-purple bg-purple-50'
                : 'border-gray-200 bg-white hover:border-brand-purple'
            }`}
          >
            <Checkbox
              checked={selectedIds.has(playlist.id)}
              onChange={() => togglePlaylist(playlist.id)}
            />

            {playlist.thumbnailUrl && (
              <div className="relative w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden">
                <Image
                  src={playlist.thumbnailUrl}
                  alt={playlist.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-[#2D2D2D] truncate">
                {playlist.title}
              </h4>
              <p className="text-sm text-gray-600">
                {playlist.itemCount} {playlist.itemCount === 1 ? 'track' : 'tracks'}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Analyze button */}
      <div className="sticky bottom-0 bg-gradient-to-t from-background via-background to-transparent pt-6">
        <Button
          variant="purple"
          onClick={handleAnalyze}
          disabled={selectedIds.size === 0 || analyzing}
          className="w-full flex items-center justify-center gap-2"
        >
          {analyzing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Music className="w-5 h-5" />
              Analyze {selectedIds.size} {selectedIds.size === 1 ? 'Playlist' : 'Playlists'}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
