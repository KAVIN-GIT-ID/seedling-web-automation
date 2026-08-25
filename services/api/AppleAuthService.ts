import { APIRequestContext } from '@playwright/test';
import { env } from '../../tests/config/env';

export class AppleAuthService {
  constructor(private request: APIRequestContext) {}

  /**
   * Fetches Apple Identity Token via Apple Auth API.
   */
  async getAppleIdToken(): Promise<string> {
    const response = await this.request.post('https://appleid.apple.com/auth/token', {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      form: {
        client_id: env.APPLE_CLIENT_ID,
        client_secret: env.APPLE_PRIVATE_KEY,
        grant_type: 'authorization_code',
      },
    });

    if (!response.ok()) {
      const errorText = await response.text();
      throw new Error(`Apple OAuth API Request Failed [${response.status()}]: ${errorText}`);
    }

    const body = await response.json();
    return body.id_token;
  }
}
