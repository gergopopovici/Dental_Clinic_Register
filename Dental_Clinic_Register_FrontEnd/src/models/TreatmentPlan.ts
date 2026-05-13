export enum TreatmentPlanStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  SUSPENDED = 'SUSPENDED',
  CANCELLED = 'CANCELLED'
}

export interface TreatmentPlanDTO {
  id?: number;
  patientId: number;
  planName: string;
  startDate: string;
  endDate?: string; 
  status: TreatmentPlanStatus;
  notes?: string;
  serviceIds?: number[];
}