# 🔧 Google OAuth Fix - Error 400: redirect_uri_mismatch

## Problem
Google shows "Error 400: redirect_uri_mismatch" when trying to sign in on Vercel deployment.

## Solution

### Step 1: Find Your Vercel Deployment URL

Your app is deployed at one of these URLs (check Vercel dashboard):
- `https://gig-finder-dev.vercel.app`
- `https://gig-finder-dev-XXXXXX.vercel.app`
- Custom domain if you configured one

**How to find it:**
1. Go to https://vercel.com/dashboard
2. Find your "gig-finder-dev" project
3. Copy the URL shown (e.g., `https://gig-finder-dev-abc123.vercel.app`)

---

### Step 2: Add Redirect URI to Google Cloud Console

1. **Open Google Cloud Console**
   - Go to: https://console.cloud.google.com/apis/credentials
   - Make sure you're in the correct project

2. **Find your OAuth 2.0 Client ID**
   - Look for the credential you created for this app
   - Click on it to edit

3. **Add Authorized redirect URIs**

   Add ALL of these URIs (replace `YOUR_VERCEL_URL` with your actual URL):

   ```
   http://localhost:3000/api/auth/callback/google
   https://YOUR_VERCEL_URL/api/auth/callback/google
   ```

   **Examples** (if your URL is `https://gig-finder-dev.vercel.app`):
   ```
   http://localhost:3000/api/auth/callback/google
   https://gig-finder-dev.vercel.app/api/auth/callback/google
   ```

4. **Click "Save"** at the bottom

---

### Step 3: Verify Environment Variables in Vercel

1. Go to Vercel Dashboard → Your Project → **Settings** → **Environment Variables**

2. Make sure `NEXTAUTH_URL` matches your Vercel deployment URL:
   ```
   NEXTAUTH_URL = https://gig-finder-dev.vercel.app
   ```
   (Replace with your actual Vercel URL)

3. If you need to update it:
   - Click the **•••** menu next to the variable
   - Click **Edit**
   - Update the value
   - Click **Save**

---

### Step 4: Redeploy on Vercel

1. Go to Vercel Dashboard → Your Project → **Deployments**
2. Click **•••** on the latest deployment
3. Click **Redeploy**
4. Wait for deployment to complete (~1-2 minutes)

---

### Step 5: Test Sign In

1. Open your Vercel app URL in a **new incognito/private window**
2. Click "Sign In" or "Profile"
3. Select your Google account
4. Grant permissions

**Expected result:** You should be signed in successfully!

---

## Troubleshooting

### Still getting redirect_uri_mismatch?

**Check the exact error message:**
- It will show you the redirect URI that was attempted
- Compare it with what you added in Google Cloud Console
- Make sure they match **exactly** (including `https://` vs `http://`)

**Common mistakes:**
- ❌ Forgot to add `/api/auth/callback/google` at the end
- ❌ Used `http://` instead of `https://` for Vercel URL
- ❌ `NEXTAUTH_URL` in Vercel doesn't match your deployment URL
- ❌ Didn't click "Save" in Google Cloud Console
- ❌ Didn't redeploy after changing environment variables

---

## Quick Checklist

Before testing, verify:

- [ ] Google Cloud Console has redirect URI: `https://YOUR_VERCEL_URL/api/auth/callback/google`
- [ ] Vercel has `NEXTAUTH_URL = https://YOUR_VERCEL_URL`
- [ ] Both URLs match exactly
- [ ] Clicked "Save" in Google Cloud Console
- [ ] Redeployed on Vercel after any changes
- [ ] Testing in incognito/private window (to avoid cached auth state)

---

## After Sign In Works

Once you can sign in successfully, check the browser console for geolocation logs:

1. Open Developer Tools (F12)
2. Go to **Console** tab
3. Look for these messages:
   - `🚀 GigFinder v2.1 - Geolocation Fix Active`
   - `📍 Detected city: YOUR_CITY`
   - `✅ Location detected: YOUR_CITY, YOUR_COUNTRY`

This will confirm:
- ✅ You're signed in
- ✅ Geolocation is working
- ✅ Your actual location is detected (not Warsaw)

---

**Need help?** Check which step is failing and review the error message carefully.
