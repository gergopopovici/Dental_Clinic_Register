export interface AppointmentSummaryDTO {
  id: number;
  notes?: string;
  audioUrl?: string;
  imageUrl?: string;
  documentUrl?: string;
}

export interface PlanAppointmentDTO {
  id: number;
  startTime: string;
  serviceName: string;
  status: string;
  summary?: AppointmentSummaryDTO;
}

export interface TreatmentPlanDTO {
  id?: number;
  patientId: number;
  primaryServiceId: number;
  primaryServiceName?: string;
  plannedServiceIds?: number[];
  plannedServiceNames?: string[];
  requires3DModel: boolean;
  startDate: string;
  endDate?: string;
  status: 'ACTIVE' | 'COMPLETED' | 'SUSPENDED' | 'CANCELLED';
  generalNotes?: string;
  appointments?: PlanAppointmentDTO[];
}