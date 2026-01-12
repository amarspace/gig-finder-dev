# 🔐 Environment Variables Setup Guide

## ⚠️ SECURITY FIRST

**NEVER commit API keys, secrets, or credentials to git!**

Your `.env.local` file is already in `.gitignore` and will never be pushed to GitHub.

---

## 📋 Required Environment Variables

### For Vercel Production Deployment

Copy these **exact variable names** into the Vercel Dashboard (Settings → Environment Variables):

| Variable Name | Where to Get It | Example Value |
|---------------|-----------------|---------------|
| `NEXTAUTH_URL` | Your Vercel deployment URL | `https://your-app.vercel.app` |
| `NEXTAUTH_SECRET` | Copy from your local `.env.local` | (Keep your existing value) |
| `GOOGLE_CLIENT_ID` | Copy from your local `.env.local` | (Ends in `.apps.googleusercontent.com`) |
| `GOOGLE_CLIENT_SECRET` | Copy from your local `.env.local` | (Starts with `GOCSPX-`) |
| `TICKETMASTER_API_KEY` | Copy from your local `.env.local` | (32 character alphanumeric) |
| `NEXT_PUBLIC_USE_MOCK_YOUTUBE` | Set to `false` for production | `false` |

---

## 🔑 How to Copy Values from Local Environment

### Step 1: View Your Local Environment File

```bash
# Open your local .env.local file
cat .env.local

# Or open in your editor
code .env.local  # VS Code
nano .env.local  # Terminal editor
```

### Step 2: Copy Each Value

Your `.env.local` file looks like this:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<YOUR_SECRET_HERE>
GOOGLE_CLIENT_ID=<YOUR_CLIENT_ID>
GOOGLE_CLIENT_SECRET=<YOUR_CLIENT_SECRET>
TICKETMASTER_API_KEY=<YOUR_API_KEY>
NEXT_PUBLIC_USE_MOCK_YOUTUBE=true
```

### Step 3: Add to Vercel Dashboard

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings → Environment Variables**
4. Click **Add New**
5. For each variable:
   - **Name**: Copy the variable name exactly (e.g., `NEXTAUTH_SECRET`)
   - **Value**: Copy the value from your `.env.local` file
   - **Environment**: Select `Production` (or all environments)
   - Click **Save**

---

## 🎯 Variable-by-Variable Instructions

### 1. NEXTAUTH_URL

**Production Value**:
```
https://your-app.vercel.app
```

**Important**:
- Use your actual Vercel deployment URL
- Will be available after first deployment
- Format: `https://your-project-name.vercel.app`

---

### 2. NEXTAUTH_SECRET

**How to Get**:
```bash
# Copy from your .env.local file
grep NEXTAUTH_SECRET .env.local
```

**Important**:
- This is a cryptographic secret
- NEVER share or commit to git
- Keep the same value across all environments

---

### 3. GOOGLE_CLIENT_ID

**How to Get**:
```bash
# Copy from your .env.local file
grep GOOGLE_CLIENT_ID .env.local
```

**Alternative Source**:
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to **APIs & Services → Credentials**
3. Find your OAuth 2.0 Client ID
4. Copy the **Client ID**

**Format**: `XXXXXXXXXX-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX.apps.googleusercontent.com`

---

### 4. GOOGLE_CLIENT_SECRET

**How to Get**:
```bash
# Copy from your .env.local file
grep GOOGLE_CLIENT_SECRET .env.local
```

**Alternative Source**:
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to **APIs & Services → Credentials**
3. Find your OAuth 2.0 Client ID
4. Click on it and view the **Client Secret**

**Format**: `GOCSPX-XXXXXXXXXXXXXXXXXXXXXXXXXXXX`

⚠️ **WARNING**: Never expose this secret publicly!

---

### 5. TICKETMASTER_API_KEY

**How to Get**:
```bash
# Copy from your .env.local file
grep TICKETMASTER_API_KEY .env.local
```

**Alternative Source**:
1. Go to [Ticketmaster Developer Portal](https://developer.ticketmaster.com/)
2. Log in to your account
3. Go to **My Apps**
4. Copy your **Consumer Key** (this is your API key)

**Format**: 32 character alphanumeric string

---

### 6. NEXT_PUBLIC_USE_MOCK_YOUTUBE

**Production Value**:
```
false
```

**Development Value**:
```
true
```

**Important**:
- Set to `false` in production to use real YouTube API
- Set to `true` in development if quota is exceeded
- This is a public variable (safe to expose)

---

## ✅ Verification Checklist

After adding all variables to Vercel, verify:

- [ ] All 6 variables are present in Vercel Dashboard
- [ ] `NEXTAUTH_URL` uses your Vercel production URL
- [ ] `NEXTAUTH_SECRET` is copied correctly
- [ ] `GOOGLE_CLIENT_ID` ends with `.apps.googleusercontent.com`
- [ ] `GOOGLE_CLIENT_SECRET` starts with `GOCSPX-`
- [ ] `TICKETMASTER_API_KEY` is 32 characters
- [ ] `NEXT_PUBLIC_USE_MOCK_YOUTUBE` is set to `false`

---

## 🔄 Updating Environment Variables

If you need to change a variable after deployment:

1. Go to Vercel Dashboard → Settings → Environment Variables
2. Find the variable you want to update
3. Click the **•••** menu → **Edit**
4. Update the value
5. Click **Save**
6. **Redeploy** your app for changes to take effect

---

## 🐛 Troubleshooting

### Problem: "Invalid client" error in Google OAuth

**Solution**: Check that `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` match your Google Cloud Console credentials.

### Problem: "NEXTAUTH_SECRET must be provided"

**Solution**: Ensure `NEXTAUTH_SECRET` is set in Vercel and has a value (not empty).

### Problem: YouTube API returns 401 Unauthorized

**Solution**:
1. Check `GOOGLE_CLIENT_SECRET` is correct
2. Verify `NEXT_PUBLIC_USE_MOCK_YOUTUBE=false` (not `true`)
3. Ensure OAuth scope includes `youtube.readonly`

### Problem: Ticketmaster API returns 403 Forbidden

**Solution**: Verify `TICKETMASTER_API_KEY` is correct and active in your Ticketmaster developer account.

---

## 🔒 Security Best Practices

1. **Never commit `.env.local` to git**
   - Already in `.gitignore`
   - Double-check with: `git status`

2. **Rotate secrets regularly**
   - Generate new `NEXTAUTH_SECRET` periodically
   - Update Google OAuth credentials if compromised

3. **Use different secrets per environment**
   - Development: One set of keys
   - Production: Different set of keys

4. **Monitor for exposed secrets**
   - GitHub will scan and alert you
   - Never include secrets in documentation
   - Use placeholders in examples

5. **Revoke compromised credentials immediately**
   - Google Cloud Console → Credentials → Delete
   - Ticketmaster Portal → Revoke Key
   - Generate new credentials

---

## 📞 Need Help?

### Where to Get Credentials

- **Google OAuth**: [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
- **Ticketmaster API**: [Ticketmaster Developer Portal](https://developer.ticketmaster.com/products-and-docs/apis/getting-started/)
- **NEXTAUTH_SECRET**: Already in your `.env.local` file

### Generate New NEXTAUTH_SECRET

If you need a new secret:

```bash
# Option 1: Using OpenSSL
openssl rand -base64 32

# Option 2: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

**Remember**: Your `.env.local` file is your source of truth. Always copy values from there to Vercel!
