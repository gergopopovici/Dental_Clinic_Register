import { getDoctorsByServiceBaseApiUrl } from "../config/apiUrl";
import { DoctorDropDownDTO } from "../models/Appointment";
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