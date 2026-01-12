# Testing Steps - Playlist Fetch Debug

## Changes Made

I've added comprehensive logging to both client and server sides to diagnose why the playlist fetch is failing:

### Client-Side Logging (`components/features/PlaylistSelector.tsx`):
- Logs when fetch starts
- Logs the API endpoint being called
- Logs response status
- Logs error details with stack trace
- Logs successful playlist count

### Server-Side Logging (`app/api/playlists/route.ts`):
- Logs every request received
- Logs session validation details
- Logs token validation process
- Logs YouTube API errors

## How to Test

1. **Restart Development Server** (if not already running):
   ```bash
   npm run dev
   ```

2. **Open Browser Console**:
   - Open DevTools (F12 or Cmd+Option+I)
   - Go to Console tab
   - Keep both browser console AND terminal visible

3. **Navigate to Playlists Page**:
   - Go to http://localhost:3000/playlists
   - OR click the Music icon in the bottom tab bar (which goes to homepage)
   - Then navigate to /playlists URL manually

4. **Watch Both Consoles**:

   **Browser Console should show:**
   ```
   [PlaylistSelector] Starting playlist fetch...
   [PlaylistSelector] Fetching from: /api/playlists?t=1234567890
   [PlaylistSelector] Response status: 200 OK
   [PlaylistSelector] Successfully fetched X playlists
   ```

   **Terminal should show:**
   ```
   [API /playlists] ========== NEW REQUEST ==========
   [API /playlists] Request received at: 2026-01-12T...
   [API /playlists] Session check: { hasSession: true, hasAccessToken: true, hasError: false }
   [API /playlists] Validating access token...
   [API /playlists] Token preview: ya29.a0AeDClZD3pK8...
   [API /playlists] Session expires at: 2026-01-12T12:24:12.000Z
   [API /playlists] ✓ Token is freshly issued, skipping validation
   [API /playlists] ✓ Token validated successfully
   [API /playlists] Fetching playlists from YouTube...
   [API /playlists] ✓ Successfully fetched X playlists
   ```

## Expected Scenarios

### ✅ Success Case:
- Browser shows playlist list
- Terminal shows all ✓ checkmarks
- No errors in either console

### ❌ Failure Case 1 - Request Never Reaches Server:
**Browser Console:**
```
[PlaylistSelector] Starting playlist fetch...
[PlaylistSelector] ✗ Error fetching playlists: Failed to fetch
```

**Terminal:** No [API /playlists] logs at all

**Diagnosis:** Network error or CORS issue
**Fix:** Check if dev server is running, check browser network tab

### ❌ Failure Case 2 - Auth Error:
**Browser Console:**
```
[PlaylistSelector] API error response: { error: 'TokenInvalid', message: '...' }
```

**Terminal:**
```
[Token Validation] ✗ YouTube API returned error: { status: 401, ... }
```

**Diagnosis:** Token is invalid or expired
**Fix:** Need to revoke app access and re-authenticate

### ❌ Failure Case 3 - No Session:
**Browser Console:**
```
[PlaylistSelector] Response status: 401 Unauthorized
[PlaylistSelector] API error response: { error: 'AuthRequired' }
```

**Terminal:**
```
[API /playlists] Session check: { hasSession: false, hasAccessToken: false }
```

**Diagnosis:** User not authenticated
**Fix:** Sign in again

## Next Steps After Testing

1. **Copy ALL console logs** from both browser and terminal
2. **Share the complete logs** so I can see exactly what's failing
3. **Take a screenshot** if helpful

The logs will tell us:
- Is the request reaching the server?
- Is the session valid?
- Is the token valid?
- What specific error is YouTube API returning?

This will allow me to implement the exact fix needed.
