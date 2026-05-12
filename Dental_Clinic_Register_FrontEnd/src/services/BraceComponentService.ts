import { BraceComponentDTO } from "../models/BraceComponentDTO";
import { braceComponenetsApiUrl } from "../config/apiUrl";
import apiClient from "../utils/axiosInterceptor";

export const getBraceComponents = async (treatmentPlanId:number) :  Promise<BraceComponentDTO[]> => {
    try{
        const response = await apiClient.get(`${braceComponenetsApiUrl}/plan/${treatmentPlanId}`);
        return response.data;
    }catch(error){
        console.error('Error in getBraceComponents:',error);
        throw error;
    }
};

export const syncBraceComponents = async (treatmentPlanId: number, components: BraceComponentDTO[]): Promise<BraceComponentDTO[]> => {
    try{
        const response = await apiClient.post(`${braceComponenetsApiUrl}/plan/${treatmentPlanId}/sync`,components);
        return response.data;
    }catch(error){
        console.error('Error in syncBraceComponents:', error);
    throw error;
    }
};