'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Music, Camera, ChevronRight, Heart, Instagram, Youtube, MapPin, ExternalLink } from 'lucide-react';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import CentralAnimation from '@/components/features/CentralAnimation';
import Image from 'next/image';

interface MatchedEvent {
  id: string;
  artistName: string;
  venue: string;
  date: string;
  time?: string;
  location: string;
  city: string;
  country?: string;
  vibeMatch?: number;
  distance?: number;
  imageUrl?: string;
  ticketUrl?: string;
  instagramUrl?: string;
  youtubeUrl?: string;
  genres?: string[];
  isStyleMatch?: boolean;
}

interface UserLocation {
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
}

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [topMatch, setTopMatch] = useState<MatchedEvent | null>(null);
  const [upcomingGigs, setUpcomingGigs] = useState<MatchedEvent[]>([]);
  const [allMatches, setAllMatches] = useState<MatchedEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [topVibes, setTopVibes] = useState<string[]>([]);

  // Get user's geolocation on mount
  useEffect(() => {
    console.log('🚀 GigFinder v2.1 - Geolocation Fix Active');
    if (session) {
      requestGeolocation();
    }
  }, [session]);

  const requestGeolocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      // Fallback to default location (Kyiv, Ukraine)
      setUserLocation({
        latitude: 50.4501,
        longitude: 30.5234,
        city: 'Kyiv',
        country: 'Ukraine',
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        console.log('[Geolocation] Coordinates obtained:', { latitude, longitude });

        // Reverse geocode to get city name
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            {
              headers: {
                'User-Agent': 'GigFinder/1.0',
              },
            }
          );
          const data = await response.json();

          console.log('[Geolocation] Geocoding result:', data);

          // Try multiple address fields in order of preference
          const city = data.address?.city ||
                      data.address?.town ||
                      data.address?.village ||
                      data.address?.municipality ||
                      data.address?.county ||
                      data.address?.state ||
                      data.address?.region ||
                      'Unknown Location';

          const country = data.address?.country || 'Unknown';

          const location: UserLocation = {
            latitude,
            longitude,
            city,
            country,
          };

          console.log('[Geolocation] 🌍 Raw geocoding data:', data.address);
          console.log('[Geolocation] 📍 Detected city:', city);
          console.log('[Geolocation] 🗺️  Final location:', location);

          // Alert user about detected location for debugging
          console.log(`✅ Location detected: ${city}, ${country} (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
          setUserLocation(location);
          setLocationError(null);
        } catch (error) {
          console.error('[Geolocation] Geocoding error:', error);
          // Use coordinates without city name
          setUserLocation({
            latitude,
            longitude,
            city: 'Your Location',
            country: '',
          });
          setLocationError(null);
        }
      },
      (error) => {
        console.error('[Geolocation] Error:', error);
        setLocationError('Could not get your location. Using default location.');
        // Fallback to default location (Kyiv, Ukraine)
        setUserLocation({
          latitude: 50.4501,
          longitude: 30.5234,
          city: 'Kyiv',
          country: 'Ukraine',
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0, // Don't use cached position - always get fresh location
      }
    );
  };

  // Load personalized data when user location is available
  useEffect(() => {
    if (session && userLocation) {
      loadPersonalizedData();
    }
  }, [session, userLocation]);

  const loadPersonalizedData = async () => {
    if (!userLocation) {
      console.warn('[Dashboard] No user location available');
      return;
    }

    setLoading(true);
    try {
      // Check if we have selected playlists from session storage
      const selectedPlaylists = sessionStorage.getItem('selectedPlaylists');

      let playlistIds: string[] | undefined;

      if (selectedPlaylists) {
        playlistIds = JSON.parse(selectedPlaylists);
        console.log(`[Dashboard] Using ${playlistIds?.length || 0} selected playlists`);
      }

      // Fetch user's matched events from API with geolocation
      const response = await fetch('/api/user/matches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playlistIds,
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
        }),
        cache: 'no-store',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch matches');
      }

      const data = await response.json();

      console.log('[Dashboard] Received data:', {
        topMatch: data.topMatch?.artistName,
        totalEvents: data.allMatches?.length,
        vibeProfile: data.vibeProfile,
      });

      // Set top match
      if (data.topMatch) {
        setTopMatch(data.topMatch);
      }

      // Set upcoming gigs (next 3 matches)
      if (data.upcomingGigs && data.upcomingGigs.length > 0) {
        setUpcomingGigs(data.upcomingGigs);
      }

      // Set all matches (15 nearest events)
      if (data.allMatches && data.allMatches.length > 0) {
        setAllMatches(data.allMatches);
      }

      // Set top vibes
      if (data.vibeProfile && data.vibeProfile.topVibes) {
        setTopVibes(data.vibeProfile.topVibes);
      }

      console.log(`[Dashboard] Loaded ${data.allMatches?.length || 0} global events`);
    } catch (error) {
      console.error('[Dashboard] Error loading data:', error);
      setLocationError(error instanceof Error ? error.message : 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleImportPlaylist = () => {
    if (!session) {
      router.push('/profile');
      return;
    }
    router.push('/playlists');
  };

  const handlePhotoScan = () => {
    router.push('/camera');
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const formatDistance = (distanceKm?: number) => {
    if (!distanceKm) return null;
    return distanceKm < 1
      ? `${Math.round(distanceKm * 1000)}m`
      : `${Math.round(distanceKm)}km`;
  };

  // Guest View (Not Logged In)
  if (!session && status !== 'loading') {
    return (
      <div className="min-h-screen px-6 pt-12">
        <Header />
        <CentralAnimation />

        <div className="max-w-lg mx-auto space-y-4 mt-12">
          <Card
            variant="purple"
            icon={<Music className="w-6 h-6" />}
            title="Import Playlist"
            description="Paste a link to analyze music"
            onClick={handleImportPlaylist}
          />

          <Card
            variant="orange"
            icon={<Camera className="w-6 h-6" />}
            title="Photo Scan"
            description="Scan any poster or screenshot"
            onClick={handlePhotoScan}
          />
        </div>

        <div className="max-w-lg mx-auto mt-8 p-4 bg-purple-50 rounded-xl border border-purple-100">
          <p className="text-sm text-gray-600 text-center">
            <span className="font-semibold text-brand-purple">Tip:</span> Sign in with Google to discover global events
          </p>
        </div>
      </div>
    );
  }

  // Loading State
  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen px-6 pt-12 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-purple border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">
            {!userLocation
              ? 'Getting your location...'
              : 'Finding events near you...'}
          </p>
        </div>
      </div>
    );
  }

  // Location Error State
  if (locationError && !userLocation) {
    return (
      <div className="min-h-screen px-6 pt-12 flex items-center justify-center">
        <div className="text-center max-w-md">
          <MapPin className="w-16 h-16 text-brand-orange mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Location Access Required
          </h2>
          <p className="text-gray-600 mb-6">
            We need your location to find events near you. Please enable location
            access in your browser settings.
          </p>
          <button
            onClick={requestGeolocation}
            className="px-6 py-3 bg-brand-purple text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Authenticated Dashboard View
  return (
    <div className="min-h-screen px-6 pt-12 pb-24">
      <Header />

      {/* User Info with Location */}
      <div className="max-w-lg mx-auto mt-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-brand-purple to-brand-orange rounded-full flex items-center justify-center">
            <span className="text-lg text-white font-bold">
              {session?.user?.name?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <div>
            <h2 className="font-semibold text-[#2D2D2D]">{session?.user?.name || 'User'}</h2>
            <div className="flex items-center gap-1.5 text-sm text-gray-600">
              <MapPin className="w-3 h-3" />
              <span>
                {userLocation?.city || 'Finding location...'}
                {userLocation?.country && `, ${userLocation.country}`}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={() => router.push('/playlists')}
          className="text-brand-purple hover:text-purple-700"
        >
          <Music className="w-5 h-5" />
        </button>
      </div>

      {/* Top Vibes */}
      {topVibes.length > 0 && (
        <div className="max-w-lg mx-auto mt-6">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {topVibes.slice(0, 3).map((vibe, index) => (
              <div
                key={index}
                className="px-3 py-1.5 bg-purple-100 text-brand-purple rounded-full text-xs font-medium whitespace-nowrap"
              >
                {vibe}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Match Section */}
      {topMatch && (
        <div className="max-w-lg mx-auto mt-8">
          <h3 className="text-xl font-bold text-[#2D2D2D] mb-4">
            Nearest Match for You
          </h3>
          <div className="relative rounded-3xl overflow-hidden h-72 group">
            <Image
              src={
                topMatch.imageUrl ||
                'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800'
              }
              alt={topMatch.artistName}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

            {/* Vibe Match Badge */}
            <div className="absolute top-4 right-4 bg-brand-orange text-white px-3 py-1.5 rounded-full text-sm font-semibold">
              {topMatch.vibeMatch || 0}%{' '}
              {topMatch.isStyleMatch ? 'Similar Vibe' : 'Your Vibe'}
            </div>

            {/* Distance Badge */}
            {topMatch.distance !== undefined && (
              <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-medium">
                <MapPin className="w-3 h-3 inline mr-1" />
                {formatDistance(topMatch.distance)} away
              </div>
            )}

            {/* Artist Info */}
            <div className="absolute bottom-4 left-4 right-4">
              <h4 className="text-3xl font-bold text-white mb-1">
                {topMatch.artistName}
              </h4>
              <div className="flex items-center gap-2 text-white/90 text-sm mb-1">
                <span>{topMatch.venue}</span>
              </div>
              <div className="flex items-center gap-2 text-white/80 text-sm mb-3">
                <span>{topMatch.city}</span>
                {topMatch.country && <span>• {topMatch.country}</span>}
                <span>• {formatDate(topMatch.date)}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 flex-wrap">
                {topMatch.ticketUrl && (
                  <a
                    href={topMatch.ticketUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-brand-orange hover:bg-orange-600 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Get Tickets
                  </a>
                )}
                {topMatch.youtubeUrl && (
                  <a
                    href={topMatch.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
                  >
                    <Youtube className="w-4 h-4" />
                  </a>
                )}
                {topMatch.instagramUrl && (
                  <a
                    href={topMatch.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
                  >
                    <Instagram className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upcoming Gigs Section - Next 3 Nearest */}
      {upcomingGigs.length > 0 && (
        <div className="max-w-lg mx-auto mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-[#2D2D2D]">More Near You</h3>
            <button
              onClick={() => router.push('/events')}
              className="text-brand-purple hover:text-purple-700 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 scrollbar-hide">
            {upcomingGigs.map((gig) => (
              <a
                key={gig.id}
                href={gig.ticketUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 w-44 group cursor-pointer"
              >
                <div className="relative rounded-2xl overflow-hidden h-56 mb-2">
                  <Image
                    src={
                      gig.imageUrl ||
                      'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=400'
                    }
                    alt={gig.artistName}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

                  {/* Vibe Match Badge */}
                  <div className="absolute top-2 right-2 bg-brand-orange text-white px-2 py-1 rounded-full text-xs font-semibold">
                    {gig.vibeMatch || 0}%{' '}
                    {gig.isStyleMatch && <span className="text-[10px]">Vibe</span>}
                  </div>

                  {/* Distance Badge */}
                  {gig.distance !== undefined && (
                    <div className="absolute top-2 left-2 bg-white/20 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs">
                      {formatDistance(gig.distance)}
                    </div>
                  )}

                  {/* Artist Name at Bottom */}
                  <div className="absolute bottom-2 left-2 right-2">
                    <h4 className="font-semibold text-sm text-white truncate">
                      {gig.artistName}
                    </h4>
                    <p className="text-xs text-white/80">{gig.city}</p>
                  </div>
                </div>

                <p className="text-xs text-gray-600">{formatDate(gig.date)}</p>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* All Events - Show remaining events in a grid */}
      {allMatches.length > 4 && (
        <div className="max-w-lg mx-auto mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-[#2D2D2D]">
              All Global Matches ({allMatches.length})
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {allMatches.slice(4).map((event) => (
              <a
                key={event.id}
                href={event.ticketUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group cursor-pointer"
              >
                <div className="relative rounded-2xl overflow-hidden h-40 mb-2">
                  <Image
                    src={
                      event.imageUrl ||
                      'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=400'
                    }
                    alt={event.artistName}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

                  {/* Vibe Badge */}
                  <div className="absolute top-2 right-2 bg-brand-purple text-white px-2 py-1 rounded-full text-xs font-semibold">
                    {event.vibeMatch || 0}%{' '}
                    {event.isStyleMatch && <span className="text-[10px]">Vibe</span>}
                  </div>

                  {/* Artist Name */}
                  <div className="absolute bottom-2 left-2 right-2">
                    <h4 className="font-semibold text-xs text-white truncate">
                      {event.artistName}
                    </h4>
                    <p className="text-xs text-white/70 truncate">
                      {event.city}
                      {event.distance !== undefined &&
                        ` • ${formatDistance(event.distance)}`}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-gray-600">{formatDate(event.date)}</p>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Quick Action Button */}
      <div className="max-w-lg mx-auto mt-8">
        <button
          onClick={() => {
            sessionStorage.removeItem('selectedPlaylists');
            router.push('/playlists');
          }}
          className="w-full py-4 bg-brand-purple hover:bg-purple-700 text-white rounded-2xl font-semibold flex items-center justify-center gap-2 transition-colors"
        >
          <Music className="w-5 h-5" />
          Refresh My Matches
        </button>
      </div>
    </div>
  );
}
