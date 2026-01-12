'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Header from '@/components/layout/Header';
import PlaylistSelector from '@/components/features/PlaylistSelector';

export default function PlaylistsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [analyzing, setAnalyzing] = useState(false);

  // Check for token refresh errors and redirect to login
  useEffect(() => {
    if (session?.error === 'RefreshAccessTokenError') {
      console.error('[Playlists] Token refresh failed - signing out');
      alert('Your session has expired. Please sign in again.');
      signOut({ callbackUrl: '/profile' });
    }
  }, [session]);

  const handleAnalyze = async (selectedPlaylistIds: string[]) => {
    try {
      setAnalyzing(true);

      // Get user location
      const location = await getUserLocation();

      // Trigger analysis and navigate directly to dashboard
      // The dashboard will call /api/user/matches with the selected playlists
      // Store selected playlist IDs in sessionStorage for the dashboard to use
      sessionStorage.setItem('selectedPlaylists', JSON.stringify(selectedPlaylistIds));
      sessionStorage.setItem('userLocation', JSON.stringify(location));
      sessionStorage.setItem('analysisTriggered', 'true');

      // Navigate to dashboard
      router.push('/');
    } catch (error) {
      console.error('Error during analysis:', error);
      alert('Failed to analyze playlists. Please try again.');
      setAnalyzing(false);
    }
  };

  const getUserLocation = async (): Promise<{ city: string; latitude: number; longitude: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        // Fallback to default location (Kyiv)
        resolve({ city: 'Kyiv', latitude: 50.4501, longitude: 30.5234 });
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          // Reverse geocode to get city name
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
            );
            const data = await response.json();
            const city = data.address?.city || data.address?.town || 'Kyiv';

            resolve({ city, latitude, longitude });
          } catch (error) {
            console.error('Geocoding error:', error);
            resolve({ city: 'Kyiv', latitude, longitude });
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          // Fallback to default location
          resolve({ city: 'Kyiv', latitude: 50.4501, longitude: 30.5234 });
        }
      );
    });
  };

  return (
    <div className="min-h-screen px-6 pt-12">
      <Header />

      <div className="max-w-lg mx-auto mt-8">
        <PlaylistSelector onAnalyze={handleAnalyze} loading={analyzing} />
      </div>
    </div>
  );
}
