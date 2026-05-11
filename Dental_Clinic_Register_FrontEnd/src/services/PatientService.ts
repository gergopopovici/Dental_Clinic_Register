import { getPatientsDropdownApiUrl } from "../config/apiUrl";
import { PatientDropDownDTO } from "../models/Appointment";
import apiClient from "../utils/axiosInterceptor";

export const getDoctorsByService = async ():Promise<PatientDropDownDTO[]> => {
    try{
        const response = await apiClient.get(getPatientsDropdownApiUrl);
        return response.data;
    }catch (error) {
        console.error('Error fetching patients dropdown:', error);
        throw error;
    }
}