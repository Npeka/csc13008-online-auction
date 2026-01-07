# Firebase Setup Guide

This guide explains how to set up Firebase for the Online Auction Platform. Firebase is used for OAuth authentication (Google, Facebook login) and requires configuration for both backend and frontend.

## Prerequisites

- Google account
- Access to Firebase Console (https://console.firebase.google.com/)

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Enter project name: `online-auction` (or your preferred name)
4. Accept Firebase terms
5. Enable Google Analytics (optional but recommended)
6. Click "Create project"
7. Wait for project creation to complete

## Step 2: Enable Authentication Methods

1. In Firebase Console, select your project
2. Click "Authentication" in the left sidebar
3. Click "Get started" if it's your first time
4. Go to "Sign-in method" tab

### Enable Email/Password

1. Click "Email/Password"
2. Toggle "Enable" switch to ON
3. Do NOT enable "Email link (passwordless sign-in)" (unless needed)
4. Click "Save"

### Enable Google Sign-In

1. Click "Google"
2. Toggle "Enable" switch to ON
3. Enter "Project support email" (your email)
4. Click "Save"

### Enable Facebook Sign-In (Optional)

1. Click "Facebook"
2. Toggle "Enable" switch to ON
3. You'll need to create a Facebook App:
   - Go to [Facebook For Developers](https://developers.facebook.com/)
   - Create an app (if you don't have one)
   - Get App ID and App Secret
4. Enter App ID and App Secret in Firebase
5. Copy the OAuth redirect URI from Firebase
6. Add it to your Facebook App settings
7. Click "Save"

## Step 3: Configure Authorized Domains

1. In Authentication → Settings tab
2. Scroll to "Authorized domains"
3. Add your domains:
   - `localhost` (already there by default)
   - Your production domain (e.g., `yourdomain.com`)
   - Your frontend deployment URL

## Step 4: Get Firebase Configuration (Frontend)

1. In Firebase Console, click the gear icon next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps" section
4. Click the Web icon to add a web app
5. Enter app nickname: `Online Auction Frontend`
6. Do NOT check "Also set up Firebase Hosting"
7. Click "Register app"
8. Copy the Firebase configuration object

**Example configuration:**

```javascript
const firebaseConfig = {
  apiKey: 'AIzaSyA...',
  authDomain: 'your-project.firebaseapp.com',
  projectId: 'your-project-id',
  storageBucket: 'your-project.appspot.com',
  messagingSenderId: '123456789',
  appId: '1:123456789:web:abcdef',
};
```

9. Add these values to `frontend/.env`:

```env
VITE_FIREBASE_API_KEY=AIzaSyA...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

## Step 5: Generate Service Account Key (Backend)

1. In Firebase Console, click the gear icon
2. Select "Project settings"
3. Go to "Service accounts" tab
4. Click "Generate new private key"
5. A warning dialog appears, click "Generate key"
6. A JSON file will be downloaded

**IMPORTANT:** Keep this file secure! It contains sensitive credentials.

### Add Service Account to Backend

#### Option 1: File-based (Development - Local & Docker)

1. Rename the downloaded file to `firebase-service-account.json`
2. Move it to the `backend` directory:

   ```
   backend/
   └── firebase-service-account.json  <-- Place here
   ```

3. Verify the file structure:

```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "...",
  "universe_domain": "googleapis.com"
}
```

4. Update `backend/.env`:

```env
# Leave this empty to use FIREBASE_SERVICE_ACCOUNT if set
FIREBASE_SERVICE_ACCOUNT_PATH="./firebase-service-account.json"
```

#### Option 2: Environment Variable (Production - Render/Vercel/etc)

This is the **recommended approach for production** and works with platforms like Render, Vercel, Railway, etc.

1. Copy the entire JSON content from `firebase-service-account.json`
2. Minify it (remove all newlines and extra spaces):

```json
{"type":"service_account","project_id":"your-project-id","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com",...}
```

3. Set as environment variable in your hosting platform:

**On Render:**

- Go to your service → Environment
- Add new variable: `FIREBASE_SERVICE_ACCOUNT`
- Paste the minified JSON as the value

**On Vercel:**

```bash
vercel env add FIREBASE_SERVICE_ACCOUNT
# Paste the minified JSON when prompted
```

**On Railway:**

- Variables tab → Add variable
- Name: `FIREBASE_SERVICE_ACCOUNT`
- Value: Paste minified JSON

**On local `.env` (for testing):**

```env
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account",...}'
```

4. The backend code will automatically use `FIREBASE_SERVICE_ACCOUNT` if set, otherwise falls back to `FIREBASE_SERVICE_ACCOUNT_PATH`

## Step 6: Docker Configuration

For Docker deployments, use environment variable injection:

**docker-compose.yml:**

```yaml
services:
  backend:
    environment:
      # Option 1: Use file path (mounts the file via volume)
      FIREBASE_SERVICE_ACCOUNT_PATH: './firebase-service-account.json'

      # Option 2: Inject JSON (recommended for production)
      FIREBASE_SERVICE_ACCOUNT: ${FIREBASE_SERVICE_ACCOUNT:-}
```

**Usage:**

```bash
# Option 1: File-based (development)
# Ensure firebase-service-account.json exists in backend/
docker-compose up -d

# Option 2: Environment variable (production)
# Set FIREBASE_SERVICE_ACCOUNT in .env or export it
export FIREBASE_SERVICE_ACCOUNT='{"type":"service_account",...}'
docker-compose up -d
```

## Step 7: Security Configuration

### Add .gitignore Entry

Make sure `firebase-service-account.json` is in `.gitignore`:

```gitignore
# Firebase service account (contains sensitive credentials)
firebase-service-account.json
firebase-service-account-*.json
```

**NEVER commit this file to version control!**

### Environment-Specific Service Accounts

For different environments, use different service accounts:

**Development:**

```env
FIREBASE_SERVICE_ACCOUNT_PATH="./firebase-service-account-dev.json"
```

**Production:**

```env
# Use environment variable injection (preferred)
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account",...}'
```

## Step 8: Verify Setup

### Backend Verification

1. Start backend:

   ```bash
   cd backend
   pnpm start:dev
   ```

2. Check logs for Firebase initialization:

   ```
   [Nest] ... Firebase Admin initialized successfully
   ```

3. No errors should appear related to Firebase

### Frontend Verification

1. Start frontend:

   ```bash
   cd frontend
   pnpm dev
   ```

2. Open browser console (F12)
3. No Firebase-related errors should appear
4. Try to login with Google (if enabled)

## Troubleshooting

### Backend: "Cannot find module './firebase-service-account.json'"

**Solution:**

- Verify file exists in `backend/` directory
- Check exact filename (case-sensitive)
- Ensure `.env` has correct path: `FIREBASE_SERVICE_ACCOUNT_PATH="./firebase-service-account.json"`
- Alternatively, use `FIREBASE_SERVICE_ACCOUNT` environment variable with JSON content

### Backend: "Firebase authentication error"

**Solution:**

- Verify service account JSON is valid
- Check if file is not corrupted
- Re-download service account key from Firebase Console
- If using env variable, ensure JSON is properly formatted (check quotes and escaping)

### Frontend: "Firebase: Error (auth/invalid-api-key)"

**Solution:**

- Verify `VITE_FIREBASE_API_KEY` in `.env`
- Check if value is enclosed in quotes (should NOT be)
- Restart frontend dev server after changing `.env`

### Frontend: "Firebase: Error (auth/unauthorized-domain)"

**Solution:**

1. Go to Firebase Console → Authentication → Settings
2. Add your domain to "Authorized domains"
3. For local development, ensure `localhost` is there
4. For production, add your production domain

### Google Login Not Working

**Solution:**

1. Verify Google sign-in is enabled in Firebase Console
2. Check "Project support email" is set
3. Verify authorized domains are configured
4. Clear browser cache and cookies
5. Try in incognito mode

## Production Deployment

### Backend Production

**Recommended: Environment Variable Approach**

1. Copy entire JSON content from service account file
2. Minify it (remove all whitespace and newlines)
3. Set as environment variable in your hosting platform
4. Remove `FIREBASE_SERVICE_ACCOUNT_PATH` or leave it empty

**Security Checklist:**

- Never commit service account JSON to version control
- Use environment-specific service accounts (dev/staging/prod)
- Rotate service account keys periodically
- Monitor Firebase Console for suspicious activity
- Enable 2FA on your Google account
- Limit service account permissions to minimum required
- Use secret management tools for production (AWS Secrets Manager, etc.)

### Frontend Production

1. Update `.env.production`:

   ```env
   VITE_FIREBASE_API_KEY=your_production_key
   VITE_FIREBASE_AUTH_DOMAIN=your-prod-project.firebaseapp.com
   # ... other Firebase configs for production
   ```

2. Add production domain to authorized domains in Firebase Console

3. Build and deploy:
   ```bash
   pnpm build
   ```

## Firebase Cost Considerations

**Free Tier Limits (Spark Plan):**

- Authentication: Unlimited
- Cloud Storage: 1 GB stored, 10 GB/month transferred
- Cloud Functions: 125K invocations/month

**Monitor Usage:**

1. Firebase Console → Usage and billing
2. Set up budget alerts
3. Consider upgrading to Blaze (pay-as-you-go) if needed

## Additional Resources

- [Firebase Authentication Docs](https://firebase.google.com/docs/auth)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Firebase Security Best Practices](https://firebase.google.com/support/guides/security-checklist)

## Support

For Firebase-specific issues:

1. Check [Firebase Status Page](https://status.firebase.google.com/)
2. Search [Stack Overflow](https://stackoverflow.com/questions/tagged/firebase)
3. Visit [Firebase Community](https://firebase.google.com/community)

---

**Last Updated:** 2026-01-07 - Compatible with Firebase SDK version 12.7.0 (frontend) and firebase-admin 13.6.0 (backend)
