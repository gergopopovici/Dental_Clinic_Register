export type Gender = 'MALE' | 'FEMALE' | 'OTHER';
export type TimePreference = 'MORNING'|'AFTERNOON'|'EVENING'
export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

export interface DoctorConfirmDTO{
    exactStartTime: string;
    notes?: string;
    resourceLink?: string;
}

export interface DoctorDropDownDTO {
  id: number;
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
  requestedDate: string;
  timePreference: TimePreference;
}

export interface DoctorCreateAppointmentDTO {
  patientId: number;
  serviceId: number;
  startTime: string;
  notes?: string;
  resourceLink?: string;
}

export interface DoctorConfirmDTO {
  exactStartTime: string;
  notes?: string;
  resourceLink?: string;
}

export interface DoctorUpdateAppointmentDTO {
  newStartTime: string;
  notes?: string;
  resourceLink?: string;
}

// --- USER & DOCTOR REGISTRATION ---
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

// --- RESPONSES ---
export interface ResponseAppointmentDTO {
  id: number;
  patientId: number;
  patientName: string;
  doctorId: number;
  doctorName: string;
  serviceId: number;
  serviceName: string;
  serviceDurationMinutes: number;
  requestedDate: string;
  timePreference: TimePreference;
  status: AppointmentStatus;
  startTime?: string;
  endTime?: string;
  notes?: string;
  resourceLink?: string;
}