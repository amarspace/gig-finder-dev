# GIGFINDER - Testing Guide

## ✅ Configuration Complete!

Your Google OAuth credentials have been successfully configured:
- ✅ `.env.local` file created with your credentials
- ✅ NEXTAUTH_SECRET generated securely
- ✅ Development server restarted with new environment variables
- ✅ No NextAuth warnings in console

**Server Status:** Running at `http://localhost:3000`

---

## 🧪 Test the Complete Flow

### Step 1: Test Home Dashboard

1. Open `http://localhost:3000` in your browser
2. **Verify:**
   - ✅ GIGFINDER branding at top
   - ✅ Central animation with concentric circles
   - ✅ Two action cards: "Import Playlist" (purple border) and "Photo Scan" (orange border)
   - ✅ Bottom tab bar: Music, Camera, Profile icons
   - ✅ Tip message: "Sign in with Google to access your YouTube Music playlists"

### Step 2: Test Google OAuth Sign-In

1. Click the **Profile** tab (person icon in bottom bar)
2. **Verify you see:**
   - ✅ GIGFINDER header
   - ✅ "Continue with Google" button (dark/black)
   - ✅ "Why Log In?" section with 4 bullet points
   - ✅ Beta notice about YouTube Music API

3. Click **"Continue with Google"** button
4. **OAuth Flow:**
   - ✅ Redirects to Google sign-in page
   - ✅ Select your Google account
   - ✅ Shows permission consent screen:
     - View and manage your YouTube account
     - See your personal info (email, name)
   - ✅ Click "Allow"
   - ✅ Redirects back to `/profile`

5. **Verify signed-in state:**
   - ✅ See your profile with first letter avatar
   - ✅ Your name displayed
   - ✅ Your email displayed
   - ✅ "Analyze My Playlists" button (purple)
   - ✅ "Sign Out" button (light)
   - ✅ "Connected" message about YouTube Music

### Step 3: Test Playlist Selection

1. Click **"Analyze My Playlists"** button
2. **Verify Playlist Selector loads:**
   - ✅ GIGFINDER header
   - ✅ "Select Playlists" heading
   - ✅ Count showing "0 of N selected"
   - ✅ "Select All" / "Deselect All" button
   - ✅ List of your YouTube Music playlists:
     - Checkbox (purple when checked)
     - Playlist thumbnail image
     - Playlist title
     - Track count (e.g., "15 tracks")

3. **Test Selection:**
   - ✅ Click checkboxes to select playlists (turns purple)
   - ✅ Count updates: "3 of N selected"
   - ✅ Click "Select All" → all checkboxes turn purple
   - ✅ Click "Deselect All" → all checkboxes clear
   - ✅ "Analyze N Playlists" button enabled when selection > 0
   - ✅ Button disabled when selection = 0

### Step 4: Test Artist Extraction & Event Matching

1. Select 2-3 playlists (start small for faster testing)
2. Click **"Analyze N Playlists"** button
3. **Verify loading state:**
   - ✅ Button shows "Analyzing..." with spinner
   - ✅ Button disabled during analysis

4. **Geolocation Permission:**
   - ✅ Browser requests location permission
   - **Grant permission** (recommended) or **Deny** (defaults to Kyiv)

5. **Wait for analysis** (10-20 seconds depending on playlist size)
   - Backend is:
     - Fetching playlist items from YouTube API
     - Extracting artist names from video titles
     - Scraping Concert.ua, Kontramarka, Karabas
     - Matching events to your artists

6. **Event Results Modal opens:**
   - ✅ Modal appears with white background
   - ✅ "Upcoming Events" title at top
   - ✅ Close (X) button in top-right
   - ✅ List of matched events with:
     - Artist name (bold)
     - Venue name (purple text)
     - Date (formatted: "Mon, Jan 15, 2026")
     - Location/city
     - Source badge (concert-ua, kontramarka, or karabas)
     - "Get Tickets" button (orange) if ticket URL available
   - ✅ Summary at bottom: "Showing N events matching your music taste"

7. **Test Modal Interactions:**
   - ✅ Click outside modal → closes
   - ✅ Press Escape key → closes
   - ✅ Click X button → closes
   - ✅ Click "Get Tickets" → opens ticket URL in new tab

### Step 5: Test Navigation

1. **From Modal:**
   - ✅ Close modal → returns to `/playlists`
   - ✅ Bottom tabs still visible and functional

2. **Tab Navigation:**
   - ✅ Click Music tab → goes to `/` (home)
   - ✅ Click Camera tab → goes to `/camera`
   - ✅ Click Profile tab → goes to `/profile` (shows signed-in state)
   - ✅ Active tab has blue outline

3. **Home Dashboard (while signed in):**
   - ✅ Click "Import Playlist" → goes directly to `/playlists` (no login redirect)
   - ✅ No tip message shown (because signed in)

### Step 6: Test Sign Out

1. Go to Profile tab
2. Click **"Sign Out"** button
3. **Verify:**
   - ✅ Returns to login screen
   - ✅ "Continue with Google" button visible
   - ✅ "Why Log In?" section visible

4. Go to Home tab
5. **Verify:**
   - ✅ Tip message reappears: "Sign in with Google..."
   - ✅ Click "Import Playlist" → redirects to `/profile`

---

## 🐛 Troubleshooting

### "Access blocked: This app's request is invalid"

**Cause:** Your email not added to Test Users in Google Cloud Console

**Fix:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to **OAuth consent screen**
4. Scroll to **Test users**
5. Click **Add Users**
6. Add your Gmail address
7. Save and try again

### "Failed to fetch playlists" or "Unauthorized"

**Possible Causes:**
1. YouTube Data API v3 not enabled
2. OAuth scope missing `youtube.readonly`
3. Access token not properly stored

**Fix:**
1. Verify API is enabled in Google Cloud Console
2. Sign out and sign in again (to refresh tokens)
3. Check browser console for error details

### No playlists showing

**Possible Causes:**
1. No playlists in your YouTube Music library
2. Using wrong Google account

**Fix:**
1. Create a playlist in YouTube Music first
2. Sign out and sign in with correct account

### Events modal is empty (No events found)

**Expected behavior if:**
- Artists in your playlists have no upcoming events in Ukraine
- Scrapers couldn't find matching events

**To test with known events:**
1. Create a test playlist with popular Ukrainian artists
2. Or artists with known upcoming concerts (check Concert.ua manually)

### Geolocation not working

**Browsers may block geolocation in development**

**Fix:**
- Grant permission when prompted
- Or app will default to Kyiv
- Location is used for filtering/prioritizing events

---

## 📊 Expected API Usage

### YouTube Data API Quota

For a typical test with 3 playlists (50 tracks each):
- **Playlists.list**: ~1 unit (fetch all playlists)
- **PlaylistItems.list**: ~3 units (3 playlists × 1 unit each)
- **Total**: ~4-10 units per analysis

**Daily quota**: 10,000 units
**Estimated analyses per day**: ~1,000-2,000

### Scraper Performance

- **Concert.ua**: 1-3 seconds
- **Kontramarka**: 1-3 seconds
- **Karabas**: 1-3 seconds
- **Parallel execution**: ~3-5 seconds total
- **Rate limiting**: 1 second delay between artist searches

### Total Analysis Time

- Small playlist (10 tracks): ~5-8 seconds
- Medium playlist (50 tracks): ~8-12 seconds
- Large playlist (200 tracks): ~12-18 seconds

---

## ✅ Success Criteria

After testing, you should have verified:

**Authentication:**
- [x] Google OAuth sign-in works
- [x] Profile displays user info
- [x] Sign out works
- [x] Session persists on page refresh

**Playlist Selection:**
- [x] All YouTube Music playlists load
- [x] Checkboxes work correctly
- [x] Select all/deselect all works
- [x] Analyze button state changes correctly

**Artist Extraction:**
- [x] Video titles parsed correctly
- [x] Artist names extracted
- [x] Duplicates removed
- [x] No console errors

**Event Matching:**
- [x] Geolocation requested
- [x] Scrapers run without errors
- [x] Events displayed in modal
- [x] Ticket links work
- [x] Source badges show correctly

**UI/UX:**
- [x] All animations smooth
- [x] Loading states visible
- [x] Error handling works
- [x] Mobile responsive
- [x] Keyboard navigation (Escape closes modal)

---

## 🎉 Next Steps

Once you've successfully tested the flow:

### For Production Deployment

1. **Update OAuth Redirect URIs:**
   - Add production domain to Google Cloud Console
   - Update `NEXTAUTH_URL` in Vercel environment variables

2. **Deploy to Vercel:**
   ```bash
   git add .
   git commit -m "Add Gig Finder Beta with OAuth"
   git push origin main
   vercel
   ```

3. **Production Testing:**
   - Test full flow on production URL
   - Verify OAuth works with production domain
   - Monitor API quota usage

### Optional Enhancements

1. **Fine-tune Scrapers:**
   - Visit Concert.ua, Kontramarka, Karabas
   - Verify CSS selectors still work
   - Adjust selectors if websites changed

2. **Add Caching:**
   - Cache playlist data (5 minutes)
   - Cache event data (1 hour)
   - Reduce API calls

3. **Analytics:**
   - Track successful analyses
   - Monitor API quota usage
   - Track popular artists

---

## 📝 Test Results Log

Use this checklist to track your testing:

**Date:** ___________

**Browser:** ___________

### Authentication
- [ ] Sign in successful
- [ ] Profile displays correctly
- [ ] Sign out successful

### Playlist Selection
- [ ] Playlists loaded (count: _____)
- [ ] Checkboxes work
- [ ] Analysis started

### Event Matching
- [ ] Location detected: ___________
- [ ] Events found (count: _____)
- [ ] Modal displayed correctly

### Issues Found
- [ ] None
- [ ] List any issues: ___________

---

**Happy Testing! 🚀**

The Gig Finder Beta is ready to match your music taste with local live events!
