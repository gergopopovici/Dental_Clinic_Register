import React, { useEffect, useState } from 'react';
import { Box, Avatar, Typography, Button, CircularProgress } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import {
  deleteUser,
  emailChangeCodeVerification,
  emailChangeRequest,
  passwordRequest,
  updateEmail,
  updatePassword,
  verifyPasswordChangeCode,
  updateUser,
} from '../services/UserService';
import { RequestVerificationCodeDTO } from '../models/PasswordVerificationCode';
import { RequestNewPasswordDTO } from '../models/Password';
import PasswordChangeModal from '../components/PasswordChangeModal';
import { useNavigate } from 'react-router-dom';
import { RequestNewEmailDTO } from '../models/Email';
import EmailChangeModal from '../components/EmailChangeModal';
import { useUser } from '../context/UserContext';
import DeleteModal from '../components/DeleteModal';
import { signOut } from '../services/AuthorisationService';
import UpdateUserModal, { UpdateProfileDTO } from '../components/UpdateUserDetailsModal';
import { RequestUserDTO } from '../models/User';

function ProfileSettings() {
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isEmailChangeModalOpen, setIsEmailChangeModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isUpdateUserModalOpen, setIsUpdateUserModalOpen] = useState(false);

  const [passwordChangeStep, setPasswordChangeStep] = useState<'initial' | 'verifyCode' | 'enterNewPassword'>(
    'initial',
  );
  const [emailChangeStep, setEmailChangeStep] = useState<'initial' | 'verifyCode' | 'enterNewEmailAddress'>('initial');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const { user, isLoading, refreshUser, logout } = useUser();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login');
    }
  }, [user, navigate, isLoading]);

  const requestPasswordMutation = useMutation({
    mutationFn: passwordRequest,
    onSuccess: () => {
      setSuccessMessage('Verification code sent to your email address.');
      setErrorMessage('');
      setPasswordChangeStep('verifyCode');
    },
    onError: () => {
      setErrorMessage('Failed to send the verification code.');
      setSuccessMessage('');
    },
  });

  const requestEmailMutation = useMutation({
    mutationFn: emailChangeRequest,
    onSuccess: () => {
      setSuccessMessage('Verification code sent to your email address.');
      setErrorMessage('');
      setEmailChangeStep('verifyCode');
    },
    onError: () => {
      setErrorMessage('Failed to sent the verification code.');
      setSuccessMessage('');
    },
  });

  const verifyCodeMutation = useMutation({
    mutationFn: verifyPasswordChangeCode,
    onSuccess: () => {
      setSuccessMessage('Code verified successfully. Please set your new password.');
      setErrorMessage('');
      setPasswordChangeStep('enterNewPassword');
    },
    onError: () => {
      setErrorMessage('Invalid or expired code.');
      setSuccessMessage('');
    },
  });

  const verifyEmailAddressMutation = useMutation({
    mutationFn: emailChangeCodeVerification,
    onSuccess: () => {
      setSuccessMessage('Code verified successfully. Please set your new password.');
      setErrorMessage('');
      setEmailChangeStep('enterNewEmailAddress');
    },
    onError: () => {
      setErrorMessage('Invalid or expired code.');
      setSuccessMessage('');
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: async () => {
      setSuccessMessage('We are sorry to see you go!Your account was deleted successfully.');
      setErrorMessage('');
      await signOut();
      logout();
      navigate('/login');
    },
    onError: () => {
      setErrorMessage('There was an error please try again later!');
      setSuccessMessage('');
    },
  });

  const deleteFunction = () => {
    deleteUserMutation.mutate();
  };

  const handleBackStep = () => {
    setSuccessMessage('');
    setErrorMessage('');
    if (passwordChangeStep === 'verifyCode') {
      setPasswordChangeStep('initial');
    } else if (passwordChangeStep === 'enterNewPassword') {
      setPasswordChangeStep('verifyCode');
    }
  };

  const handleEmailBackStep = () => {
    setSuccessMessage('');
    setErrorMessage('');
    if (emailChangeStep === 'verifyCode') {
      setEmailChangeStep('initial');
    } else if (emailChangeStep === 'enterNewEmailAddress') {
      setEmailChangeStep('verifyCode');
    }
  };

  const updatePasswordMutation = useMutation({
    mutationFn: updatePassword,
    onSuccess: async () => {
      setSuccessMessage('Password updated successfully!');
      setErrorMessage('');
      setIsPasswordModalOpen(false);
      setPasswordChangeStep('initial');
      setVerificationCode('');
      setNewPassword('');
      setConfirmNewPassword('');
      await refreshUser();
    },
    onError: () => {
      setErrorMessage('Failed to update password.');
      setSuccessMessage('');
    },
  });

  const updateEmailMutation = useMutation({
    mutationFn: updateEmail,
    onSuccess: async () => {
      setSuccessMessage('Email was updated successfully');
      setErrorMessage('');
      setIsEmailChangeModalOpen(false);
      setEmailChangeStep('initial');
      setVerificationCode('');
      setNewEmail('');
      await refreshUser();
    },
    onError: () => {
      setErrorMessage('Failed to update the email address.');
      setSuccessMessage('');
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: updateUser,
    onSuccess: async () => {
      setSuccessMessage('User details updated successfully!');
      setErrorMessage('');
      setIsUpdateUserModalOpen(false);
      await refreshUser();
    },
    onError: (error) => {
      console.error('Error updating user details:', error);
      setErrorMessage(`Failed to update user details: ${error.message || error}`);
      setSuccessMessage('');
    },
  });

  const handleOpenPasswordModal = () => {
    setIsPasswordModalOpen(true);
    setSuccessMessage('');
    setErrorMessage('');
    setPasswordChangeStep('initial');
  };

  const handleClosePasswordModal = () => {
    setIsPasswordModalOpen(false);
    setVerificationCode('');
    setNewPassword('');
    setConfirmNewPassword('');
    setSuccessMessage('');
    setErrorMessage('');
    setPasswordChangeStep('initial');
  };

  const handleOpenEmailModal = () => {
    setIsEmailChangeModalOpen(true);
    setSuccessMessage('');
    setErrorMessage('');
    setEmailChangeStep('initial');
  };

  const handleCloseEmailModal = () => {
    setIsEmailChangeModalOpen(false);
    setVerificationCode('');
    setNewEmail('');
    setSuccessMessage('');
    setErrorMessage('');
    setEmailChangeStep('initial');
  };

  const handleOpenDeleteModal = () => {
    setIsDeleteModalOpen(true);
    setSuccessMessage('');
    setErrorMessage('');
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSuccessMessage('');
    setErrorMessage('');
  };

  const handleOpenUpdateUserModal = () => {
    setIsUpdateUserModalOpen(true);
    setSuccessMessage('');
    setErrorMessage('');
  };

  const handleCloseUpdateUserModal = () => {
    setIsUpdateUserModalOpen(false);
    setSuccessMessage('');
    setErrorMessage('');
  };

  const handleUpdateUserSubmit = (updatedProfile: UpdateProfileDTO) => {
    if (!user) {
      setErrorMessage('User data not available.');
      return;
    }

    const requestDto: RequestUserDTO = {
      username: user.username,
      password: '',
      email: user.email,
      phoneNumber: updatedProfile.phoneNumber,
      firstName: updatedProfile.firstName,
      middleName: updatedProfile.middleName,
      lastName: updatedProfile.lastName,
      dateOfBirth: '',
      gender: updatedProfile.gender,
      roles: user.roles || [],
    };
    updateUserMutation.mutate(requestDto);
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleRequestCode = () => {
    requestPasswordMutation.mutate();
  };

  const handleEmailRequestCode = () => {
    requestEmailMutation.mutate();
  };

  const handleVerifyCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode) {
      setErrorMessage('Please enter the verification code.');
      return;
    }
    const requestDto: RequestVerificationCodeDTO = {
      verificationCode: verificationCode,
    };
    verifyCodeMutation.mutate(requestDto);
  };

  const handleVerifyCodeSubmitEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode) {
      setErrorMessage('Please enter the verification code.');
      return;
    }
    const requestEmail: RequestVerificationCodeDTO = {
      verificationCode: verificationCode,
    };
    verifyEmailAddressMutation.mutate(requestEmail);
  };

  const handleNewPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      setErrorMessage('New passwords do not match.');
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    const requestDto: RequestNewPasswordDTO = {
      password: newPassword,
    };
    updatePasswordMutation.mutate(requestDto);
  };

  const handleNewEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail) {
      setErrorMessage('Email is required');
      return;
    }
    if (!isValidEmail(newEmail)) {
      setErrorMessage('Invalid email format');
      return;
    }
    const requestDTO: RequestNewEmailDTO = {
      email: newEmail,
    };
    updateEmailMutation.mutate(requestDTO);
  };

  const handleAvatarClickForUpload = () => {
    console.log('Avatar clicked: Open upload picture menu/dialog for Profile Settings');
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    navigate('/login');
    return null;
  }

  const fullName = [user.firstName, user.middleName, user.lastName].filter(Boolean).join(' ');
  console.log(fullName);
  console.log(user.middleName);

  const userRolesDisplay =
    user.roles && user.roles.length > 0
      ? user.roles.map((role) => role.replace('ROLE_', '').replace(/_/g, ' ')).join(', ')
      : 'No Roles';

  const userInitials = (user.firstName?.[0] || '') + (user.lastName?.[0] || '');

  return (
    <Box
      sx={{
        width: '100%',
        minHeight: '100%',
        bgcolor: 'background.paper',
        boxSizing: 'border-box',
      }}
    >
      <Box
        sx={{
          maxWidth: '900px',
          margin: '0 auto',
          padding: { xs: '24px', sm: '32px', md: '40px' },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: '32px',
            paddingBottom: '24px',
            borderBottom: '1px solid #e0e0e0',
            width: '100%',
          }}
        >
          <Box
            onClick={handleAvatarClickForUpload}
            sx={{
              cursor: 'pointer',
              borderRadius: '50%',
              display: 'inline-flex',
              '&:hover': {
                opacity: 0.8,
              },
            }}
          >
            <Avatar
              alt="User Profile"
              sx={{
                width: 100,
                height: 100,
                marginBottom: '16px',
                bgcolor: 'primary.main',
              }}
            >
              {userInitials}
            </Avatar>
          </Box>
          <Typography variant="h4" sx={{ marginBottom: '4px', fontWeight: 'bold', color: 'black' }}>
            {fullName}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {userRolesDisplay}
          </Typography>
        </Box>

        <Box sx={{ marginBottom: '32px', width: '100%' }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
            Account settings
          </Typography>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px',
              border: '1px solid #e0e0e0',
              borderRadius: '4px',
              width: '100%',
              mb: 2,
            }}
          >
            <Box>
              <Typography variant="body1" sx={{ fontWeight: 'bold', marginBottom: '4px', color: 'black' }}>
                First Name
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user.firstName}
              </Typography>
            </Box>
          </Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px',
              border: '1px solid #e0e0e0',
              borderRadius: '4px',
              width: '100%',
              mb: 2,
            }}
          >
            {user.middleName ? (
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 'bold', marginBottom: '4px', color: 'black' }}>
                  Middle Name
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user.middleName}
                </Typography>
              </Box>
            ) : (
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 'bold', marginBottom: '4px', color: 'black' }}>
                  Middle Name
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  -
                </Typography>
              </Box>
            )}
          </Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px',
              border: '1px solid #e0e0e0',
              borderRadius: '4px',
              width: '100%',
              mb: 2,
            }}
          >
            <Box>
              <Typography variant="body1" sx={{ fontWeight: 'bold', marginBottom: '4px', color: 'black' }}>
                Last Name
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user.lastName}
              </Typography>
            </Box>
          </Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px',
              border: '1px solid #e0e0e0',
              borderRadius: '4px',
              width: '100%',
              mb: 2,
            }}
          >
            <Box>
              <Typography variant="body1" sx={{ fontWeight: 'bold', marginBottom: '4px', color: 'black' }}>
                Phone Number
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user.phoneNumber}
              </Typography>
            </Box>
          </Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px',
              border: '1px solid #e0e0e0',
              borderRadius: '4px',
              width: '100%',
              mb: 2,
            }}
          >
            <Box>
              <Typography variant="body1" sx={{ fontWeight: 'bold', marginBottom: '4px', color: 'black' }}>
                Gender
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user.gender === 'FEMALE' ? 'Female' : user.gender === 'MALE' ? 'Male' : 'Other'}
              </Typography>
            </Box>
          </Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px',
              border: '1px solid #e0e0e0',
              borderRadius: '4px',
              width: '100%',
              mb: 2,
            }}
          >
            <Box>
              <Typography variant="body1" sx={{ fontWeight: 'bold', marginBottom: '4px', color: 'black' }}>
                Email address
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user.email}
              </Typography>
            </Box>
            <Button variant="contained" onClick={handleOpenEmailModal} sx={{ textTransform: 'none' }}>
              Change
            </Button>
          </Box>
          <Button
            sx={{
              display: 'flex',
              mt: 2,
              gap: 2,
            }}
          >
            <Button variant="contained" onClick={handleOpenPasswordModal} sx={{ mt: 2, textTransform: 'none' }}>
              Change Password
            </Button>
            <Button variant="contained" onClick={handleOpenUpdateUserModal} sx={{ mt: 2, textTransform: 'none' }}>
              Update Profile
            </Button>
          </Button>
        </Box>

        <Box sx={{ width: '100%', mt: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
            Delete account
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ marginBottom: '16px' }}>
            Would you like to delete your account?
          </Typography>
          <Button
            variant="contained"
            onClick={handleOpenDeleteModal}
            sx={{ mt: 2, textTransform: 'none' }}
            color="error"
          >
            I want to delete my account
          </Button>
        </Box>
      </Box>
      <PasswordChangeModal
        open={isPasswordModalOpen}
        onClose={handleClosePasswordModal}
        onBack={handleBackStep}
        step={passwordChangeStep}
        onRequestCode={handleRequestCode}
        isLoadingRequest={requestPasswordMutation.isPending}
        verificationCode={verificationCode}
        onVerificationCodeChange={setVerificationCode}
        onVerifyCodeSubmit={handleVerifyCodeSubmit}
        isLoadingVerify={verifyCodeMutation.isPending}
        newPassword={newPassword}
        onNewPasswordChange={setNewPassword}
        confirmNewPassword={confirmNewPassword}
        onConfirmNewPasswordChange={setConfirmNewPassword}
        onNewPasswordSubmit={handleNewPasswordSubmit}
        isLoadingUpdate={updatePasswordMutation.isPending}
        successMessage={successMessage}
        errorMessage={errorMessage}
      />
      <EmailChangeModal
        open={isEmailChangeModalOpen}
        onClose={handleCloseEmailModal}
        onBack={handleEmailBackStep}
        step={emailChangeStep}
        onRequestCode={handleEmailRequestCode}
        isLoadingRequest={requestEmailMutation.isPending}
        verificationCode={verificationCode}
        onVerificationCodeChange={setVerificationCode}
        onVerifyCodeSubmit={handleVerifyCodeSubmitEmail}
        isLoadingVerify={verifyEmailAddressMutation.isPending}
        newEmail={newEmail}
        onNewEmailChange={setNewEmail}
        onNewEmailSubmit={handleNewEmailSubmit}
        isLoadingUpdate={updateEmailMutation.isPending}
        successMessage={successMessage}
        errorMessage={errorMessage}
      />
      <DeleteModal
        open={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        successMessage={successMessage}
        errorMessage={errorMessage}
        isLoadingDelete={deleteUserMutation.isPending}
        onDelete={deleteFunction}
      />
      <UpdateUserModal
        open={isUpdateUserModalOpen}
        onClose={handleCloseUpdateUserModal}
        onSubmit={handleUpdateUserSubmit}
        isLoadingUpdate={updateUserMutation.isPending}
        successMessage={successMessage}
        errorMessage={errorMessage}
      />
    </Box>
  );
}

export default ProfileSettings;
