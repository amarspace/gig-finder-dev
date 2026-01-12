# 🔐 Security Checklist - Before Pushing to GitHub

## ⚠️ CRITICAL: Run This Checklist Before `git push`

### 1. ✅ Verify No Secrets in Code

```bash
# Check if .env.local is ignored
git status

# Should NOT see .env.local listed
# If you see it, DO NOT commit!
```

**Expected output**:
```
nothing to commit, working tree clean
```

OR (if you have uncommitted changes):
```
Untracked files:
  (use "git add <file>..." to include in what will be committed)
        some-file.tsx

# .env.local should NOT appear here
```

---

### 2. ✅ Search for Hardcoded Secrets

```bash
# Search for Google Client Secret pattern
grep -r "GOCSPX-" . --exclude-dir=node_modules --exclude-dir=.git --exclude=.env.local

# Search for Google Client ID pattern
grep -r "apps.googleusercontent.com" . --exclude-dir=node_modules --exclude-dir=.git --exclude=.env.local

# Search for NEXTAUTH_SECRET
grep -r "NEXTAUTH_SECRET=" . --exclude-dir=node_modules --exclude-dir=.git --exclude=.env.local

# Search for Ticketmaster API key (adjust pattern if needed)
grep -r "TICKETMASTER_API_KEY=" . --exclude-dir=node_modules --exclude-dir=.git --exclude=.env.local
```

**Expected output**: Only references in `.env.local` (which is ignored)

**If you find secrets in other files**:
1. Remove them immediately
2. Replace with placeholders like `[INSERT_IN_VERCEL_DASHBOARD]`
3. Re-check with the grep commands above

---

### 3. ✅ Verify .gitignore is Correct

```bash
# Check .gitignore contains these lines
cat .gitignore | grep -E "\.env|secrets|credentials"
```

**Expected output**:
```
.env
.env.local
.env*.local
.env.development.local
.env.test.local
.env.production.local
*.key
*.pem
*.crt
secrets/
credentials/
```

---

### 4. ✅ Check Documentation Files

```bash
# Check VERCEL_DEPLOYMENT.md for secrets
grep -E "GOCSPX|apps.googleusercontent.com|[0-9]{32}" VERCEL_DEPLOYMENT.md

# Check DEPLOYMENT_READY.md for secrets
grep -E "GOCSPX|apps.googleusercontent.com|[0-9]{32}" DEPLOYMENT_READY.md
```

**Expected output**: Should only show placeholder text like `[COPY_FROM_LOCAL_ENV]`

**If you find real secrets**:
1. Edit the file and replace with placeholders
2. Re-run the grep command to verify

---

### 5. ✅ Verify .env.local is NOT Staged

```bash
# Check git status
git status

# Check staged files
git diff --cached --name-only
```

**Expected**: `.env.local` should NOT appear in either list

**If .env.local appears**:
```bash
# Remove it from staging
git reset .env.local

# Verify it's in .gitignore
echo ".env.local" >> .gitignore
```

---

### 6. ✅ Test with Dry Run

```bash
# See what would be pushed (doesn't actually push)
git push origin main --dry-run

# Check which files would be pushed
git ls-tree -r main --name-only
```

**Verify**: `.env.local` is NOT in the list

---

## 🚨 If GitHub Blocks Your Push

### Error: "Secret scanning detected a credential"

**What happened**: GitHub found an API key or secret in your commit history

**Solution**:

#### Option 1: Remove from Recent Commit (If not pushed yet)
```bash
# Remove .env.local from the last commit
git rm --cached .env.local
git commit --amend --no-edit

# Try pushing again
git push origin main
```

#### Option 2: Rewrite History (If secret was committed multiple times)
```bash
# Use BFG Repo-Cleaner to remove all traces
# Download from: https://rtyley.github.io/bfg-repo-cleaner/

# Remove .env.local from all history
java -jar bfg.jar --delete-files .env.local

# Clean up
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push (⚠️ WARNING: Rewrites history)
git push origin main --force
```

#### Option 3: Start Fresh Repository
```bash
# Create new repo without history
rm -rf .git
git init
git add .
git commit -m "Initial commit - clean history"

# Push to new GitHub repository
git remote add origin <new-repo-url>
git push -u origin main
```

**IMPORTANT**: After removing secrets from git:
1. **Revoke the exposed credentials**:
   - Google OAuth: Delete and regenerate
   - Ticketmaster: Revoke and request new key
   - NEXTAUTH_SECRET: Generate new secret
2. **Update your `.env.local` with new credentials**
3. **Update Vercel environment variables**

---

## ✅ Safe to Push Checklist

Before running `git push`, verify ALL of these:

- [ ] `.env.local` is in `.gitignore`
- [ ] `git status` does NOT show `.env.local`
- [ ] No secrets found in grep searches
- [ ] Documentation only has placeholders
- [ ] Dry run shows no `.env.local`
- [ ] All secrets are stored in `.env.local` only
- [ ] Documentation references `ENV_VARIABLES.md` for setup

---

## 🎯 Quick Pre-Push Command

Run this single command before every push:

```bash
# One-line security check
if git ls-files --error-unmatch .env.local 2>/dev/null; then echo "❌ ERROR: .env.local is tracked!"; else echo "✅ SAFE: .env.local is not tracked"; fi && \
if grep -r "GOCSPX-" . --exclude-dir=node_modules --exclude-dir=.git --exclude=.env.local 2>/dev/null; then echo "❌ ERROR: Found Google secrets!"; else echo "✅ SAFE: No Google secrets found"; fi
```

**Expected output**:
```
✅ SAFE: .env.local is not tracked
✅ SAFE: No Google secrets found
```

---

## 📋 Environment Variables to Copy

When deploying to Vercel, copy these from your `.env.local`:

1. `NEXTAUTH_SECRET`
2. `GOOGLE_CLIENT_ID`
3. `GOOGLE_CLIENT_SECRET`
4. `TICKETMASTER_API_KEY`

**Never copy these to documentation or code!**

See `ENV_VARIABLES.md` for detailed setup instructions.

---

## 🔒 Best Practices Going Forward

1. **Always use environment variables for secrets**
2. **Never hardcode API keys in code**
3. **Double-check before every commit**
4. **Use placeholders in examples**
5. **Review diffs before pushing**: `git diff`

---

**If you're unsure, don't push!**

It's better to double-check than to expose secrets publicly.
