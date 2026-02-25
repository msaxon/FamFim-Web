import { getAccessToken, clearAccessToken } from './tokenStore';

export class AuthManager {
  static async getAccessToken(): Promise<string | null> {
    return getAccessToken();
  }

  static async signOut() {
    clearAccessToken();
    // You might want to revoke the token here as well using google.accounts.oauth2.revoke
    window.location.href = '#/login';
  }

  static async isSignedIn(): Promise<boolean> {
    return !!getAccessToken();
  }
}

export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const accessToken = getAccessToken();

  if (!accessToken) {
    throw new Error('No access token available');
  }

  const headers = {
    ...options.headers,
    Authorization: `Bearer ${accessToken}`,
  };

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    clearAccessToken();
    window.location.href = '#/login';
    throw new Error('Session expired. Please log in again.');
  }

  return response;
}
