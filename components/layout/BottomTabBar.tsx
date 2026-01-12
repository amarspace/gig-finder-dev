'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Music, Camera, User } from 'lucide-react';

const tabs = [
  { name: 'Music', href: '/', icon: Music },
  { name: 'Camera', href: '/camera', icon: Camera },
  { name: 'Profile', href: '/profile', icon: User },
];

export default function BottomTabBar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="tab-bar">
      <div className="max-w-lg mx-auto flex justify-around items-center h-16">
        {tabs.map((tab) => {
          const active = isActive(tab.href);
          const Icon = tab.icon;

          return (
            <Link
              key={tab.name}
              href={tab.href}
              className="flex flex-col items-center justify-center flex-1 h-full relative"
            >
              <div
                className={`flex flex-col items-center justify-center px-6 py-2 rounded-xl transition-all duration-200 ${
                  active ? 'bg-blue-50' : ''
                }`}
              >
                <div
                  className={`${
                    active
                      ? 'border-2 border-blue-500 rounded-lg p-1.5'
                      : 'p-1.5'
                  }`}
                >
                  <Icon
                    className={`w-6 h-6 ${
                      active ? 'text-blue-500' : 'text-gray-400'
                    }`}
                  />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
