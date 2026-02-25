/**
 * Google Authentication Service
 * Implements Google Sign-In for PassProtector
 */

/**
 * Initialize Google Sign-In
 * Note: Add this to your HTML head:
 * <script src="https://accounts.google.com/gsi/client" async defer></script>
 */
export const initGoogleSignIn = () => {
  if (!window.google) {
    console.warn('Google Sign-In script not loaded');
    return false;
  }
  return true;
};

/**
 * Handle Google Sign-In success
 * @param {Object} credentialResponse - Google credential response
 * @returns {Object} User data extracted from token
 */
export const handleGoogleSignInSuccess = (credentialResponse) => {
  try {
    if (!credentialResponse.credential) {
      throw new Error('No credential received from Google');
    }

    // Decode JWT token (Google's ID token)
    const token = credentialResponse.credential;
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    const decodedToken = JSON.parse(jsonPayload);

    return {
      success: true,
      email: decodedToken.email,
      name: decodedToken.name,
      picture: decodedToken.picture,
      sub: decodedToken.sub, // Google user ID
      aud: decodedToken.aud, // Audience (client ID)
      token: token
    };
  } catch (error) {
    console.error('Error processing Google Sign-In response:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Handle Google Sign-In error
 * @param {Object} error - Error object from Google Sign-In
 */
export const handleGoogleSignInError = (error) => {
  console.error('Google Sign-In error:', error);
  return {
    success: false,
    error: 'Failed to sign in with Google. Please try again.'
  };
};

/**
 * Sign out from Google
 */
export const signOutGoogle = () => {
  try {
    if (window.google && window.google.accounts) {
      window.google.accounts.id.disableAutoSelect();
    }
    return true;
  } catch (error) {
    console.error('Error signing out from Google:', error);
    return false;
  }
};

export default {
  initGoogleSignIn,
  handleGoogleSignInSuccess,
  handleGoogleSignInError,
  signOutGoogle
};
