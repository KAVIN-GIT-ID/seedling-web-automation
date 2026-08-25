import { APIRequestContext } from '@playwright/test';
import { env } from '../../tests/config/env';

export class TwitterAuthService {
  constructor(private request: APIRequestContext) {}

  /**
   * Fetches Twitter/X Access Token via OAuth 2.0 API.
   */
  async getTwitterAccessToken(): Promise<string> {
    const credentials = Buffer.from(`${env.TWITTER_CLIENT_ID}:${env.TWITTER_CLIENT_SECRET}`).toString('base64');

    const response = await this.request.post('https://api.twitter.com/2/oauth2/token', {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials}`,
      },
      form: {
        refresh_token: env.TWITTER_REFRESH_TOKEN,
        grant_type: 'refresh_token',
        client_id: env.TWITTER_CLIENT_ID,
      },
    });

    if (!response.ok()) {
      const errorText = await response.text();
      throw new Error(`Twitter OAuth API Request Failed [${response.status()}]: ${errorText}`);
    }

    const body = await response.json();
    return body.access_token;
  }

  /**
   * Triggers the backend Twitter OAuth initiation endpoint.
   */
  async getTwitterLoginEndpoint(): Promise<{ status: number; url: string }> {
    const endpoint = `${env.BASE_URL}/api/twitter/login`;
    const response = await this.request.get(endpoint, { maxRedirects: 0, timeout: 5000 });
    const redirectUrl = response.headers()['location'] || endpoint;
    return { status: response.status(), url: redirectUrl };
  }
}
