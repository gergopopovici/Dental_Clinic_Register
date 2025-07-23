/* eslint-disable no-unused-vars */
export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

export interface RequestUserDTO {
  username: string;
  password: string;
  email: string;
  phoneNumber: string;
  firstName: string;
  middleName: string;
  lastName: string;
  dateOfBirth: string;
  gender: Gender;
  roles: string[];
}

export interface ResponseUserDTO {
  username: string;
  password: string;
  email: string;
  phoneNumber: string;
  firstName: string;
  middleName: string;
  lastName: string;
  patient: boolean;
  doctor: boolean;
  administrator: boolean;
  gender: Gender;
}
