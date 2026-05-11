import { appointmentsApiUrl } from "../config/apiUrl";
import { DoctorConfirmDTO, DoctorCreateAppointmentDTO, DoctorUpdateAppointmentDTO, RequestPatientAppointmentDTO, ResponseAppointmentDTO } from "../models/Appointment";
import apiClient from "../utils/axiosInterceptor";

export const getPatientAppointments = async (userId:number): Promise<ResponseAppointmentDTO[]> => {
    const response = await apiClient.get(`${appointmentsApiUrl}/patient/${userId}`);
    return response.data;
};

export const requestAppointment = async (userId:number, request:RequestPatientAppointmentDTO): Promise<ResponseAppointmentDTO[]> => {
    const response = await apiClient.post(`${appointmentsApiUrl}/patient/${userId}/request`,request);
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

export const createAppointmentByDoctor = async (userId:number,request:DoctorCreateAppointmentDTO): Promise<ResponseAppointmentDTO> => {
    const response = await apiClient.post(`${appointmentsApiUrl}/doctor/${userId}/create`, request);
  return response.data;
};

export const confirmAppointment = async (userId: number, appointmentId: number, request: DoctorConfirmDTO): Promise<ResponseAppointmentDTO> => {
  const response = await apiClient.post(`${appointmentsApiUrl}/doctor/${userId}/confirm/${appointmentId}`, request);
  return response.data;
};

export const updateAppointment = async (userId: number, appointmentId: number, request: DoctorUpdateAppointmentDTO): Promise<ResponseAppointmentDTO> => {
  const response = await apiClient.put(`${appointmentsApiUrl}/doctor/${userId}/update/${appointmentId}`, request);
  return response.data;
};

export const cancelAppointmentByDoctor = async (userId: number, appointmentId: number,reason: string): Promise<ResponseAppointmentDTO> => {
    const response = await apiClient.put(`${appointmentsApiUrl}/doctor/${userId}/cancel/${appointmentId}`,null,{
        params:{reason}
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