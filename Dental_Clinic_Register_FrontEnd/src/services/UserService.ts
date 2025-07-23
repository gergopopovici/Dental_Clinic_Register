import {
  apiURL,
  deleteUserAccountApiUrl,
  emailChangeRequestApiUrl,
  passwordRequestApiUrl,
  updateEmailApiUrl,
  updatePasswordApiUrl,
  updateUserApiUrl,
  verifyEmailChangeCodeApiUrl,
  verifyPasswordChangeCodeApiUrl,
} from '../config/apiUrl';
import { RequestVerificationCodeDTO } from '../models/PasswordVerificationCode';
import { RequestNewPasswordDTO } from '../models/Password';
import { UserDetails } from '../context/UserContext';
import { RequestNewEmailDTO } from '../models/Email';
import apiClient from '../utils/axiosInterceptor';
import { RequestUserDTO } from '../models/User';

export const passwordRequest = async () => {
  try {
    const response = await apiClient.post(passwordRequestApiUrl, {});
    return response.data;
  } catch (error) {
    console.error('Error in passwordRequest:', error);
    throw error;
  }
};

export const verifyPasswordChangeCode = async (request: RequestVerificationCodeDTO) => {
  try {
    const response = await apiClient.post(verifyPasswordChangeCodeApiUrl, request);
    return response.data;
  } catch (error) {
    console.error('Error in verifyPasswordChangeCode:', error);
    throw error;
  }
};

export const updatePassword = async (request: RequestNewPasswordDTO) => {
  try {
    const response = await apiClient.put(updatePasswordApiUrl, request);
    return response.data;
  } catch (error) {
    console.error('Error in updatePassword:', error);
    throw error;
  }
};

export const getCurrentUserDetails = async (): Promise<UserDetails> => {
  try {
    const response = await apiClient.get(`${apiURL}/api/users`);
    return response.data;
  } catch (error) {
    console.error('Error in getCurrentUserDetails:', error);
    throw error;
  }
};

export const emailChangeRequest = async () => {
  try {
    const response = await apiClient.post(emailChangeRequestApiUrl, {});
    return response.data;
  } catch (error) {
    console.error('Error in emailChangeRequest:', error);
    throw error;
  }
};

export const emailChangeCodeVerification = async (request: RequestVerificationCodeDTO) => {
  try {
    const response = await apiClient.post(verifyEmailChangeCodeApiUrl, request);
    return response.data;
  } catch (error) {
    console.error('Error in emailChangeCodeVerification:', error);
    throw error;
  }
};

export const updateEmail = async (request: RequestNewEmailDTO) => {
  try {
    const response = await apiClient.put(updateEmailApiUrl, request);
    return response.data;
  } catch (error) {
    console.error('Error in updateEmail:', error);
    throw error;
  }
};

export const updateUser = async (request: RequestUserDTO) => {
  try {
    const response = await apiClient.put(updateUserApiUrl, request);
    return response.data;
  } catch (error) {
    console.log('Error in updateUser {}', error);
    throw error;
  }
};

export const deleteUser = async () => {
  try {
    const response = await apiClient.delete(deleteUserAccountApiUrl);
    return response.data;
  } catch (error) {
    console.error('Error in deleteUser:', error);
    throw error;
  }
};
