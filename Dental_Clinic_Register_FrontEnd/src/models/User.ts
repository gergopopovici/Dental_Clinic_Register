export interface RequestUserDTO{
  username:string;
  password:string;
  email:string;
  phoneNumber:string;
  firstName:string;
  middleName:string;
  lastName:string;
}
export interface ResponseUserDTO{
  username:string;
  password:string;
  email:string;
  phoneNumber:string;
  firstName:string;
  middleName:string;
  lastName:string;
  patient:boolean;
  doctor:boolean;
  administrator:boolean;
}
