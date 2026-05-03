import { adminInviteApiUrl } from "../config/apiUrl";
import { RequestNewEmailDTO } from "../models/Email";
import apiClient from "../utils/axiosInterceptor";

export const sendAdminInvite = async (request: RequestNewEmailDTO) => {
  try {
    const response = await apiClient.post(adminInviteApiUrl, request);
    return response.data;
  } catch (error) {
    console.error('Error in sendAdminInvite:', error);
    throw error;
  }
  
};