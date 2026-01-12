# Authentication Debugging Guide

## Changes Made

I've added comprehensive logging to identify the authentication loop issue:

### 1. Enhanced JWT Callback Logging (`app/api/auth/[...nextauth]/route.ts`)
- Logs every JWT callback invocation
- Shows refresh token status during initial sign-in
- Warns if Google doesn't provide refresh token
- Checks for refresh token before attempting refresh

### 2. Detailed Token Validation (`app/api/playlists/route.ts`)
- Shows token preview and expiry time
- Logs specific YouTube API errors
- Skips validation for freshly issued tokens (< 2 minutes old)
- Prevents race conditions

## Next Steps

1. **Restart Development Server**
   ```bash
   # Stop the current server (Ctrl+C)
   npm run dev
   ```

2. **Clear Browser State**
   - Open DevTools (F12)
   - Go to Application > Storage > Clear site data
   - Or use Incognito/Private window

3. **Sign In Fresh**
   - Click "Sign in with Google"
   - Grant all permissions on consent screen
   - Watch the terminal console for logs

## What to Look For in Console Logs

### ✅ Success Case (what we want to see):
```
[NextAuth] ✓ Initial sign in - storing tokens
[NextAuth] Account data: { hasAccessToken: true, hasRefreshToken: true, ... }
[NextAuth JWT] Callback invoked: { hasRefreshToken: true, tokenError: undefined }
[API /playlists] ✓ Token is freshly issued, skipping validation
[API /playlists] ✓ Successfully fetched X playlists
```

### ❌ Failure Case (what indicates the problem):
```
[NextAuth] ⚠️  WARNING: No refresh token received from Google!
[NextAuth] Account data: { hasAccessToken: true, hasRefreshToken: false, ... }
```
**Fix**: Need to revoke app access in Google account settings and re-authenticate

```
[NextAuth] ✗ Cannot refresh - no refresh token available
```
**Fix**: Same as above - need to revoke and re-authenticate

```
[Token Validation] ✗ YouTube API returned error: { status: 401, error: {...} }
```
**Fix**: Token is invalid - check if Google OAuth credentials are correct

## Common Issues & Solutions

### Issue 1: No Refresh Token Received
**Cause**: User already granted consent previously, Google won't ask again
**Solution**:
1. Go to https://myaccount.google.com/permissions
2. Find "Gig Finder" app and remove access
3. Sign in again - this will trigger consent screen
4. Refresh token should now be provided

### Issue 2: Token Expires Too Quickly
**Cause**: Google access tokens expire in 1 hour
**Solution**: Refresh token rotation should handle this automatically (already implemented)

### Issue 3: Session Lost on Page Refresh
**Cause**: NextAuth session cookie not persisting
**Solution**: Check NEXTAUTH_SECRET and NEXTAUTH_URL in .env.local

## Debugging Checklist

- [ ] Restart dev server
- [ ] Clear browser cache/use incognito
- [ ] Revoke app access in Google account
- [ ] Sign in fresh and watch console logs
- [ ] Copy all console logs and share them

## Expected Behavior After Fix

1. Sign in → See success logs with refresh token
2. Playlists load successfully
3. Page refresh → Token still valid, playlists reload
4. After 55 minutes → Token auto-refreshes
5. No authentication popups or loops
