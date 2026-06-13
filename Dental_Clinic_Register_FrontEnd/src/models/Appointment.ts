import { AppointmentSummaryDTO } from "./TreatmentPlan";

export type Gender = 'MALE' | 'FEMALE' | 'OTHER';
export type AppointmentStatus = 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

export interface BookedSlotDTO {
  startTime: string;
  endTime: string;
}

export interface DoctorDropDownDTO {
  userId: number;
  fullName: string;
  specialization: string;
}

export interface PatientDropDownDTO {
  userId: number; 
  fullName: string;
  email: string;
}

export interface RequestPatientAppointmentDTO {
  doctorId: number;
  serviceId: number;
  startTime: string;
}

export interface DoctorCreateAppointmentDTO {
  patientId: number;
  serviceId: number;
  startTime: string;
  notes?: string;
  resourceLink?: string;
  treatmentPlanId?: number | null;
}

export interface DoctorUpdateAppointmentDTO {
  newStartTime: string;
  notes?: string;
  resourceLink?: string;
  treatmentPlanId?: number | null;
}

export interface RequestUserDTO {
  username: string;
  email: string;
  password?: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  phoneNumber: string;
  roles?: string[];
  dateOfBirth: string;
  gender: Gender;
}

export interface RequestDoctorDTO {
  userDetails: RequestUserDTO;
  userId?: number;
  specialization?: string;
  licenseNumber: string;
  serviceIds: number[];
}

export interface ResponseAppointmentDTO {
  id: number;
  patientId: number;
  patientName: string;
  doctorId: number;
  doctorName: string;
  serviceId: number;
  serviceName: string;
  serviceDurationMinutes: number;
  status: AppointmentStatus;
  startTime: string;
  endTime: string;
  notes?: string;
  resourceLink?: string;
  price: number;
  summary?: AppointmentSummaryDTO;
  treatmentPlanId?: number;
  treatmentPlanName?: string;
}