export interface RequestServiceDTO {
    name: string;
    description?: string;
    price: number;
    durationMinutes: number;
}

export interface ResponseServiceDTO {
    id: number;
    name: string;
    description?: string;
    price: number;
    durationMinutes: number;
}