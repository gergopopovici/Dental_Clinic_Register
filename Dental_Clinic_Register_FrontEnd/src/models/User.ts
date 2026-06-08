export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

export interface RequestUserDTO {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  roles?: string[];
  dateOfBirth: string; 
  gender: Gender;
  licenseNumber?: string;
  specialisation?: string;
  serviceIds?: number[];
}

export interface ResponseUserDTO {
  id: number;
  userName: string; 
  email: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  enabled: boolean;
  accountNonLocked: boolean;
  gender: Gender;
  localDate: string;
  profilePictureUrl?: string;
  roles: string[];
  specialisation?: string;
  licenseNumber?: string;
}

export interface UserManagemenetDTO {
  id: number;
  userName: string;
  name: string;
  email: string;
  role: string;
  accountNonLocked: boolean;
}