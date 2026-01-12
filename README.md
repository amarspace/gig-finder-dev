# GIGFINDER - Your Personal Gig

Beta application for matching your music taste (from selected playlists) with local live events.

## Phase 1: Theme Configuration & Dashboard UI ✅

### Completed Features

#### Theme & Styling
- ✅ Tailwind CSS configured with brand colors:
  - Primary Orange: `#FF822E`
  - Purple Accent: `#8B5CF6`
  - Custom background, border colors, and animations
- ✅ Global CSS with reusable component classes
- ✅ Mobile-first responsive design
- ✅ Custom animations (pulse, float, spin)

#### UI Components
- ✅ **Button Component** - 4 variants (orange, purple, dark, light)
- ✅ **Card Component** - Action cards with purple/orange variants
- ✅ **Modal Component** - Animated modal with Framer Motion
- ✅ **Header Component** - GIGFINDER branding with tagline
- ✅ **BottomTabBar** - Persistent navigation (Music, Camera, Profile)

#### Pages
- ✅ **Home Dashboard** (`/`)
  - GIGFINDER header
  - Central animation with concentric circles
  - "Import Playlist" card (purple)
  - "Photo Scan" card (orange)
  - Test button for Event Results Modal

- ✅ **Camera Page** (`/camera`)
  - Yellow-tinted camera view
  - Permission error state UI
  - Beta feature notice
  - Placeholder for scanning functionality

- ✅ **Profile Page** (`/profile`)
  - Google OAuth button (dark)
  - Email sign-in button (light)
  - "Why Log In?" feature list
  - Beta authentication notice

#### Features
- ✅ **EventResultsModal Component**
  - Displays matched events in a modal overlay
  - Event cards with artist, venue, date, location
  - Ticket purchase button integration
  - Loading state
  - Empty state
  - Mock data for demonstration
  - Source badge (bandsintown, kontramarka, etc.)

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Package Manager**: npm

## Project Structure

```
gig-finder-dev/
├── app/
│   ├── layout.tsx           # Root layout with bottom tab bar
│   ├── page.tsx             # Home dashboard
│   ├── camera/page.tsx      # Camera/scanner page
│   ├── profile/page.tsx     # Profile/login page
│   └── globals.css          # Global styles + Tailwind
├── components/
│   ├── ui/
│   │   ├── Button.tsx       # Reusable button component
│   │   ├── Card.tsx         # Action card component
│   │   └── Modal.tsx        # Modal overlay component
│   ├── layout/
│   │   ├── Header.tsx       # GIGFINDER branding header
│   │   └── BottomTabBar.tsx # Persistent navigation
│   └── features/
│       ├── CentralAnimation.tsx     # Dashboard animation
│       └── EventResultsModal.tsx    # Event results modal
├── tailwind.config.ts       # Tailwind configuration
├── vercel.json              # Vercel deployment config
├── PLAN.md                  # Detailed implementation plan
└── CLAUDE.md                # Development guide

```

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Build for Production

```bash
npm run build
npm start
```

## User Requirements (Approved)

1. ✅ **Purple Shade**: Using `#8B5CF6`
2. ⏳ **YouTube Integration**: HIGH PRIORITY - to be implemented in next phase
3. ✅ **Camera OCR**: Placeholder UI with 'Scanning...' animation (no processing)
4. ✅ **Event Results**: Display in Modal overlay
5. ⏳ **User Location**: Auto-detect location - to be implemented in next phase
6. ✅ **Playlist Analysis**: No limits on tracks (designed for all tracks)

## Design Specifications

All UI matches the provided high-fidelity templates:

- **Home Dashboard**: Central animation, Import/Scan cards
- **Profile Page**: OAuth buttons, feature list with orange bullets
- **Camera Page**: Yellow tint overlay, permission error state
- **Bottom Tabs**: Blue outline for active state
- **Colors**: Exact match to brand guidelines

## Next Steps (Phase 2 - Core Logic)

### Authentication
- [ ] NextAuth setup
- [ ] Spotify OAuth integration
- [ ] YouTube OAuth integration
- [ ] Session management

### Playlist Logic
- [ ] Spotify API client
- [ ] YouTube API client
- [ ] Fetch ALL playlists endpoint
- [ ] Playlist selector UI with checkboxes
- [ ] Manual playlist selection

### Artist Extraction
- [ ] Extract artists from selected playlists
- [ ] Deduplicate artist list
- [ ] Handle pagination for large libraries
- [ ] Optimize for Vercel serverless timeout

### Event Aggregation
- [ ] Bandsintown API integration
- [ ] Web scraper: Kontramarka
- [ ] Web scraper: Concert.ua
- [ ] Web scraper: Karabas
- [ ] Event matching algorithm
- [ ] Geolocation auto-detect

## Environment Variables

Copy `.env.local.example` to `.env.local` and fill in:

```bash
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=

# Spotify
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=

# YouTube
YOUTUBE_API_KEY=
YOUTUBE_CLIENT_ID=
YOUTUBE_CLIENT_SECRET=

# Bandsintown
BANDSINTOWN_API_KEY=

# Google Geolocation
GOOGLE_GEOLOCATION_API_KEY=
```

## Deployment

Ready for Vercel deployment:

```bash
vercel
```

The `vercel.json` file configures:
- API route timeouts (10s max)
- CORS headers
- Serverless function optimization

## Contributing

This is a beta project. See `PLAN.md` for detailed implementation roadmap.

## License

Private - Beta Development
