export interface RequestServiceDTO {
  nameHu: string;
  nameEn: string;
  nameRo: string;
  descriptionHu?: string;
  descriptionEn?: string;
  descriptionRo?: string;
  price: number;
  durationMinutes: number;
  isPatientBookable: boolean;
}

export interface ResponseServiceDTO {
  id: number;
  nameHu: string;
  nameEn: string;
  nameRo: string;
  descriptionHu?: string;
  descriptionEn?: string;
  descriptionRo?: string;
  price: number;
  durationMinutes: number;
  isPatientBookable: boolean;
}