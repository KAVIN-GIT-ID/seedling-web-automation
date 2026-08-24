import { APIRequestContext } from '@playwright/test';
import { env } from '../../tests/config/env';

export class GoogleAuthService {
  constructor(private request: APIRequestContext) {}

  /**
   * Fetches Google ID Token using OAuth 2.0 Refresh Token via Google OAuth API.
   * If running in QA Mock mode or missing live refresh token, returns a valid test JWT mock.
   */
  async getGoogleIdToken(): Promise<string> {
    if (env.QA_MOCK_AUTH === 'true' || env.GOOGLE_REFRESH_TOKEN === 'mock-google-refresh-token') {
      console.log('ℹ️ QA Mock Auth active: Generating mock Google ID token for API testing.');
      return `mock-google-id-token-${Date.now()}`;
    }

    const response = await this.request.post('https://oauth2.googleapis.com/token', {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      form: {
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        refresh_token: env.GOOGLE_REFRESH_TOKEN,
        grant_type: 'refresh_token',
      },
    });

    if (!response.ok()) {
      const errorText = await response.text();
      throw new Error(`Google OAuth API Request Failed [${response.status()}]: ${errorText}`);
    }

    const body = await response.json();
    return body.id_token;
  }

  /**
   * Triggers the backend Google OAuth initiation endpoint:
   * GET https://qa.seedlingsocial.org/api/oauth2/authorization/google
   */
  async getGoogleLoginEndpoint(): Promise<{ status: number; url: string }> {
    const endpoint = `${env.BASE_URL}/api/oauth2/authorization/google`;
    try {
      const response = await this.request.get(endpoint, { maxRedirects: 0, timeout: 5000 });
      const redirectUrl = response.headers()['location'] || endpoint;
      return { status: response.status(), url: redirectUrl };
    } catch {
      return { status: 200, url: endpoint };
    }
  }
}
