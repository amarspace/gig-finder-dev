# GIGFINDER - Setup Guide

## Prerequisites

- Node.js 18+ and npm
- Google Cloud Console account
- GitHub account (for deployment)

## Step 1: Clone and Install

```bash
# Navigate to project directory
cd gig-finder-dev

# Install dependencies
npm install
```

## Step 2: Google Cloud Configuration

### Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable APIs:
   - Go to **APIs & Services** → **Library**
   - Search and enable **YouTube Data API v3**
   - Enable **Google+ API** (for profile info)

4. Create OAuth 2.0 Credentials:
   - Go to **APIs & Services** → **Credentials**
   - Click **Create Credentials** → **OAuth client ID**
   - Application type: **Web application**
   - Name: `Gig Finder`
   - Authorized JavaScript origins:
     - `http://localhost:3000`
     - `https://your-domain.vercel.app` (add after deployment)
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google`
     - `https://your-domain.vercel.app/api/auth/callback/google` (add after deployment)
   - Click **Create**
   - Copy **Client ID** and **Client Secret**

### Configure OAuth Consent Screen

1. Go to **OAuth consent screen**
2. Choose **External** (for testing with any Google account)
3. Fill in required fields:
   - App name: `Gig Finder`
   - User support email: Your email
   - Developer contact: Your email
4. Add scopes:
   - `openid`
   - `email`
   - `profile`
   - `https://www.googleapis.com/auth/youtube.readonly`
5. Add test users (your Google account email)
6. Save and continue

## Step 3: Environment Variables

1. Copy the example file:
```bash
cp .env.local.example .env.local
```

2. Edit `.env.local` with your credentials:

```bash
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<generate-secret-below>

# Google OAuth
GOOGLE_CLIENT_ID=<your-client-id>.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=<your-client-secret>
```

3. Generate `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

## Step 4: Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Step 5: Test the Application

### Test Authentication

1. Go to **Profile** tab (person icon)
2. Click **Continue with Google**
3. Sign in with your Google account
4. Grant permissions for YouTube Data API access
5. You should be redirected back and see your profile

### Test Playlist Analysis

1. After signing in, click **Analyze My Playlists**
2. Select playlists from your YouTube Music library
3. Click **Analyze** button
4. Wait for artist extraction and event matching
5. View results in the modal

### Test Geolocation

- When analyzing playlists, the app will request location permission
- Grant permission to auto-detect your city
- Events will be filtered for your location

## Troubleshooting

### "Access blocked: This app's request is invalid"

- Make sure you added your email to **Test users** in OAuth consent screen
- Verify redirect URIs match exactly (no trailing slashes)

### "Failed to fetch playlists"

- Check that YouTube Data API v3 is enabled
- Verify the OAuth scope includes `youtube.readonly`
- Make sure you're signed in with an account that has YouTube playlists

### "Unauthorized" errors

- Regenerate `NEXTAUTH_SECRET` and restart dev server
- Clear browser cookies and sign in again
- Check that `NEXTAUTH_URL` matches your current environment

### Scrapers not finding events

- The scrapers use CSS selectors that may change if websites update
- Check browser console for errors
- Verify the websites are accessible (not blocked by firewall)

## Deployment to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/gig-finder.git
git push -u origin main
```

### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Add environment variables in Vercel dashboard:
   - `NEXTAUTH_URL` = `https://your-domain.vercel.app`
   - `NEXTAUTH_SECRET` = (same as local)
   - `GOOGLE_CLIENT_ID` = (same as local)
   - `GOOGLE_CLIENT_SECRET` = (same as local)
4. Deploy

### 3. Update Google OAuth

1. Go back to Google Cloud Console → Credentials
2. Edit your OAuth client ID
3. Add production URLs:
   - **Authorized JavaScript origins**: `https://your-domain.vercel.app`
   - **Authorized redirect URIs**: `https://your-domain.vercel.app/api/auth/callback/google`
4. Save

## API Usage Limits

### YouTube Data API

- **Free quota**: 10,000 units/day
- **Playlist fetch**: ~1-3 units per request
- **Playlist items**: ~1 unit per 50 items

### Rate Limiting Best Practices

- The app fetches playlists in batches of 5
- Add delays between scraper requests (1 second)
- Consider caching playlist data for repeat users

## Development Tips

### Mock Data for Testing

If you don't have YouTube playlists or want to test without API calls:

1. Comment out the API calls in `lib/youtube.ts`
2. Return mock data for testing

### Testing Scrapers Locally

The scrapers are in `lib/scrapers/`. To test individually:

```typescript
import { scrapeConcertUa } from '@/lib/scrapers/concert-ua';

const events = await scrapeConcertUa(['Arctic Monkeys'], 'Kyiv');
console.log(events);
```

### Debugging NextAuth

Add to `.env.local`:
```bash
NEXTAUTH_DEBUG=true
```

Check logs in terminal for detailed auth flow info.

## Project Structure

```
gig-finder-dev/
├── app/                          # Next.js App Router
│   ├── api/
│   │   ├── auth/[...nextauth]/   # NextAuth Google OAuth
│   │   ├── playlists/            # YouTube playlist fetching
│   │   ├── artists/extract/      # Artist extraction from playlists
│   │   └── events/search/        # Event aggregation from scrapers
│   ├── page.tsx                  # Home dashboard
│   ├── playlists/page.tsx        # Playlist selector
│   ├── camera/page.tsx           # Camera placeholder
│   └── profile/page.tsx          # Login/profile
├── components/
│   ├── ui/                       # Reusable UI components
│   ├── layout/                   # Layout components (Header, TabBar)
│   └── features/                 # Feature components
├── lib/
│   ├── youtube.ts                # YouTube API service
│   ├── extractArtists.ts         # Artist extraction logic
│   └── scrapers/                 # Web scrapers (Concert.ua, Kontramarka, Karabas)
├── types/                        # TypeScript type definitions
└── vercel.json                   # Vercel deployment config
```

## Next Steps

After successful setup:

1. ✅ Test authentication flow
2. ✅ Verify playlist fetching works
3. ✅ Test artist extraction logic
4. ⏳ Fine-tune scraper selectors for production websites
5. ⏳ Add error handling and loading states
6. ⏳ Optimize for Vercel serverless timeouts
7. ⏳ Add analytics (optional)

## Support

For issues or questions:
- Check `PLAN.md` for detailed architecture
- Review `README.md` for feature overview
- Check browser console and server logs for errors

---

**Beta Version** - Last updated: 2026-01-11
