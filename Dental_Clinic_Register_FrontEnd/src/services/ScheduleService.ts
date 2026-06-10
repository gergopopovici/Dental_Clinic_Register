import { clinicSettingsApiUrl, scheduleApiUrl } from "../config/apiUrl";
import { MessageResponse } from "../models/MessageResponse";
import { ClinicSettingsDTO, DoctorScheduleDTO, TimeOffDTO } from "../models/Schedule";
import apiClient from "../utils/axiosInterceptor";

export const getDoctorSchedule = async (userId: number): Promise<DoctorScheduleDTO[]> => {
    const response = await apiClient.get(`${scheduleApiUrl}/doctor/${userId}`);
    return response.data;
}

export const updateDoctorSchedule = async (userId: number, schedules: DoctorScheduleDTO[]): Promise<MessageResponse> => {
    const response = await apiClient.put(`${scheduleApiUrl}/doctor/${userId}`, schedules);
    return response.data;
}

export const getDoctorTimeOffs = async (userId: number): Promise<TimeOffDTO[]> => {
    const response = await apiClient.get(`${scheduleApiUrl}/time-off/doctor/${userId}`);
    return response.data;
}

export const addDoctorTimeOff = async (request: TimeOffDTO): Promise<MessageResponse> => {
    const response = await apiClient.post(`${scheduleApiUrl}/time-off/doctor`, request);
    return response.data;
}

export const getGlobalHolidays = async (): Promise<TimeOffDTO[]> => {
    const response = await apiClient.get(`${scheduleApiUrl}/time-off/global`);
    return response.data;
}

export const addGlobalHoliday = async (request: TimeOffDTO): Promise<MessageResponse> => {
    const response = await apiClient.post(`${scheduleApiUrl}/time-off/global`, request);
    return response.data;
}

export const deleteTimeOff = async (timeOffId: number): Promise<MessageResponse> => {
    const response = await apiClient.delete(`${scheduleApiUrl}/time-off/${timeOffId}`);
    return response.data;
}

export const getSettings = async (): Promise<ClinicSettingsDTO> => {
    const response = await apiClient.get(`${clinicSettingsApiUrl}`);
    return response.data;
}

export const createAndUpdateSettings = async (dto: ClinicSettingsDTO): Promise<MessageResponse> => {
    const response = await apiClient.put(`${clinicSettingsApiUrl}`, dto);
    return response.data;
}