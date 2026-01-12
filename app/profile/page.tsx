'use client';

import React from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import Header from '@/components/layout/Header';
import Button from '@/components/ui/Button';
import { Chrome, LogOut, Music } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const features = [
    'Save favorite artists and venues',
    'Get personalized recommendations',
    'Sync your YouTube Music playlists',
    'Discover local venues matching your vibe',
  ];

  const handleSignIn = () => {
    signIn('google');
  };

  const handleSignOut = () => {
    signOut();
  };

  const handleStartAnalysis = () => {
    router.push('/playlists');
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen px-6 pt-12 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-purple border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (session) {
    return (
      <div className="min-h-screen px-6 pt-12">
        <Header />

        <div className="max-w-lg mx-auto mt-12">
          <div className="bg-white rounded-2xl border-2 border-brand-purple p-6 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-brand-purple to-brand-orange rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl text-white font-bold">
                {session.user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <h2 className="text-xl font-bold text-[#2D2D2D] mb-1">
              {session.user?.name}
            </h2>
            <p className="text-sm text-gray-600 mb-6">{session.user?.email}</p>

            <div className="space-y-3">
              <Button
                variant="purple"
                onClick={handleStartAnalysis}
                className="w-full flex items-center justify-center gap-3"
              >
                <Music className="w-5 h-5" />
                Analyze My Playlists
              </Button>

              <Button
                variant="light"
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-3"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </Button>
            </div>
          </div>

          <div className="mt-8 p-4 bg-purple-50 rounded-xl border border-purple-100">
            <p className="text-sm text-gray-600 text-center">
              <span className="font-semibold text-brand-purple">Connected:</span> Your YouTube Music account is linked and ready for playlist analysis.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 pt-12">
      <Header />

      <div className="max-w-lg mx-auto mt-12 space-y-4">
        <Button
          variant="dark"
          onClick={handleSignIn}
          className="w-full flex items-center justify-center gap-3"
        >
          <Chrome className="w-5 h-5" />
          Continue with Google
        </Button>
      </div>

      <div className="max-w-lg mx-auto mt-12">
        <h2 className="text-xl font-bold text-[#2D2D2D] mb-4">Why Log In?</h2>
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-orange mt-2 flex-shrink-0" />
              <span className="text-[#2D2D2D]">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="max-w-lg mx-auto mt-12 p-4 bg-purple-50 rounded-xl border border-purple-100">
        <p className="text-sm text-gray-600 text-center">
          <span className="font-semibold text-brand-purple">Beta Notice:</span> Authentication will connect to YouTube Music API for playlist analysis.
        </p>
      </div>
    </div>
  );
}
