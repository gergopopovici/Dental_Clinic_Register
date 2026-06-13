import { appointmentsApiUrl, appointmentSummaryBaseApiUrl } from "../config/apiUrl";
import { 
  DoctorCreateAppointmentDTO, 
  DoctorUpdateAppointmentDTO, 
  RequestPatientAppointmentDTO, 
  ResponseAppointmentDTO,
  BookedSlotDTO
} from "../models/Appointment";
import { AppointmentSummaryDTO } from "../models/TreatmentPlan";
import apiClient from "../utils/axiosInterceptor";

export const getBookedSlotsForDoctor = async (doctorId: number, date: string): Promise<BookedSlotDTO[]> => {
    const response = await apiClient.get(`${appointmentsApiUrl}/doctor/${doctorId}/booked-slots`, {
        params: { date }
    });
    return response.data;
};

export const getPatientAppointments = async (userId: number): Promise<ResponseAppointmentDTO[]> => {
    const response = await apiClient.get(`${appointmentsApiUrl}/patient/${userId}`);
    return response.data;
};

export const requestAppointment = async (userId: number, request: RequestPatientAppointmentDTO): Promise<ResponseAppointmentDTO> => {
    const response = await apiClient.post(`${appointmentsApiUrl}/patient/${userId}/request`, request);
    return response.data;
};

export const cancelAppointmentByPatient = async (userId: number, appointmentId: number): Promise<ResponseAppointmentDTO> => {
  const response = await apiClient.put(`${appointmentsApiUrl}/patient/${userId}/cancel/${appointmentId}`);
  return response.data;
};

export const getDoctorDailyAppointments = async (userId: number, date?: string): Promise<ResponseAppointmentDTO[]> => {
  const params = date ? { date } : {};
  const response = await apiClient.get(`${appointmentsApiUrl}/doctor/${userId}/daily`, { params });
  return response.data;
};

export const createAppointmentByDoctor = async (userId: number, request: DoctorCreateAppointmentDTO): Promise<ResponseAppointmentDTO> => {
    const response = await apiClient.post(`${appointmentsApiUrl}/doctor/${userId}/create`, request);
  return response.data;
};

export const updateAppointment = async (userId: number, appointmentId: number, request: DoctorUpdateAppointmentDTO): Promise<ResponseAppointmentDTO> => {
  const response = await apiClient.put(`${appointmentsApiUrl}/doctor/${userId}/update/${appointmentId}`, request);
  return response.data;
};

export const cancelAppointmentByDoctor = async (userId: number, appointmentId: number, reason: string): Promise<ResponseAppointmentDTO> => {
    const response = await apiClient.put(`${appointmentsApiUrl}/doctor/${userId}/cancel/${appointmentId}`, null, {
        params: { reason }
    });
    return response.data;
};

export const markAsNoShow = async (userId: number, appointmentId: number): Promise<ResponseAppointmentDTO> => {
    const response = await apiClient.put(`${appointmentsApiUrl}/doctor/${userId}/no-show/${appointmentId}`);
    return response.data;
};

export const markAsCompleted = async (userId: number, appointmentId: number): Promise<ResponseAppointmentDTO> => {
    const response = await apiClient.put(`${appointmentsApiUrl}/doctor/${userId}/complete/${appointmentId}`)
    return response.data;
};

export const addSummaryToAppointment = async(
    userId:number,
    appointmentId:number,
    notes?:string,
    audioFile?: File | null,
    imageFile?: File | null,
    documentFile?: File | null,
): Promise<AppointmentSummaryDTO> => {
  try{
    const formData = new FormData();
    if(notes){
        formData.append('notes',notes);
    }
    if(audioFile){
        formData.append('audio',audioFile);
    }
    if(imageFile){
        formData.append('image',imageFile);
    }
    if(documentFile){
        formData.append('document',documentFile);
    }
    const response = await apiClient.post<AppointmentSummaryDTO>(
      `${appointmentSummaryBaseApiUrl}/${userId}/summary/${appointmentId}`,
      formData,
      {
        headers:{
          'Content-Type':'multipart/form-data',
        }
      }
    );
    return response.data;
  }catch(error){
    console.error(`Error adding summary to appointment id ${appointmentId}:`, error);
    throw error;
  }
}