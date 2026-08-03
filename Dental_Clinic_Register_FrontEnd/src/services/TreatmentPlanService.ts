import { treatmentPlanApiUrl } from "../config/apiUrl";
import { PanoramaImageDTO } from "../models/PanoramaImage";
import { TreatmentPlanDTO } from "../models/TreatmentPlan";
import apiClient from "../utils/axiosInterceptor";


export const getPlansByPatientId = async (userId: number): Promise<TreatmentPlanDTO[]> => {
    try {
        const response = await apiClient.get<TreatmentPlanDTO[]>(`${treatmentPlanApiUrl}/patient/${userId}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching treatment plans for patient userId ${userId}:`, error);
        throw error;
    }
}

export const getPlanById = async (id: number): Promise<TreatmentPlanDTO> => {
    try {
        const response = await apiClient.get<TreatmentPlanDTO>(`${treatmentPlanApiUrl}/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching treatment plan with id ${id}:`, error);
        throw error;
    }
}

export const createPlan = async (data: TreatmentPlanDTO): Promise<TreatmentPlanDTO> => {
    try {
        const response = await apiClient.post<TreatmentPlanDTO>(treatmentPlanApiUrl, data);
        return response.data;
    } catch (error) {
        console.error("Error creating treatment plan:", error);
        throw error;
    }
}

export const updatePlan = async (id: number, data: TreatmentPlanDTO): Promise<TreatmentPlanDTO> => {
    try {
        const response = await apiClient.put<TreatmentPlanDTO>(`${treatmentPlanApiUrl}/${id}`, data);
        return response.data;
    } catch (error) {
        console.error(`Error updating treatment plan with id ${id}:`, error);
        throw error;
    }
}

export const deletePlan = async (id: number): Promise<void> => {
    try {
        await apiClient.delete(`${treatmentPlanApiUrl}/${id}`);
    } catch (error) {
        console.error(`Error deleting treatment plan with id ${id}:`, error);
        throw error;
    }
}

export const uploadPanoramaImage = async (planId: number, file: File): Promise<PanoramaImageDTO> => {
    const formData = new FormData();
    formData.append("file", file);

    try {
        // A fetch API-t használjuk az apiClient helyett, hogy a böngésző maga állítsa be a Multipart Boundary-t!
        const response = await fetch(`${treatmentPlanApiUrl}/${planId}/panorama-images`, {
            method: 'POST',
            body: formData,
            credentials: 'include' // Ez küldi el a JWT 'auth_token' sütit!
        });

        if (!response.ok) {
            throw new Error(`Upload failed with status: ${response.status}`);
        }

        const data = await response.json();
        return data as PanoramaImageDTO;
    } catch (error) {
        console.error(`Error uploading panorama image for plan ${planId}:`, error);
        throw error;
    }
}