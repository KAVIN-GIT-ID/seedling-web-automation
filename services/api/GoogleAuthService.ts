import { APIRequestContext } from '@playwright/test';
import { env } from '../../tests/config/env';

export class GoogleAuthService {
  constructor(private request: APIRequestContext) {}

  /**
   * Fetches Google ID Token using OAuth 2.0 Refresh Token via Google OAuth API.
   */
  async getGoogleIdToken(): Promise<string> {
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
}
