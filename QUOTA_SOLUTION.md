# YouTube API Quota Solution

## Problem
YouTube Data API v3 has daily quota limits (10,000 units/day for free tier). You exceeded the quota due to:
1. Token validation calls (1 unit each)
2. Playlist fetching during testing
3. Repeated page refreshes

## Solution Implemented

### 1. Mock Data Mode (For Development)
Added mock playlist data that mimics real YouTube playlists with realistic content:
- 5 mock playlists (Techno/Afrohouse, Deep House, Hip-Hop, EDM, Lo-fi)
- Mock playlist items with artist names that trigger genre detection
- Enables full app testing without consuming quota

### 2. Environment Variable Control
Added `NEXT_PUBLIC_USE_MOCK_YOUTUBE=true` to `.env.local`
- Set to `true`: Uses mock data (current setting)
- Set to `false`: Uses real YouTube API (when quota resets)

### 3. Disabled Token Validation
Removed the pre-flight YouTube API call that validated tokens
- Was using 1 quota unit per playlist page load
- Not necessary since the actual API call will fail if token is invalid

## How to Use

### Testing Now (With Mock Data):
1. **Restart your dev server**: `npm run dev`
2. **Refresh the browser page**
3. **Navigate to /playlists**
4. You should see 5 mock playlists load successfully
5. You can select playlists and test the genre matching engine

### When Quota Resets (Tomorrow):
1. Open `.env.local`
2. Change `NEXT_PUBLIC_USE_MOCK_YOUTUBE=true` to `false`
3. Restart dev server
4. App will use real YouTube API again

## Quota Reset Information
- YouTube API quota resets at **midnight Pacific Time (PST/PDT)**
- Current quota: 10,000 units per day
- Typical usage breakdown:
  - List playlists: 1 unit per request
  - List playlist items: 1 unit per request
  - Search: 100 units per request (expensive!)

## Production Considerations

For production, you'll need to either:

1. **Apply for quota increase**:
   - Go to Google Cloud Console
   - Request quota increase (can get up to 1,000,000 units/day)
   - Justify usage for your application

2. **Implement caching**:
   - Cache playlists in database
   - Only refresh when user explicitly requests
   - Reduce API calls by 90%+

3. **Alternative approach**:
   - Use YouTube Music API (different quota)
   - Use Spotify API instead (different service, different limits)
   - Implement hybrid approach (multiple music services)

## Current Mock Data

The mock playlists contain these artists which will trigger genre detection:
- **Techno/Afrohouse**: Amelie Lens, Black Coffee, Tale Of Us
- **Deep House**: Disclosure, Duke Dumont
- **Hip-Hop**: Kendrick Lamar, J. Cole
- **EDM**: Martin Garrix, Skrillex
- **Lo-fi**: ChilledCow

This ensures your genre-based vibe matching will work correctly during testing!

## Next Steps

1. ✅ Restart dev server
2. ✅ Test playlist loading with mock data
3. ✅ Test genre detection and vibe matching
4. ⏰ Wait for quota reset (midnight PST)
5. 🔄 Switch back to real API when needed
