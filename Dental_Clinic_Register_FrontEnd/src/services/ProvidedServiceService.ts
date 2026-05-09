import { getAllServicesApiUrl } from "../config/apiUrl"
import { RequestServiceDTO, ResponseServiceDTO } from "../models/Service"
import apiClient from "../utils/axiosInterceptor"

export const getAllServices = async (): Promise<ResponseServiceDTO[]> => {
    try {
        const response = await apiClient.get<ResponseServiceDTO[]>(getAllServicesApiUrl)
        return response.data
    } catch (error) {
        console.error("Error fetching services:", error)
        throw error
    }
}

export const getServiceById = async (id: number): Promise<ResponseServiceDTO> => {
    try {
        const response = await apiClient.get<ResponseServiceDTO>(`${getAllServicesApiUrl}/${id}`)
        return response.data
    } catch (error) {
        console.error(`Error fetching service with id ${id}:`, error)
        throw error
    }
}

export const createService = async (data:RequestServiceDTO): Promise<ResponseServiceDTO> => {
    try {
        const response = await apiClient.post<ResponseServiceDTO>(getAllServicesApiUrl, data)
        return response.data
    } catch (error) {
        console.error("Error creating service:", error)
        throw error
    }
}

export const updateService = async (id: number, data: RequestServiceDTO): Promise<ResponseServiceDTO> => {
    try {
        const response = await apiClient.put<ResponseServiceDTO>(`${getAllServicesApiUrl}/${id}`, data)
        return response.data
    } catch (error) {
        console.error(`Error updating service with id ${id}:`, error)
        throw error
    }
}

export const deleteService = async (id: number): Promise<void> => {
    try {
        await apiClient.delete(`${getAllServicesApiUrl}/${id}`)
    } catch (error) {
        console.error(`Error deleting service with id ${id}:`, error)
        throw error
    }
}   

