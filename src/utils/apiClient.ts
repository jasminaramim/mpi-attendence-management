import { tokenManager } from './tokenManager';
import { projectId } from './supabase/info';
import { showError } from './alerts';

interface ApiOptions extends RequestInit {
  skipAuth?: boolean;
  retryCount?: number;
}

class ApiClient {
  private baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-0614540f`;

  async request<T = any>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    const { skipAuth = false, retryCount = 0, ...fetchOptions } = options;

    // Get valid token if auth is required
    let headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    };

    if (!skipAuth) {
      const token = await tokenManager.getValidToken();
      if (!token) {
        throw new Error('Authentication required');
      }
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...fetchOptions,
        headers,
      });

      // Handle 401 - Unauthorized (token expired)
      if (response.status === 401 && !skipAuth && retryCount === 0) {
        // Try refreshing token once
        const newToken = await tokenManager.refreshAccessToken();
        if (newToken) {
          // Retry with new token
          return this.request<T>(endpoint, {
            ...options,
            retryCount: 1,
          });
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: `HTTP ${response.status}: ${response.statusText}`,
        }));
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
      }

      const data = await response.json();
      return data as T;
    } catch (error: any) {
      if (error.message === 'Authentication required') {
        throw error;
      }
      
      // Network error
      if (error.name === 'TypeError' || error.message.includes('fetch')) {
        throw new Error('Network error. Please check your connection and try again.');
      }
      
      throw error;
    }
  }

  get<T = any>(endpoint: string, options?: ApiOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  post<T = any>(endpoint: string, body?: any, options?: ApiOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  put<T = any>(endpoint: string, body?: any, options?: ApiOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  delete<T = any>(endpoint: string, body?: any, options?: ApiOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'DELETE',
      body: body ? JSON.stringify(body) : undefined,
    });
  }
}

export const apiClient = new ApiClient();

