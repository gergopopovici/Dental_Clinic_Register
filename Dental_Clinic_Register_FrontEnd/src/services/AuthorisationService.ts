import axios from 'axios';
import {
  forgotPasswordApiUrl,
  loginApiUrl,
  resetPasswordApiUrl,
  signUpApiUrl,
  verifyAccountApiUrl,
} from '../config/apiUrl';
import { Login } from '../models/Login';
import { RequestPasswordResetTokenDTO, ResponsePasswordResetTokenDTO } from '../models/ForgotPassword';
import { RequestUserDTO } from '../models/User';

export const loginIn = async (login: Login) => {
  console.log('Login URL:', loginApiUrl);
  console.log('Login data:', login);

  try {
    const response = await axios.post(loginApiUrl, login, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Full error:', error);
    if (axios.isAxiosError(error)) {
      console.error('Error response:', error.response);
      console.error('Error message:', error.message);
      console.error('Error code:', error.code);
    }
    throw error;
  }
};
export const requestPasswordReset = async(data:RequestPasswordResetTokenDTO)=>{
  try {
    const response = await axios.post(forgotPasswordApiUrl, data, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  }catch(error) {
    console.error('Error response:', error);
    throw error;
  }
}
export const resetPassword = async(data:ResponsePasswordResetTokenDTO)=>{
  try{
    const response = await axios.post(resetPasswordApiUrl,data,{
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  }catch (error){
    console.error('Error response:', error);
    throw error;
  }
}
export const signup = async(data:RequestUserDTO)=>{
  try{
    const response = await axios.post(signUpApiUrl,data,{
      headers:{
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  }catch(error){
    console.error('Error response:', error);
    throw error;
  }
}
export const verifyAccount = async (token: string) => {
  try {
    const response = await axios.get(verifyAccountApiUrl, {
      params: { token },
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error response:', error);
    throw error;
  }
};

