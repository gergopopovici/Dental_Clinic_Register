import { getDoctorsByServiceBaseApiUrl } from "../config/apiUrl";
import { DoctorDropDownDTO } from "../models/Appointment";
import { MessageResponse } from "../models/MessageResponse";
import { ResponseServiceDTO } from "../models/Service";
import apiClient from "../utils/axiosInterceptor";

export const getDoctorsByService = async(serviceId:number) : Promise<DoctorDropDownDTO[]> => {
    try{
        const response = await apiClient.get(`${getDoctorsByServiceBaseApiUrl}/${serviceId}`)
        return response.data;
    }catch (error){
        console.error('Error fetching doctors by service',error)
        throw error;
    }
}

export const updateMyServices = async (serviceIds: number[]): Promise<MessageResponse> => {
    try{
        const response = await apiClient.put<MessageResponse>('/api/doctor/me/services',serviceIds);
        return response.data;
    }catch (error){
        console.error('Error updating doctor services:', error);
        throw error;
    }
    
};
export const getMyServices = async (): Promise<ResponseServiceDTO[]> => {
    try {
        const response = await apiClient.get<ResponseServiceDTO[]>('/api/doctor/me/services');
        return response.data;
    } catch (error) {
        console.error('Error fetching my services:', error);
        throw error;
    }
};