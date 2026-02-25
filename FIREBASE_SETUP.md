# Firebase Setup Guide for PassProtector

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"**
3. Enter project name: `PassProtector`
4. Click through the setup (disable Google Analytics for now if prompted)
5. Click **"Create project"** and wait for it to complete

## Step 2: Create a Web App

1. In the Firebase Console, click the **gear icon** → **Project settings**
2. Scroll down to **"Your apps"** section
3. Click **"</>Web"** to create a web app
4. Register the app with name `PassProtector Web`
5. Check **"Also set up Firebase Hosting"** (optional)
6. Click **"Register app"**

## Step 3: Get Your Firebase Config

After registration, you'll see a code snippet like this:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

## Step 4: Update firebase.config.js

1. Open `src/firebase.config.js`
2. Replace the placeholder values with your actual Firebase credentials
3. Save the file

Example:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyB1234567890abcdefghijklmnop",
  authDomain: "passprotector-123.firebaseapp.com",
  projectId: "passprotector-123",
  storageBucket: "passprotector-123.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456789"
};
```

## Step 5: Enable Authentication

1. In Firebase Console, go to **Build** → **Authentication**
2. Click **"Get started"**
3. Enable **"Email/Password"** provider
4. Click **"Save"**

## Step 6: Create Firestore Database

1. In Firebase Console, go to **Build** → **Firestore Database**
2. Click **"Create database"**
3. Choose **"Start in test mode"** (for development)
4. Select a region (closest to you)
5. Click **"Create"**

## Step 7: Test the App

1. Run your app: `npm run dev`
2. Click **"Get Started"** to create an account
3. Fill in your name, email, and password
4. Check Firebase Console → **Authentication** to see your new user
5. Go to **Firestore Database** to see your user data stored

## Security Rules (For Production)

⚠️ **Important**: Test mode rules allow anyone to read/write. For production, update rules:

1. Go to Firestore Database → **Rules**
2. Replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Only authenticated users can access their own data
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
  }
}
```

Click **"Publish"**

## Troubleshooting

### "Failed to resolve import"
- Make sure you've installed Firebase: `npm install firebase`
- Restart your dev server: `npm run dev`

### "Firebase config is missing"
- Double-check you've filled in `src/firebase.config.js` with real values
- Don't leave the placeholder strings

### "Authentication failed"
- Verify Email/Password is enabled in Firebase Console
- Check that you're using the correct credentials

### "Firestore permission denied"
- Make sure Firestore is created
- Ensure you're in test mode (for development)
- Check Firestore rules allow authenticated users

## Next Steps

Once Firebase is set up:
1. Users can register and login securely
2. User data is stored in Firestore
3. The analyzer page will be accessible only after login
4. Password strength analysis history can be saved to the user's profile

Happy coding! 🚀