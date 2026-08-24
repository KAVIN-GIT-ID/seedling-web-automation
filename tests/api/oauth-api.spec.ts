import { test, expect } from '@playwright/test';
import { AuthManager } from '../../services/api/AuthManager';

test.describe('OAuth API Automation Suite - Google, Apple & Twitter', () => {

  test('TC_API_OAuth_01: Verify Google OAuth API Login Flow', async ({ request }) => {
    const authManager = new AuthManager(request);

    console.log('🚀 Initiating Google OAuth API Login test...');
    const authResult = await authManager.loginWithGoogle();

    console.log('✅ Google OAuth Response:', authResult);
    expect(authResult.success).toBe(true);
    expect(authResult.statusCode).toBe(200);
    expect(authResult.accessToken).toBeDefined();
    expect(authResult.user.provider).toBe('google');
    expect(authResult.user.email).toContain('@');
  });

  test('TC_API_OAuth_02: Verify Apple Sign-In API Login Flow', async ({ request }) => {
    const authManager = new AuthManager(request);

    console.log('🚀 Initiating Apple Sign-In API Login test...');
    const authResult = await authManager.loginWithApple();

    console.log('✅ Apple Sign-In Response:', authResult);
    expect(authResult.success).toBe(true);
    expect(authResult.statusCode).toBe(200);
    expect(authResult.accessToken).toBeDefined();
    expect(authResult.user.provider).toBe('apple');
  });

  test('TC_API_OAuth_03: Verify Twitter (X) OAuth API Login Flow', async ({ request }) => {
    const authManager = new AuthManager(request);

    console.log('🚀 Initiating Twitter OAuth API Login test...');
    const authResult = await authManager.loginWithTwitter();

    console.log('✅ Twitter OAuth Response:', authResult);
    expect(authResult.success).toBe(true);
    expect(authResult.statusCode).toBe(200);
    expect(authResult.accessToken).toBeDefined();
    expect(authResult.user.provider).toBe('twitter');
  });

  test('TC_API_OAuth_04: Verify Dynamic Apple Sign-In Token Decoding & Session Parsing', async ({ request }) => {
    const { BackendAuthService } = await import('../../services/api/BackendAuthService');
    const backendAuth = new BackendAuthService(request);

    const sampleAppleToken = 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJwZXJ1bWFscGFsYW5pa2NlQGdtYWlsLmNvbSIsImV4cCI6MTc4ODE4MjU1MCwiYXV0aCI6IltdIiwiaWF0IjoxNzg3NTc3NzUwLCJ1c2VySWQiOjE1MTB9.tT4NZ-JiZ6VoEUTJ7dUOs-kNrrDAiXLZylgCn1QUuODYc0wG3xYH6HzoZ25qf5HwqeM9zrYzl9eXP2-bB2d3Xg';

    console.log('🚀 Testing Dynamic Apple Sign-In Token parsing...');
    const authResult = await backendAuth.authenticateSocialToken('apple', sampleAppleToken);

    console.log('✅ Apple Parsed Response:', authResult);
    expect(authResult.success).toBe(true);
    expect(authResult.user.email).toBe('perumalpalanikce@gmail.com');
    expect(authResult.user.userId).toBe(1510);
    expect(authResult.user.provider).toBe('apple');
  });

  test('TC_API_OAuth_05: Verify Dynamic Twitter OAuth Token Decoding & Role Parsing', async ({ request }) => {
    const { BackendAuthService } = await import('../../services/api/BackendAuthService');
    const backendAuth = new BackendAuthService(request);

    const sampleTwitterToken = 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJrYXZpbmFwQHVpdC5hYy5pbiIsImV4cCI6MTc4ODE4MjY1NSwiYXV0aCI6IlJPTEVfQURNSU4iLCJpYXQiOjE3ODc1Nzc4NTUsInVzZXJJZCI6MTY0N30.7RW55UWvFYOsgjPQvtsi5lU10ZMlJID65t3JdsMP2YNfGAbbJIH1_rz4XnbuIZjHCjOWLLFecgDaAY3WyPFudQ';

    console.log('🚀 Testing Dynamic Twitter OAuth Token parsing...');
    const authResult = await backendAuth.authenticateSocialToken('twitter', sampleTwitterToken);

    console.log('✅ Twitter Parsed Response:', authResult);
    expect(authResult.success).toBe(true);
    expect(authResult.user.email).toBe('kavinap@uit.ac.in');
    expect(authResult.user.userId).toBe(1647);
    expect(authResult.user.role).toBe('ROLE_ADMIN');
    expect(authResult.user.provider).toBe('twitter');
  });

  test('TC_API_OAuth_06: Verify Backend Social Login Initiation Endpoints (/api/{provider}/login)', async ({ request }) => {
    const { TwitterAuthService } = await import('../../services/api/TwitterAuthService');
    const twitterAuth = new TwitterAuthService(request);

    console.log('🚀 Testing /api/twitter/login initiation endpoint...');
    const twitterResult = await twitterAuth.getTwitterLoginEndpoint();

    console.log('✅ Twitter Login Endpoint Status:', twitterResult.status, 'URL:', twitterResult.url);
    expect([200, 302, 307]).toContain(twitterResult.status);
    expect(twitterResult.url).toBeDefined();
  });

});
