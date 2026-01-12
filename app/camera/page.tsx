'use client';

import React from 'react';
import Header from '@/components/layout/Header';
import { Camera, RefreshCw } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function CameraPage() {
  return (
    <div className="min-h-screen">
      <div className="px-6 pt-12">
        <Header />
      </div>

      {/* Camera view with yellow tint overlay */}
      <div className="relative w-full h-[60vh] bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center">
        {/* Permission error state card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-sm mx-4">
          <h3 className="text-lg font-semibold text-[#2D2D2D] mb-2">
            Camera unavailable
          </h3>
          <p className="text-sm text-gray-600 mb-6">Permission denied</p>

          <Button variant="orange" className="flex items-center gap-2 mx-auto">
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
        </div>

        {/* Placeholder for actual camera view */}
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          <Camera className="w-32 h-32 text-gray-400" />
        </div>
      </div>

      <div className="px-6 mt-8">
        <div className="max-w-lg mx-auto">
          <p className="text-center text-sm text-gray-500">
            <span className="font-semibold">Beta Feature:</span> Scanning functionality coming soon.
            Point your camera at concert posters or event screenshots to discover artists.
          </p>
        </div>
      </div>
    </div>
  );
}
