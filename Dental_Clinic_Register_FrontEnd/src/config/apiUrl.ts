const api = 'http://localhost:8080';

const loginApiUrl = `${api}/api/auth/signin`;
const forgotPasswordApiUrl = `${api}/api/auth/forgot-password`;
const resetPasswordApiUrl = `${api}/api/auth/password-reset`;
const signUpApiUrl = `${api}/api/auth/signup`;
const verifyAccountApiUrl = `${api}/api/auth/verify`;
const logOutApiUrl = `${api}/api/auth/signout`;
const passwordRequestApiUrl = `${api}/api/users/request-password-change`;
const verifyPasswordChangeCodeApiUrl = `${api}/api/users/verify-password-change-code`;
const updatePasswordApiUrl = `${api}/api/users/update-password`;
const deleteUserAccountApiUrl = `${api}/api/users/delete`;
const emailChangeRequestApiUrl = `${api}/api/users/request-email-change`;
const verifyEmailChangeCodeApiUrl = `${api}/api/users/verify-email-change-code`;
const updateEmailApiUrl = `${api}/api/users/update-email`;
const refreshTokenApiUrl = `${api}/api/auth/refresh-token`;
const updateUserApiUrl = `${api}/api/users/update-user-details`;
const uploadAvatarApiUrl = `${api}/api/users/upload-avatar`;
const getAvatarApiUrl = `${api}/api/users/avatar/`;
const getAdminStatsApiUrl = `${api}/api/users/admin/stats`;
const sendDoctorInviteApiUrl = `${api}/api/admin/invites/send`;
const apiURL = api;

export {
  apiURL,
  loginApiUrl,
  forgotPasswordApiUrl,
  resetPasswordApiUrl,
  signUpApiUrl,
  verifyAccountApiUrl,
  logOutApiUrl,
  passwordRequestApiUrl,
  verifyPasswordChangeCodeApiUrl,
  updatePasswordApiUrl,
  deleteUserAccountApiUrl,
  emailChangeRequestApiUrl,
  verifyEmailChangeCodeApiUrl,
  updateEmailApiUrl,
  refreshTokenApiUrl,
  updateUserApiUrl,
  uploadAvatarApiUrl,
  getAvatarApiUrl,
  getAdminStatsApiUrl,
  sendDoctorInviteApiUrl
};
