// Social login configuration for StayKaru app
export const SOCIAL_CONFIG = {
  // Google OAuth configuration
  google: {
    // Replace with your actual Google OAuth client ID
    clientId: '848622133642-qgcp9p6clqdgtqlbj5d3oe29o611kjqs.apps.googleusercontent.com',
    // The backend endpoint expects the 'google' provider name
    providerName: 'google',
  },
  
  // Facebook OAuth configuration
  facebook: {
    // Replace with your actual Facebook App ID
    appId: '3502326653342201',
    // The backend endpoint expects the 'facebook' provider name
    providerName: 'facebook',
  },
};

// OAuth redirect URIs for different platforms
export const REDIRECT_URIS = {
  google: {
    ios: 'com.staykaru.app://oauth/google',
    android: 'com.staykaru.app://oauth/google',
    web: 'http://localhost:3000/oauth/google/callback',
  },
  facebook: {
    ios: 'com.staykaru.app://oauth/facebook',
    android: 'com.staykaru.app://oauth/facebook', 
    web: 'http://localhost:3000/oauth/facebook/callback',
  },
};

// Social login button styles and configuration
export const SOCIAL_BUTTON_CONFIG = {
  google: {
    backgroundColor: '#fff',
    borderColor: '#dadce0',
    textColor: '#3c4043',
    iconColor: '#DB4437',
    name: 'Google',
  },
  facebook: {
    backgroundColor: '#1877f2',
    borderColor: '#1877f2',
    textColor: '#fff',
    iconColor: '#fff',
    name: 'Facebook',
  },
};
