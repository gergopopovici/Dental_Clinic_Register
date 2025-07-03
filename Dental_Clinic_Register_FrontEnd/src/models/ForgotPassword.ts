export interface RequestPasswordResetTokenDTO {
  email: string;
}
export interface ResponsePasswordResetTokenDTO {
  token: string;
  password: string;
  passwordConfirmation: string;
}
