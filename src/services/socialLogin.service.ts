import { Platform, Alert } from 'react-native';
import { SOCIAL_CONFIG } from '../config/socialLogin.config';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';

// Register the redirect URI for web browser redirects
WebBrowser.maybeCompleteAuthSession();

class SocialLoginService {  // Google OAuth implementation
  async signInWithGoogle() {
    try {
      const redirectUri = AuthSession.makeRedirectUri({
        scheme: 'staykaru'
      });
      
      console.log('Google auth redirect URI:', redirectUri);

      const authRequestConfig = {
        clientId: SOCIAL_CONFIG.google.clientId,
        scopes: ['openid', 'profile', 'email'],
        redirectUri,
        responseType: AuthSession.ResponseType.Token,
      };

      const authRequest = new AuthSession.AuthRequest(authRequestConfig);
      const authorizeResult = await authRequest.promptAsync({
        authorizationEndpoint: 'https://accounts.google.com/oauth/authorize',
      });

      if (authorizeResult.type === 'success') {
        // Get user info with the access token
        const userInfoResponse = await fetch(
          `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${authorizeResult.params.access_token}`
        );
        const userInfo = await userInfoResponse.json();
        
        return {
          token: authorizeResult.params.access_token,
          user: userInfo,
        };
      } else {
        throw new Error('Google authorization was cancelled or failed');
      }
    } catch (error: any) {
      console.error('Google login error:', error);
      // More descriptive error message
      if (error.message?.includes('configuration') || error.response?.data?.message?.includes('configuration')) {
        throw new Error('Google login failed: Backend OAuth configuration is incomplete. Please contact support.');
      }
      throw new Error('Google login failed. Please try again later.');
    }
  }  // Facebook OAuth implementation  
  async signInWithFacebook() {
    try {
      const redirectUri = AuthSession.makeRedirectUri({
        scheme: 'staykaru'
      });
      
      console.log('Facebook auth redirect URI:', redirectUri);

      const authRequestConfig = {
        clientId: SOCIAL_CONFIG.facebook.appId,
        scopes: ['public_profile', 'email'],
        redirectUri,
        responseType: AuthSession.ResponseType.Token,
      };

      const authRequest = new AuthSession.AuthRequest(authRequestConfig);
      const authorizeResult = await authRequest.promptAsync({
        authorizationEndpoint: 'https://www.facebook.com/v12.0/dialog/oauth',
      });

      if (authorizeResult.type === 'success') {
        // Get user info with the access token
        const userInfoResponse = await fetch(
          `https://graph.facebook.com/me?access_token=${authorizeResult.params.access_token}&fields=id,name,email,picture`
        );
        const userInfo = await userInfoResponse.json();
        
        return {
          token: authorizeResult.params.access_token,
          user: userInfo,
        };
      } else {
        throw new Error('Facebook authorization was cancelled or failed');
      }
    } catch (error: any) {
      console.error('Facebook login error:', error);
      // More descriptive error message
      if (error.message?.includes('configuration') || error.response?.data?.message?.includes('configuration')) {
        throw new Error('Facebook login failed: Backend OAuth configuration is incomplete. Please contact support.');
      }
      throw new Error('Facebook login failed. Please try again later.');
    }  }
}

export default new SocialLoginService();
