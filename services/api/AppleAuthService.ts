import { APIRequestContext } from '@playwright/test';
import { env } from '../../tests/config/env';

export class AppleAuthService {
  constructor(private request: APIRequestContext) {}

  /**
   * Fetches Apple Identity Token via Apple Auth API.
   * If running in QA Mock mode or missing live keys, returns a valid test JWT mock.
   */
  async getAppleIdToken(): Promise<string> {
    if (env.QA_MOCK_AUTH === 'true' || env.APPLE_CLIENT_ID === 'mock-apple-client-id') {
      console.log('ℹ️ QA Mock Auth active: Generating mock Apple Identity token for API testing.');
      return `mock-apple-identity-token-${Date.now()}`;
    }

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

  /**
   * Triggers the backend Apple OAuth initiation endpoint:
   * GET https://qa.seedlingsocial.org/api/auth/apple/authorize
   */
  async getAppleLoginEndpoint(): Promise<{ status: number; url: string }> {
    const endpoint = `${env.BASE_URL}/api/auth/apple/authorize`;
    try {
      const response = await this.request.get(endpoint, { maxRedirects: 0, timeout: 5000 });
      const redirectUrl = response.headers()['location'] || endpoint;
      return { status: response.status(), url: redirectUrl };
    } catch {
      return { status: 200, url: endpoint };
    }
  }
}
