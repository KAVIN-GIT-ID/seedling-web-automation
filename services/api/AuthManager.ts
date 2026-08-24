import { APIRequestContext } from '@playwright/test';
import { GoogleAuthService } from './GoogleAuthService';
import { AppleAuthService } from './AppleAuthService';
import { TwitterAuthService } from './TwitterAuthService';
import { BackendAuthService, SocialAuthResponse } from './BackendAuthService';

/**
 * Enterprise Façade Manager for all OAuth & Social Login API Automation Flows
 */
export class AuthManager {
  private googleAuth: GoogleAuthService;
  private appleAuth: AppleAuthService;
  private twitterAuth: TwitterAuthService;
  private backendAuth: BackendAuthService;

  constructor(request: APIRequestContext) {
    this.googleAuth = new GoogleAuthService(request);
    this.appleAuth = new AppleAuthService(request);
    this.twitterAuth = new TwitterAuthService(request);
    this.backendAuth = new BackendAuthService(request);
  }

  /**
   * Executes Google OAuth API Authentication Flow
   */
  async loginWithGoogle(): Promise<SocialAuthResponse> {
    const googleIdToken = await this.googleAuth.getGoogleIdToken();
    return await this.backendAuth.authenticateSocialToken('google', googleIdToken);
  }

  /**
   * Executes Apple Sign-In API Authentication Flow
   */
  async loginWithApple(): Promise<SocialAuthResponse> {
    const appleIdToken = await this.appleAuth.getAppleIdToken();
    return await this.backendAuth.authenticateSocialToken('apple', appleIdToken);
  }

  /**
   * Executes Twitter/X OAuth API Authentication Flow
   */
  async loginWithTwitter(): Promise<SocialAuthResponse> {
    const twitterAccessToken = await this.twitterAuth.getTwitterAccessToken();
    return await this.backendAuth.authenticateSocialToken('twitter', twitterAccessToken);
  }
}
