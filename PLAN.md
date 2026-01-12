# GIGFINDER - Implementation Plan

## Design Analysis from UI Templates

### Color Palette (Extracted from Templates)
- **Primary Orange**: #FF822E
- **Purple Accent**: #8B5CF6 (approximate, for music icons/buttons)
- **Background**: #F5F5F0 (off-white/cream)
- **Text Primary**: #2D2D2D
- **Text Secondary**: #6B7280
- **Border Purple**: #E9D5FF (light purple for cards)
- **Border Orange**: #FFDFC4 (light orange for cards)

### UI Components Identified
1. **Bottom Tab Bar** (3 tabs: Music, Camera, Profile)
   - Active state: Blue outline (#3B82F6)
   - Icons: Music note, Camera, Profile
   - Fixed position at bottom

2. **Home Dashboard**
   - GIGFINDER logo (orange) + tagline
   - Central circular animation (concentric circles with icons)
   - Two action cards:
     - "Import Playlist" (purple border, music icon)
     - "Photo Scan" (orange border, camera icon)

3. **Profile/Login Page**
   - Google OAuth button (dark)
   - Email sign-in button (light)
   - Feature list with orange bullets

4. **Camera Page**
   - Full-screen camera view (yellow tint overlay)
   - Error state card
   - "Try Again" button (orange)

---

## Step 0: Environment Initialization

### 0.1 Next.js Project Setup
**Files to create:**
```
├── package.json
├── tsconfig.json
├── next.config.js
├── .env.local.example
├── .gitignore
```

**Dependencies:**
- next@latest
- react@latest
- react-dom@latest
- typescript
- @types/react
- @types/node
- tailwindcss
- postcss
- autoprefixer
- next-auth (for OAuth)
- axios (for API calls)
- cheerio (for web scraping)
- lucide-react (for icons)

### 0.2 Tailwind Configuration
**Files to create/modify:**
```
├── tailwind.config.ts
├── postcss.config.js
├── app/globals.css
```

**Custom theme extensions:**
```typescript
colors: {
  brand: {
    orange: '#FF822E',
    purple: '#8B5CF6',
  },
  background: '#F5F5F0',
  border: {
    purple: '#E9D5FF',
    orange: '#FFDFC4',
  }
}
```

### 0.3 Project Structure
```
gig-finder-dev/
├── app/
│   ├── layout.tsx                    # Root layout with bottom tab bar
│   ├── page.tsx                      # Home dashboard
│   ├── globals.css                   # Global styles + Tailwind
│   ├── (tabs)/                       # Route group for tabbed pages
│   │   ├── music/
│   │   │   └── page.tsx             # Music tab (home dashboard)
│   │   ├── camera/
│   │   │   └── page.tsx             # Camera/scanner tab
│   │   └── profile/
│   │       └── page.tsx             # Profile/login tab
│   ├── playlists/
│   │   └── page.tsx                 # Playlist selector screen
│   └── api/
│       ├── auth/
│       │   ├── [...nextauth]/
│       │   │   └── route.ts         # NextAuth handler
│       │   ├── spotify/
│       │   │   └── callback/
│       │   │       └── route.ts     # Spotify OAuth callback
│       │   └── youtube/
│       │       └── callback/
│       │           └── route.ts     # YouTube OAuth callback
│       ├── playlists/
│       │   ├── spotify/
│       │   │   └── route.ts         # GET user's Spotify playlists
│       │   └── youtube/
│       │       └── route.ts         # GET user's YouTube playlists
│       ├── artists/
│       │   └── extract/
│       │       └── route.ts         # POST extract artists from playlists
│       └── events/
│           ├── bandsintown/
│           │   └── route.ts         # GET events from Bandsintown
│           ├── kontramarka/
│           │   └── route.ts         # GET events (scraper)
│           ├── concert-ua/
│           │   └── route.ts         # GET events (scraper)
│           └── karabas/
│               └── route.ts         # GET events (scraper)
├── components/
│   ├── layout/
│   │   ├── BottomTabBar.tsx         # Persistent navigation
│   │   └── Header.tsx               # Logo + tagline
│   ├── ui/
│   │   ├── Button.tsx               # Reusable button component
│   │   ├── Card.tsx                 # Action card component
│   │   └── Checkbox.tsx             # Playlist selector checkbox
│   └── features/
│       ├── CentralAnimation.tsx     # Circular animation on home
│       ├── PlaylistList.tsx         # Checkbox list for playlists
│       └── CameraView.tsx           # Camera interface
├── lib/
│   ├── auth/
│   │   ├── spotify.ts               # Spotify OAuth helpers
│   │   └── youtube.ts               # YouTube OAuth helpers
│   ├── api/
│   │   ├── spotify.ts               # Spotify API client
│   │   ├── youtube.ts               # YouTube API client
│   │   └── bandsintown.ts           # Bandsintown API client
│   ├── scrapers/
│   │   ├── base.ts                  # Base scraper class
│   │   ├── kontramarka.ts           # Kontramarka scraper
│   │   ├── concert-ua.ts            # Concert.ua scraper
│   │   └── karabas.ts               # Karabas scraper
│   ├── matching/
│   │   ├── extractArtists.ts        # Artist extraction logic
│   │   └── matchEvents.ts           # Match artists to events
│   └── utils/
│       ├── debounce.ts
│       └── cache.ts                 # Simple caching utility
├── types/
│   ├── playlist.ts
│   ├── artist.ts
│   ├── event.ts
│   └── auth.ts
├── public/
│   └── icons/                       # Custom icons if needed
├── .env.local.example
├── vercel.json
├── CLAUDE.md
└── PLAN.md
```

---

## Step 1: Matching Engine (Core Logic)

### 1.1 Authentication Setup

**Files:**
- `lib/auth/spotify.ts` - Spotify OAuth flow
- `lib/auth/youtube.ts` - YouTube OAuth flow
- `app/api/auth/[...nextauth]/route.ts` - NextAuth configuration
- `types/auth.ts` - TypeScript types

**Logic:**
```typescript
// Spotify OAuth
- Authorization URL with scopes: playlist-read-private, playlist-read-collaborative
- Token exchange and refresh
- Store tokens in NextAuth session

// YouTube OAuth
- Authorization URL with scopes: youtube.readonly
- Token exchange and refresh
- Store tokens in NextAuth session
```

### 1.2 Playlist Fetching Logic

**Files:**
- `lib/api/spotify.ts`
- `lib/api/youtube.ts`
- `app/api/playlists/spotify/route.ts`
- `app/api/playlists/youtube/route.ts`
- `types/playlist.ts`

**Key Requirements:**
- Fetch **ALL** playlists (handle pagination)
- Return playlist metadata: id, name, track_count, cover_image
- Cache results for 5 minutes to avoid repeated API calls
- Handle rate limiting gracefully

**API Response Shape:**
```typescript
interface Playlist {
  id: string;
  name: string;
  trackCount: number;
  coverImage: string;
  source: 'spotify' | 'youtube';
}
```

### 1.3 Artist Extraction

**Files:**
- `lib/matching/extractArtists.ts`
- `app/api/artists/extract/route.ts`
- `types/artist.ts`

**Logic:**
```typescript
// Input: Array of selected playlist IDs
// Process:
// 1. Fetch all tracks from each playlist (handle pagination)
// 2. Extract artist names from each track
// 3. Deduplicate artist list
// 4. Return unique artist names

// Output: string[] (unique artist names)
```

**Optimization for Vercel:**
- Process playlists in batches
- Implement timeout handling (max 10s per request)
- Store intermediate results
- Support resumable extraction for large libraries

### 1.4 Event Aggregation

**Files:**
- `lib/api/bandsintown.ts`
- `lib/scrapers/base.ts`
- `lib/scrapers/kontramarka.ts`
- `lib/scrapers/concert-ua.ts`
- `lib/scrapers/karabas.ts`
- `app/api/events/*/route.ts`
- `types/event.ts`

**Event Data Structure:**
```typescript
interface Event {
  id: string;
  artistName: string;
  venue: string;
  date: string;
  time?: string;
  location: string;
  ticketUrl?: string;
  source: 'bandsintown' | 'kontramarka' | 'concert-ua' | 'karabas';
}
```

**Bandsintown API:**
- Endpoint: `/artists/{artist}/events`
- Query by artist name
- Filter by location/date range

**Web Scraping Skeleton:**
```typescript
// Base scraper class with:
// - fetch() method with timeout
// - parseHTML() using cheerio
// - extractEvents() method
// - Error handling and retry logic

// Each scraper extends base:
// - Define selectors for event cards
// - Extract: artist, venue, date, location, ticket link
// - Normalize data to Event interface
```

**Vercel Optimization:**
- Set max execution time to 10s per scraper
- Implement background job queue for large artist lists
- Cache event results for 1 hour
- Rate limit scraping requests

---

## Step 2: UI Implementation (Mobile-First)

### 2.1 Bottom Tab Bar (Persistent Layout)

**File:** `components/layout/BottomTabBar.tsx`

**Design Specs from Template:**
- 3 tabs: Music (music note icon), Camera (camera icon), Profile (person icon)
- Active state: Blue outline (#3B82F6) with rounded rectangle
- Inactive state: Gray icons (#6B7280)
- Fixed position: bottom-0, full width
- Background: white with subtle shadow
- Height: ~64px
- Icons: 24x24px

**Implementation:**
```typescript
// Use next/navigation Link components
// Track active tab with pathname
// Render in root layout.tsx
```

### 2.2 Root Layout with Tab Bar

**File:** `app/layout.tsx`

**Structure:**
```tsx
<html>
  <body>
    <main>{children}</main>
    <BottomTabBar />
  </body>
</html>
```

### 2.3 Home Dashboard (Music Tab)

**File:** `app/page.tsx` or `app/(tabs)/music/page.tsx`

**Design Specs from Template:**
- Header: "GIGFINDER" (orange, large) + "YOUR PERSONAL GIG" (gray, small)
- Central animation: Concentric circles with floating icons
  - Main circle: Orange with music note icon
  - Outer circles: Light purple/orange with smaller icons
  - CSS animation: pulse/rotate effect
- Two action cards:
  - Card 1: "Import Playlist" (purple border, purple icon, right arrow)
  - Card 2: "Photo Scan" (orange border, orange icon, right arrow)
- Spacing: Generous padding, centered layout

**Components to create:**
- `components/layout/Header.tsx` - Logo and tagline
- `components/features/CentralAnimation.tsx` - SVG/CSS animation
- `components/ui/Card.tsx` - Reusable action card

### 2.4 Playlist Selector Screen

**File:** `app/playlists/page.tsx`

**Design Specs:**
- Header: Same as home
- List of playlists with checkboxes
- Each item: Checkbox + Playlist cover + Name + Track count
- Select all / Deselect all buttons
- "Continue" button at bottom (disabled until selection)

**Components:**
- `components/features/PlaylistList.tsx`
- `components/ui/Checkbox.tsx`

**Logic:**
- Fetch playlists on mount (from both Spotify & YouTube if connected)
- Track selected playlist IDs in state
- On "Continue": POST to `/api/artists/extract` with selected IDs
- Show loading state during extraction
- Navigate to results page

### 2.5 Profile/Login Page

**File:** `app/(tabs)/profile/page.tsx`

**Design Specs from Template:**
- Header: Same as home
- "Continue with Google" button (dark, Google icon)
- "Sign in with Email" button (light, outlined)
- "Why Log In?" section:
  - Orange bullet points
  - Feature list (4 items)
- Centered layout

**Implementation:**
- NextAuth sign-in buttons
- Handle OAuth redirects
- Show user info when logged in
- Logout button

### 2.6 Camera Page

**File:** `app/(tabs)/camera/page.tsx`

**Design Specs from Template:**
- Full-screen camera view
- Yellow tint overlay (#F3E8B8 with opacity)
- Permission error state:
  - White card with "Camera unavailable" message
  - "Try Again" button (orange)
- Bottom tab bar visible

**Components:**
- `components/features/CameraView.tsx`

**Logic:**
- Request camera permissions
- Display video stream
- Capture photo on button press
- Process image (future: OCR for artist/event extraction)

---

## Step 3: Deployment Readiness

### 3.1 Vercel Configuration

**File:** `vercel.json`

```json
{
  "buildCommand": "next build",
  "devCommand": "next dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 10
    },
    "app/api/events/**/*.ts": {
      "maxDuration": 10
    },
    "app/api/artists/extract/route.ts": {
      "maxDuration": 10
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Credentials", "value": "true" },
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Access-Control-Allow-Methods", "value": "GET,POST,OPTIONS" },
        { "key": "Access-Control-Allow-Headers", "value": "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" }
      ]
    }
  ]
}
```

### 3.2 Environment Variables

**File:** `.env.local.example`

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

# Database (future)
# DATABASE_URL=
```

### 3.3 Optimization Checklist

- [ ] All API routes respect 10s timeout
- [ ] Implement request caching for playlists/events
- [ ] Use ISR (Incremental Static Regeneration) where possible
- [ ] Optimize images (next/image)
- [ ] Code splitting for large libraries
- [ ] Error boundaries for graceful failures
- [ ] Loading states for all async operations
- [ ] Mobile-responsive (test on 375px width minimum)

---

## Implementation Order

### Phase 1: Foundation (Step 0)
1. Initialize Next.js project
2. Configure Tailwind with brand colors
3. Create project structure
4. Set up TypeScript types

### Phase 2: UI Shell (Step 2 - Part 1)
1. Build BottomTabBar component
2. Build Header component
3. Create root layout
4. Build Home Dashboard (static, no data)
5. Build Profile/Login page (static)
6. Build Camera page (static)

### Phase 3: Authentication (Step 1.1)
1. Set up NextAuth
2. Implement Spotify OAuth
3. Implement YouTube OAuth (optional for beta)
4. Test auth flow

### Phase 4: Playlist Logic (Step 1.2 + Step 2.4)
1. Create Spotify API client
2. Build playlist fetch endpoint
3. Build Playlist Selector UI
4. Connect UI to API
5. Test with real Spotify account

### Phase 5: Artist Extraction (Step 1.3)
1. Build artist extraction logic
2. Create extraction API endpoint
3. Optimize for serverless timeout
4. Test with large playlists

### Phase 6: Event Aggregation (Step 1.4)
1. Implement Bandsintown API client
2. Create scraper base class
3. Build individual scrapers (Kontramarka, Concert.ua, Karabas)
4. Create event API endpoints
5. Test event matching

### Phase 7: Deployment (Step 3)
1. Create vercel.json
2. Set up environment variables
3. Deploy to Vercel preview
4. Test all flows in production
5. Optimize based on real metrics

---

## User Requirements (APPROVED - BETA VERSION)

### Core Authentication & Data Source
1. **Authentication**: Google OAuth via NextAuth.js (matches "Continue with Google" button) ✅
2. **YouTube Music Focus**: Primary data source - use YouTube Data API with scope `https://www.googleapis.com/auth/youtube.readonly` ✅
3. **Spotify**: REMOVED for beta - focus on YouTube Music only ✅

### Feature Requirements
4. **Purple shade**: #8B5CF6 for accents, checkboxes, playlist UI ✅
5. **Orange**: #FF822E for primary buttons ✅
6. **Camera feature**: Placeholder UI with 'Scanning...' animation (no OCR processing for beta) ✅
7. **Event matching UI**: Display in Modal (pop-up) over current screen ✅
8. **User location**: Auto-detect using `navigator.geolocation` API for nearby gigs ✅
9. **Playlist limit**: NO LIMITS - analyze all tracks in selected playlists ✅

### Technical Implementation
10. **Library Import**: Fetch ALL playlists using `playlists.list` with `mine=true` ✅
11. **Playlist Selection**: Checkbox UI for manual selection ✅
12. **Artist Extraction**: Parse video titles (playlistItems.list) with regex to extract artist names ✅
13. **Event Scrapers**: Concert.ua, Kontramarka, Karabas using Cheerio ✅

---

## Success Criteria

- [ ] Users can sign in with Spotify
- [ ] Users can view ALL their playlists
- [ ] Users can select multiple playlists
- [ ] System extracts unique artist list
- [ ] System fetches events from Bandsintown
- [ ] System fetches events from Ukrainian sources
- [ ] UI matches provided templates exactly
- [ ] Mobile-responsive (375px+)
- [ ] Deploys to Vercel without errors
- [ ] All routes respect serverless timeouts

---

**Next Step:** Await user approval of this plan before writing any code.
