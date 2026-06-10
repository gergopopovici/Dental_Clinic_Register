export const DAYS_OF_WEEK = [
  'MONDAY', 
  'TUESDAY', 
  'WEDNESDAY', 
  'THURSDAY', 
  'FRIDAY', 
  'SATURDAY', 
  'SUNDAY'
] as const;

export type DayOfWeek = typeof DAYS_OF_WEEK[number];

export interface DoctorScheduleDTO {
  id?: number;  
  doctorId: number;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  isWorking: boolean;
}

export interface TimeOffDTO {
  id?: number;   
  doctorId?: number | null;
  startDate: string;   
  endDate: string;
  reason: string;
}

export interface ClinicSettingsDTO{
    id? : number;
    defaultStartTime:string; //HH:mm:ss
    defaultEndTime:string;   //HH:mm:ss
}