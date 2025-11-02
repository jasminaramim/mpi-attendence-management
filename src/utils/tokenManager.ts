import { projectId } from './supabase/info';

interface TokenData {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

const TOKEN_KEY = 'auth_tokens';
const REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes before expiry

export const tokenManager = {
  saveTokens: (accessToken: string, refreshToken: string, expiresIn: number = 3600) => {
    const expiresAt = Date.now() + (expiresIn * 1000);
    const tokenData: TokenData = {
      accessToken,
      refreshToken,
      expiresAt,
    };
    localStorage.setItem(TOKEN_KEY, JSON.stringify(tokenData));
  },

  getAccessToken: (): string | null => {
    const tokenData = localStorage.getItem(TOKEN_KEY);
    if (!tokenData) return null;

    try {
      const parsed: TokenData = JSON.parse(tokenData);
      return parsed.accessToken;
    } catch {
      return null;
    }
  },

  getRefreshToken: (): string | null => {
    const tokenData = localStorage.getItem(TOKEN_KEY);
    if (!tokenData) return null;

    try {
      const parsed: TokenData = JSON.parse(tokenData);
      return parsed.refreshToken;
    } catch {
      return null;
    }
  },

  isTokenExpired: (): boolean => {
    const tokenData = localStorage.getItem(TOKEN_KEY);
    if (!tokenData) return true;

    try {
      const parsed: TokenData = JSON.parse(tokenData);
      return Date.now() >= parsed.expiresAt - REFRESH_THRESHOLD;
    } catch {
      return true;
    }
  },

  refreshAccessToken: async (): Promise<string | null> => {
    const refreshToken = tokenManager.getRefreshToken();
    if (!refreshToken) return null;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/auth/v1/token?grant_type=refresh_token`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            refresh_token: refreshToken,
          }),
        }
      );

      if (!response.ok) {
        tokenManager.clearTokens();
        return null;
      }

      const data = await response.json();
      tokenManager.saveTokens(data.access_token, data.refresh_token || refreshToken, data.expires_in);
      return data.access_token;
    } catch (error) {
      console.error('Token refresh error:', error);
      tokenManager.clearTokens();
      return null;
    }
  },

  getValidToken: async (): Promise<string | null> => {
    let accessToken = tokenManager.getAccessToken();

    if (!accessToken) {
      return null;
    }

    if (tokenManager.isTokenExpired()) {
      accessToken = await tokenManager.refreshAccessToken();
    }

    return accessToken;
  },

  clearTokens: () => {
    localStorage.removeItem(TOKEN_KEY);
  },
};

