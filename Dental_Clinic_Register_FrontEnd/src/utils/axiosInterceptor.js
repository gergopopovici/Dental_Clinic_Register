/* eslint-disable no-undef */
// src/utils/axiosInterceptor.js
import axios from 'axios';
import { refreshTokenApiUrl } from '../config/apiUrl';
import { refreshAccessToken } from '../services/AuthorisationService';
import Cookies from 'js-cookie';

const apiClient = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  while (failedQueue.length > 0) {
    const prom = failedQueue.shift();
    if (error) {
      console.log('processQueue: Rejecting queued request.');
      prom.reject(error);
    } else {
      console.log('processQueue: Resolving queued request.');
      prom.resolve(token);
    }
  }
  console.log('processQueue: Queue processing finished. Queue length:', failedQueue.length);
};

const setAuthCookie = (token) => {
  console.log('setAuthCookie: Attempting to set auth_token cookie.');
  const cookieOptions = {
    path: '/',
    expires: 1 / 144,
    secure: window.location.protocol === 'https:',
    sameSite: 'Lax',
  };

  Cookies.set('auth_token', token, cookieOptions);
};

apiClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

apiClient.interceptors.response.use(
  (response) => {
    console.log('Response Interceptor: Response received for:', response.config.url, 'Status:', response.status);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const errorMessage = error.response?.data?.message || error.message;
    const errorStatus = error.response?.status;

    console.error(
      `Response Interceptor: Error for ${originalRequest.url}. Status: ${errorStatus}. Message: ${errorMessage}`,
    );
    console.log('Response Interceptor: Original request config:', originalRequest);

    if (
      (errorStatus === 401 || errorStatus === 403) &&
      !originalRequest._retry &&
      originalRequest.url !== refreshTokenApiUrl
    ) {
      console.log(
        `Response Interceptor: ${errorStatus} detected for ${originalRequest.url}. Attempting token refresh.`,
      );
      originalRequest._retry = true;

      if (isRefreshing) {
        failedQueue.push({
          resolve: (token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          },
          reject: (err) => {
            console.log('Response Interceptor: Queued request rejected.');
            return Promise.reject(err);
          },
        });
        console.log('Response Interceptor: Queue length after push:', failedQueue.length);
        return new Promise(() => {});
      }

      isRefreshing = true;
      console.log('Response Interceptor: Setting isRefreshing to true.');

      const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null;
      console.log('Response Interceptor: Refresh token from localStorage:', refreshToken ? 'Found' : 'Not Found');

      if (!refreshToken) {
        console.warn('Response Interceptor: No refresh token available. Redirecting to login.');
        if (typeof window !== 'undefined') {
          localStorage.removeItem('refresh_token');
          Cookies.remove('auth_token', { path: '/' });
        }
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        console.log('Response Interceptor: Calling refreshAccessToken service...');
        const refreshResponse = await refreshAccessToken(refreshToken);
        console.log('Response Interceptor: refreshAccessToken call completed.');

        console.log('Response Interceptor: refreshAccessToken successful. Response data:', refreshResponse);

        if (refreshResponse.accessToken) {
          setAuthCookie(refreshResponse.accessToken);
          console.log('Response Interceptor: New auth_token cookie manually set from refresh response.');
        } else {
          console.warn(
            'Response Interceptor: refreshAccessToken response did not contain a new accessToken in the body.',
          );
        }

        if (typeof window !== 'undefined' && refreshResponse.refreshToken) {
          localStorage.setItem('refresh_token', refreshResponse.refreshToken);
          console.log('Response Interceptor: Updated refresh token in localStorage');
        } else {
          console.log('Response Interceptor: No new refresh token provided by backend, keeping existing.');
        }

        isRefreshing = false;
        console.log('Response Interceptor: Setting isRefreshing to false. Processing queue.');
        processQueue(null, refreshResponse.accessToken);

        console.log(
          'Response Interceptor: Token refreshed successfully. Retrying original request:',
          originalRequest.url,
        );

        await new Promise((resolve) => setTimeout(resolve, 50));

        return apiClient(originalRequest);
      } catch (refreshError) {
        console.error(
          'Response Interceptor: Token refresh failed in catch block:',
          refreshError.response?.data || refreshError.message,
        );
        isRefreshing = false;
        console.log('Response Interceptor: Setting isRefreshing to false. Processing queue with error.');
        processQueue(refreshError);

        console.log('Response Interceptor: Clearing tokens and redirecting to login due to refresh failure.');
        if (typeof window !== 'undefined') {
          localStorage.removeItem('refresh_token');
          Cookies.remove('auth_token', { path: '/' });
        }

        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    } else if (errorStatus === 403) {
      console.error('Response Interceptor: 403 Forbidden - insufficient permissions for:', originalRequest.url);
      console.error("Response Interceptor: This usually means the user role doesn't have access to this resource.");
      return Promise.reject(error);
    }

    console.log('Response Interceptor: Passing through non-401/403 error for:', originalRequest.url);
    return Promise.reject(error);
  },
);

export default apiClient;
