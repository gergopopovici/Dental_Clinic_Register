import axios from 'axios';
import {
  forgotPasswordApiUrl,
  loginApiUrl,
  logOutApiUrl,
  resetPasswordApiUrl,
  signUpApiUrl,
  verifyAccountApiUrl,
  refreshTokenApiUrl,
} from '../config/apiUrl';
import { Login, LoginResponse } from '../models/Login';
import { RequestPasswordResetTokenDTO, ResponsePasswordResetTokenDTO } from '../models/ForgotPassword';
import { RequestUserDTO } from '../models/User';

export const loginIn = async (login: Login): Promise<LoginResponse> => {
  try {
    const response = await axios.post<LoginResponse>(loginApiUrl, login, {
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error('Full error:', error);
    if (axios.isAxiosError(error)) {
      console.error('Error response:', error.response);
      console.error('Error message:', error.message);
      console.error('Error code:', error.code);
    }
    throw error;
  }
};

export const requestPasswordReset = async (data: RequestPasswordResetTokenDTO) => {
  try {
    const response = await axios.post(forgotPasswordApiUrl, data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error response:', error);
    throw error;
  }
};

export const resetPassword = async (data: ResponsePasswordResetTokenDTO) => {
  try {
    const response = await axios.post(resetPasswordApiUrl, data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error response:', error);
    throw error;
  }
};

export const signup = async (data: RequestUserDTO) => {
  try {
    const response = await axios.post(signUpApiUrl, data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error response:', error);
    throw error;
  }
};

export const verifyAccount = async (token: string) => {
  try {
    const response = await axios.get(verifyAccountApiUrl, {
      params: { token },
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error response:', error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    const response = await axios.post(
      logOutApiUrl,
      {},
      {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      },
    );
    if (typeof window !== 'undefined') {
      localStorage.removeItem('refresh_token');
    }
    return response.data;
  } catch (error) {
    console.error('Error during logout:', error);
    if (axios.isAxiosError(error)) {
      console.error('Logout error response:', error.response);
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('refresh_token');
    }
    throw error;
  }
};

export const refreshAccessToken = async (refreshToken: string): Promise<LoginResponse> => {
  try {
    const response = await axios.post<LoginResponse>(
      refreshTokenApiUrl,
      { refreshToken },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      },
    );
    return response.data;
  } catch (error) {
    console.error('Error refreshing token:', error);
    if (axios.isAxiosError(error)) {
      console.error('Refresh token error response:', error.response);
    }
    throw error;
  }
};
