# GIGFINDER - Development Guide

## Project Overview
Gig Finder is a beta application that matches users' music taste (from selected playlists) with local live events. Built with Next.js (App Router), TypeScript, and Tailwind CSS.

## Brand Identity
- **Primary Color**: Orange (#FF822E)
- **Secondary Color**: Purple (specific shade TBD based on templates)
- **Typography**: Clean, modern sans-serif
- **Design System**: Mobile-first, high-fidelity UI templates as source of truth

## Technology Stack
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: OAuth 2.0 (Spotify & YouTube Data API)
- **Deployment**: Vercel

## Architecture

### Core Features
1. **Music Integration**
   - Spotify OAuth integration
   - YouTube Data API integration
   - Fetch ALL playlists from user library
   - Manual playlist selection interface
   - Artist extraction from selected playlists

2. **Event Aggregation**
   - Bandsintown API integration
   - Web scraping for:
     - Kontramarka
     - Concert.ua
     - Karabas

3. **UI Components**
   - Bottom Tab Bar (Music, Camera, Profile) - persistent layout
   - Home Dashboard with Import & Scan buttons
   - Playlist Selector with checkbox list
   - Camera/Scanner interface

## API Routes & Serverless Optimization
- All routes optimized for Vercel's serverless timeouts
- Background fetchers for event aggregation
- Efficient data caching strategies

## File Structure
```
gig-finder-dev/
├── app/
│   ├── layout.tsx (root layout with bottom tab bar)
│   ├── page.tsx (home dashboard)
│   ├── music/
│   ├── camera/
│   ├── profile/
│   ├── playlists/
│   └── api/
│       ├── auth/
│       ├── spotify/
│       ├── youtube/
│       └── events/
├── components/
│   ├── ui/
│   ├── layout/
│   └── features/
├── lib/
│   ├── spotify.ts
│   ├── youtube.ts
│   ├── events/
│   └── utils/
├── public/
├── styles/
├── tailwind.config.ts
├── vercel.json
└── PLAN.md
```

## Development Workflow
1. Never write code before plan approval
2. Follow UI templates exactly for styling
3. Mobile-first responsive design
4. Type-safe API integrations
5. Optimize for Vercel serverless constraints

## Color Extraction from Templates
- Primary Orange: #FF822E
- Purple accent: (extract from templates)
- Background: Off-white/cream tones
- Text: Dark gray/black for headers, gray for descriptions
- Borders: Light purple/orange variants
