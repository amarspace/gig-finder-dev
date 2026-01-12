# Vercel Deployment Guide - Gig Finder

## ✅ Prerequisites Completed

Your project is now **ready for Vercel deployment**! All build errors have been fixed:

- ✅ NextAuth configuration moved to `lib/auth.ts`
- ✅ TypeScript strict mode fixes applied
- ✅ Production build tested and passing
- ✅ Environment variables configured

## 📋 Deployment Steps

### 1. Push Your Code to GitHub

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit - Ready for Vercel deployment

🚀 Features:
- YouTube OAuth integration for playlist analysis
- Ticketmaster API for global event discovery
- Genre-based vibe matching algorithm
- Mock data mode for development

🔧 Generated with Claude Code (https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

# Create GitHub repository and push
# (Follow GitHub's instructions to create a new repository)
git remote add origin <your-github-repo-url>
git branch -M main
git push -u origin main
```

### 2. Deploy to Vercel

#### Option A: Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Vercel will auto-detect Next.js configuration
5. **Add environment variables** (see section below)
6. Click **"Deploy"**

#### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy (follow prompts)
vercel

# Add environment variables via CLI
vercel env add NEXTAUTH_SECRET
vercel env add NEXTAUTH_URL
vercel env add GOOGLE_CLIENT_ID
vercel env add GOOGLE_CLIENT_SECRET
vercel env add TICKETMASTER_API_KEY
vercel env add NEXT_PUBLIC_USE_MOCK_YOUTUBE
```

### 3. Configure Environment Variables

In Vercel Dashboard → Your Project → Settings → Environment Variables, add:

#### **Production Environment Variables:**

⚠️ **SECURITY NOTE**: Copy these values from your local `.env.local` file. Never commit secrets to git!

| Variable | Value | Notes |
|----------|-------|-------|
| `NEXTAUTH_URL` | `https://your-app.vercel.app` | Your production Vercel URL |
| `NEXTAUTH_SECRET` | `[COPY_FROM_LOCAL_ENV]` | Copy from your `.env.local` file |
| `GOOGLE_CLIENT_ID` | `[COPY_FROM_LOCAL_ENV]` | From Google Cloud Console OAuth |
| `GOOGLE_CLIENT_SECRET` | `[COPY_FROM_LOCAL_ENV]` | From Google Cloud Console OAuth |
| `TICKETMASTER_API_KEY` | `[COPY_FROM_LOCAL_ENV]` | From Ticketmaster Developer Portal |
| `NEXT_PUBLIC_USE_MOCK_YOUTUBE` | `false` | Use real YouTube API in production |

**IMPORTANT**: Set `NEXT_PUBLIC_USE_MOCK_YOUTUBE=false` in production to use real YouTube data!

### 4. Update Google OAuth Redirect URIs

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to **APIs & Services > Credentials**
3. Select your OAuth 2.0 Client ID
4. Add to **Authorized redirect URIs**:
   ```
   https://your-app.vercel.app/api/auth/callback/google
   ```
5. Click **Save**

### 5. Verify Deployment

After deployment completes:

1. **Test Authentication**:
   - Visit `https://your-app.vercel.app/profile`
   - Click "Sign in with Google"
   - Grant permissions
   - Should redirect to dashboard

2. **Test Playlist Loading**:
   - Navigate to `/playlists`
   - Should see your YouTube Music playlists (when quota resets)
   - Or mock data if `NEXT_PUBLIC_USE_MOCK_YOUTUBE=true`

3. **Test Event Matching**:
   - Select playlists
   - Click "Analyze"
   - Should see events matching your music taste

## 🚨 Important Notes

### YouTube API Quota

- **Daily Limit**: 10,000 units/day (free tier)
- **Quota Reset**: Midnight Pacific Time (PST/PDT)
- **Current Status**: Quota exceeded (use mock mode)

**When quota resets tomorrow:**
```bash
# Update environment variable in Vercel
vercel env add NEXT_PUBLIC_USE_MOCK_YOUTUBE
# Set value to: false
```

### OAuth Configuration

Your Google OAuth is configured for:
- **Scopes**: `youtube.readonly` (correct ✅)
- **Access Type**: `offline` (correct ✅)
- **Prompt**: `consent` (correct ✅)

### Vercel Serverless Functions

The app uses these API routes (all configured in `vercel.json`):
- `/api/auth/[...nextauth]` - NextAuth handler
- `/api/playlists` - YouTube playlist fetching
- `/api/artists/extract` - Artist extraction from playlists
- `/api/user/matches` - Event matching engine
- `/api/events/search` - Ticketmaster search

All routes have 10-second timeout (Vercel hobby plan limit).

## 🔧 Post-Deployment Configuration

### Custom Domain (Optional)

1. In Vercel Dashboard → Settings → Domains
2. Add your custom domain
3. Update `NEXTAUTH_URL` environment variable
4. Update Google OAuth redirect URI

### Analytics (Optional)

Vercel provides built-in analytics:
- Go to your project → Analytics
- View page views, performance metrics
- No code changes needed!

### Monitoring

Check deployment logs:
```bash
vercel logs <deployment-url>
```

Or view in Vercel Dashboard → Deployments → Click deployment → Logs

## 📊 Build Configuration

Your `vercel.json` is configured with:

```json
{
  "buildCommand": "next build",
  "framework": "nextjs",
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 10
    }
  }
}
```

## 🐛 Troubleshooting

### Build Fails

```bash
# Test build locally first
npm run build

# Check for TypeScript errors
npm run lint
```

### Authentication Issues

1. Verify `NEXTAUTH_URL` matches your deployment URL
2. Check Google OAuth redirect URIs include Vercel URL
3. Ensure `NEXTAUTH_SECRET` is set correctly

### YouTube API Errors

1. Check quota status in Google Cloud Console
2. Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
3. Enable mock mode if quota exceeded:
   ```
   NEXT_PUBLIC_USE_MOCK_YOUTUBE=true
   ```

### Ticketmaster API Errors

1. Verify `TICKETMASTER_API_KEY` is correct
2. Check API key is approved for production use
3. Review rate limits: 5000 requests/day

## 🎯 Next Steps After Deployment

1. **Apply for YouTube API Quota Increase**:
   - Go to Google Cloud Console
   - Request quota increase to 1,000,000 units/day
   - Justify for production usage

2. **Implement Caching** (Future Enhancement):
   - Cache playlists in database (Vercel Postgres/KV)
   - Reduce API calls by 90%+
   - Only refresh on user request

3. **Monitor Usage**:
   - Track YouTube API quota usage
   - Monitor Ticketmaster API rate limits
   - Review Vercel function execution times

4. **User Feedback**:
   - Test with real users
   - Gather feedback on vibe matching accuracy
   - Iterate on genre detection algorithm

## ✨ Deployment Complete!

Your Gig Finder app is now live on Vercel! 🎉

**Production URL**: https://your-app.vercel.app

**Features**:
- ✅ YouTube OAuth authentication
- ✅ Playlist analysis and artist extraction
- ✅ Genre-based vibe profiling
- ✅ Global event discovery via Ticketmaster
- ✅ Vibe matching algorithm (80-98% scores)
- ✅ Mock data mode for development

---

**Built with Claude Code** | [Report Issues](https://github.com/your-username/gig-finder/issues)
