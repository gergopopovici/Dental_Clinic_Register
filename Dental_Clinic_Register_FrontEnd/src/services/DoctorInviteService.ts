import { sendDoctorInviteApiUrl } from "../config/apiUrl";
import { RequestNewEmailDTO } from "../models/Email";
import apiClient from "../utils/axiosInterceptor";

export const sendDoctorInvite = async (request: RequestNewEmailDTO) => {
  try {
    const response = await apiClient.post(sendDoctorInviteApiUrl, request);
    return response.data;
  } catch (error) {
    console.error('Error in sendDoctorInvite:', error);
    throw error;
  }
  
};