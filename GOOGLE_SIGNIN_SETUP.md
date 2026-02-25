# Google Sign-In Setup Guide

## Overview
Google Sign-In is now integrated into PassProtector! Users can log in and register using their Google account instead of creating a new account.

## How It Works
- **JWT Token Decoding**: Google tokens are decoded to extract user email, name, and profile picture
- **Email Validation**: Extracted email goes through the same breach detection system as manual login
- **Automatic Registration**: Google Sign-In users are automatically logged in with their Google credentials
- **Breach Alerts**: All passwords associated with the Google account are checked against the HIBP database

## Setup Instructions

### Step 1: Create a Google OAuth Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Go to **APIs & Services** → **OAuth consent screen**
4. Configure OAuth consent screen (set as External/Testing)
5. Add yourself as a test user

### Step 2: Create OAuth 2.0 Credentials
1. Go to **APIs & Services** → **Credentials**
2. Click **+ Create Credentials** → **OAuth client ID**
3. Select **Web application**
4. Add authorized origin:
   - `http://localhost:5173` (for local development)
   - `http://localhost:5174` (for Vite dev server)
5. Add authorized redirect URI:
   - `http://localhost:5173` (if needed)
6. Copy your **Client ID**

### Step 3: Update the Code
1. Open `src/App.jsx`
2. Find the lines with `YOUR_GOOGLE_CLIENT_ID_HERE` (there are 2 in Login and Register)
3. Replace with your actual Client ID:
   ```javascript
   client_id: 'YOUR_ACTUAL_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
   ```

**Example:**
```javascript
// In both Login and Register useEffect:
google.accounts.id.initialize({
  client_id: '123456789-abc123xyz.apps.googleusercontent.com',
  callback: handleGoogleLogin // or handleGoogleRegister
});
```

### Step 4: Test It Out
1. Start the dev server: `npm run dev`
2. Go to the Login or Register page
3. You should see the blue Google Sign-In button
4. Click it and sign in with your Google account
5. You'll be automatically logged in and taken to the dashboard

## Features Included

### In `googleAuthService.js`:
- **handleGoogleSignInSuccess()** - Decodes Google JWT and extracts:
  - Email address
  - Full name
  - Profile picture URL
  - Google user ID
  
- **handleGoogleSignInError()** - Handles sign-in errors gracefully

- **signOutGoogle()** - Cleans up Google session (for future logout feature)

### Integration Points:
- **Login Component** - Google button on login page
- **Register Component** - Google button on register page
- **Email Validation** - Uses `isProperEmail()` from breach detection
- **Breach Detection** - All Google-logged-in emails are checked against HIBP

## Security Notes

1. **Client ID Protection**: The Client ID is public (it's meant to be). Real security comes from the OAuth flow.
2. **JWT Verification**: Tokens are decoded on the client side. In production, you'd verify them on the server.
3. **Email Validation**: The app validates email format to prevent demo accounts from triggering breach alerts.
4. **Credential Storage**: All Google credentials are handled by the browser's OAuth flow, never stored in localStorage.

## Troubleshooting

### Button not appearing?
- Check that `YOUR_GOOGLE_CLIENT_ID_HERE` is replaced with your actual Client ID
- Verify Google API script loaded: Check browser console
- Make sure origin is added to Google Cloud Console

### Sign-in fails?
- Check browser console for error messages
- Verify Client ID is correct
- Make sure your origin matches Google Cloud Console settings
- Clear browser cache and try again

### Email not showing correctly?
- Check that the Google account has an email configured
- Verify `handleGoogleSignInSuccess()` in `googleAuthService.js` line 18-20

### Breach alerts not working after Google sign-in?
- Email must match the format checked by `isProperEmail()` in `breachDetectionService.js`
- Your Google account email must be a proper email (not a test account)
- Refresh the page to trigger breach detection

## Production Deployment

Before deploying to production:

1. **Remove localhost origins** from authorized origins
2. **Add production domain** to authorized origins in Google Cloud Console
3. **Update Client ID** if using different project for production
4. **Implement server-side verification** of Google tokens
5. **Use environment variables** for Client ID:
   ```javascript
   client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
   ```
   And create `.env` file:
   ```
   VITE_GOOGLE_CLIENT_ID=your_client_id_here
   ```

## API Security

The app uses two key security features:

1. **Have I Been Pwned API** (for breach detection)
   - Uses k-anonymity approach with SHA-1 hashing
   - Your full password is never sent to HIBP
   - Only password hash prefix is sent

2. **Google OAuth**
   - Tokens signed and verified by Google
   - Email extraction happens client-side
   - No server-side token storage

## Future Enhancements

- [ ] Add profile picture display from Google account
- [ ] Implement Google Sign-Out button
- [ ] Add GitHub Sign-In (button already in UI)
- [ ] Server-side token verification
- [ ] Multiple OAuth provider support

---

For questions about the setup, check [Google Sign-In Documentation](https://developers.google.com/identity/gsi)
