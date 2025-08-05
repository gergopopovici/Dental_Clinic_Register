import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Box,
  Avatar,
  Typography,
  Button,
  CircularProgress,
  Slider,
  Dialog,
  DialogActions,
  DialogContent,
} from '@mui/material';
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
  uploadAvatar,
  getAvatar,
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
import './Profile.css';
import getCroppedImg from '../utils/cropImage';
import Cropper from 'react-easy-crop';
import { Area } from 'react-easy-crop';

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
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [showCropperModal, setShowCropperModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
    onError: (error: Error) => {
      setErrorMessage(`Failed to send the verification code: ${error.message || 'Unknown error'}`);
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
    onError: (error: Error) => {
      setErrorMessage(`Failed to send the verification code: ${error.message || 'Unknown error'}`);
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
    onError: (error: Error) => {
      setErrorMessage(`Invalid or expired code: ${error.message || 'Unknown error'}`);
      setSuccessMessage('');
    },
  });

  const verifyEmailAddressMutation = useMutation({
    mutationFn: emailChangeCodeVerification,
    onSuccess: () => {
      setSuccessMessage('Code verified successfully. Please set your new email address.');
      setErrorMessage('');
      setEmailChangeStep('enterNewEmailAddress');
    },
    onError: (error: Error) => {
      setErrorMessage(`Invalid or expired code: ${error.message || 'Unknown error'}`);
      setSuccessMessage('');
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: async () => {
      setSuccessMessage('We are sorry to see you go! Your account was deleted successfully.');
      setErrorMessage('');
      await signOut();
      logout();
      navigate('/login');
    },
    onError: (error: Error) => {
      setErrorMessage(`There was an error deleting your account: ${error.message || 'Unknown error'}`);
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
    onError: (error: Error) => {
      setErrorMessage(`Failed to update password: ${error.message || 'Unknown error'}`);
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
    onError: (error: Error) => {
      setErrorMessage(`Failed to update the email address: ${error.message || 'Unknown error'}`);
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
    onError: (error: Error) => {
      console.error('Error updating user details:', error);
      setErrorMessage(`Failed to update user details: ${error.message || error}`);
      setSuccessMessage('');
    },
  });

  const uploadAvatarMutation = useMutation({
    mutationFn: uploadAvatar,
    onSuccess: async () => {
      setSuccessMessage('Avatar uploaded successfully!');
      setErrorMessage('');
      setShowCropperModal(false);
      setImageSrc(null);
      setZoom(1);
      setCrop({ x: 0, y: 0 });
      setCroppedAreaPixels(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      await refreshUser();
    },
    onError: (error: Error) => {
      console.error('Error uploading avatar:', error);
      setErrorMessage(`Failed to upload avatar: ${error.message || 'Unknown error'}`);
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

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        setErrorMessage('Please select an image file.');
        return;
      }

      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImageSrc(reader.result as string);
        setShowCropperModal(true);
        setErrorMessage('');
      });
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleUploadCroppedImage = async () => {
    if (!imageSrc || !croppedAreaPixels) {
      setErrorMessage('No image or crop area defined.');
      return;
    }
    if (typeof imageSrc !== 'string') {
      setErrorMessage('Image source is not a valid string.');
      return;
    }
    try {
      const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      const avatarFile = new File([croppedImageBlob], `avatar_${user?.id || 'unknown'}_${Date.now()}.png`, {
        type: 'image/png',
      });

      uploadAvatarMutation.mutate(avatarFile);
    } catch (error: unknown) {
      console.error('Error during cropping or preparing for upload:', error);
      setErrorMessage(
        `Failed to process image for upload: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  };

  const closeCropperModal = () => {
    setShowCropperModal(false);
    setImageSrc(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setErrorMessage('');
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
  const userRolesDisplay =
    user.roles && user.roles.length > 0
      ? user.roles.map((role) => role.replace('ROLE_', '').replace(/_/g, ' ')).join(', ')
      : 'No Roles';

  const userInitials = (user?.firstName?.[0] || '') + (user?.lastName?.[0] || '');

  const avatarUrl = getAvatar(user.profilePictureUrl);

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
            sx={{
              cursor: 'pointer',
              borderRadius: '50%',
              display: 'inline-flex',
              '&:hover': {
                opacity: 0.8,
              },
              position: 'relative',
            }}
          >
            <Avatar
              alt="User Profile"
              src={avatarUrl || undefined}
              sx={{
                width: 100,
                height: 100,
                marginBottom: '16px',
                bgcolor: 'primary.main',
              }}
            >
              {!avatarUrl && userInitials}
            </Avatar>
            <input
              type="file"
              ref={fileInputRef}
              onChange={onFileChange}
              accept="image/*"
              style={{ display: 'none' }}
            />
            <Button
              variant="contained"
              onClick={() => fileInputRef.current?.click()}
              sx={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                transform: 'translate(25%, 25%)',
                borderRadius: '50%',
                minWidth: 0,
                width: 36,
                height: 36,
                p: 0,
                boxShadow: 3,
              }}
            >
              <Typography variant="caption" sx={{ fontSize: '1.2rem' }}>
                +
              </Typography>
            </Button>
          </Box>
          <Typography variant="h4" sx={{ marginBottom: '4px', fontWeight: 'bold', color: 'black' }}>
            {fullName}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {userRolesDisplay}
          </Typography>
        </Box>

        {successMessage && (
          <Typography color="success.main" sx={{ mb: 2, textAlign: 'center' }}>
            {successMessage}
          </Typography>
        )}
        {errorMessage && (
          <Typography color="error.main" sx={{ mb: 2, textAlign: 'center' }}>
            {errorMessage}
          </Typography>
        )}

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
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              mt: 2,
            }}
          >
            <Button variant="contained" onClick={handleOpenPasswordModal} sx={{ mt: 2, textTransform: 'none' }}>
              Change Password
            </Button>
            <Button variant="contained" onClick={handleOpenUpdateUserModal} sx={{ mt: 2, textTransform: 'none' }}>
              Update Profile
            </Button>
          </Box>
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

      {/* Cropper Dialog - Now using MUI Dialog components */}
      <Dialog open={showCropperModal} onClose={closeCropperModal} maxWidth="sm" fullWidth>
        <Typography variant="h6" sx={{ p: 2 }}>
          Crop Your Avatar
        </Typography>
        <DialogContent dividers sx={{ position: 'relative', width: '100%', height: 400, backgroundColor: '#333' }}>
          {imageSrc && (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              showGrid={false}
              restrictPosition={true}
            />
          )}{' '}
        </DialogContent>{' '}
        <DialogActions sx={{ flexDirection: 'column', alignItems: 'center', p: 2 }}>
          <Box sx={{ width: '80%', mb: 2 }}>
            <Typography gutterBottom>Zoom</Typography>
            <Slider
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              onChange={(_, value) => setZoom(value as number)}
              aria-labelledby="zoom-slider"
            />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-around', gap: 2, width: '100%' }}>
            <Button
              variant="outlined"
              onClick={closeCropperModal}
              disabled={uploadAvatarMutation.isPending}
              sx={{ width: '45%' }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleUploadCroppedImage}
              disabled={uploadAvatarMutation.isPending}
              sx={{ width: '45%' }}
            >
              {uploadAvatarMutation.isPending ? <CircularProgress size={24} /> : 'Upload'}
            </Button>
          </Box>
          {uploadAvatarMutation.isError && (
            <Typography color="error.main" sx={{ mt: 2, textAlign: 'center' }}>
              {uploadAvatarMutation.error.message || 'Error uploading image.'}
            </Typography>
          )}
        </DialogActions>
      </Dialog>

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
        onDelete={deleteFunction}
        successMessage={''}
        errorMessage={''}
        isLoadingDelete={false}
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
