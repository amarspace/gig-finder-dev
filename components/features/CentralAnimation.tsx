'use client';

import React from 'react';
import { Music, Radio } from 'lucide-react';

export default function CentralAnimation() {
  return (
    <div className="relative flex items-center justify-center w-full h-64 my-12">
      {/* Outer ring - large light purple */}
      <div className="absolute w-80 h-80 rounded-full bg-gradient-to-br from-purple-100/40 to-orange-100/40 pulse-ring"
           style={{ animationDelay: '0s' }} />

      {/* Middle ring - medium light purple/orange */}
      <div className="absolute w-64 h-64 rounded-full bg-gradient-to-br from-purple-100/60 to-orange-100/60 pulse-ring"
           style={{ animationDelay: '0.5s' }} />

      {/* Inner ring - smaller light purple/orange */}
      <div className="absolute w-48 h-48 rounded-full bg-gradient-to-br from-purple-100/80 to-orange-100/80 pulse-ring"
           style={{ animationDelay: '1s' }} />

      {/* Center circle - orange with music icon */}
      <div className="relative z-10 w-24 h-24 rounded-full bg-brand-orange shadow-lg flex items-center justify-center">
        <Music className="w-10 h-10 text-white" />
      </div>

      {/* Floating icon - top left (purple music note) */}
      <div className="absolute top-12 left-1/4 z-10 float-icon" style={{ animationDelay: '0s' }}>
        <div className="w-14 h-14 rounded-full bg-purple-100 border-2 border-white shadow-md flex items-center justify-center">
          <Music className="w-6 h-6 text-brand-purple" />
        </div>
      </div>

      {/* Floating icon - top right (orange radio) */}
      <div className="absolute top-12 right-1/4 z-10 float-icon" style={{ animationDelay: '1s' }}>
        <div className="w-12 h-12 rounded-full bg-orange-100 border-2 border-white shadow-md flex items-center justify-center">
          <Radio className="w-5 h-5 text-brand-orange" />
        </div>
      </div>
    </div>
  );
}
