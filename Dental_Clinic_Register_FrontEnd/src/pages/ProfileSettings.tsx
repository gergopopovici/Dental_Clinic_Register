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
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  const queryClient = useQueryClient();

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
      setSuccessMessage(t('verificationCodeSent'));
      setErrorMessage('');
      setPasswordChangeStep('verifyCode');
    },
    onError: (error: Error) => {
      setErrorMessage(t('failedToSendVerificationCode') + (error.message ? `: ${error.message}` : ''));
      setSuccessMessage('');
    },
  });

  const requestEmailMutation = useMutation({
    mutationFn: emailChangeRequest,
    onSuccess: () => {
      setSuccessMessage(t('verificationCodeSent'));
      setErrorMessage('');
      setEmailChangeStep('verifyCode');
    },
    onError: (error: Error) => {
      setErrorMessage(t('failedToSendVerificationCode') + (error.message ? `: ${error.message}` : ''));
      setSuccessMessage('');
    },
  });

  const verifyCodeMutation = useMutation({
    mutationFn: verifyPasswordChangeCode,
    onSuccess: () => {
      setSuccessMessage(t('codeVerifiedPassword'));
      setErrorMessage('');
      setPasswordChangeStep('enterNewPassword');
    },
    onError: (error: Error) => {
      setErrorMessage(t('failedToVerifyCode') + (error.message ? `: ${error.message}` : ''));
      setSuccessMessage('');
    },
  });

  const verifyEmailAddressMutation = useMutation({
    mutationFn: emailChangeCodeVerification,
    onSuccess: () => {
      setSuccessMessage(t('codeVerifiedEmail'));
      setErrorMessage('');
      setEmailChangeStep('enterNewEmailAddress');
    },
    onError: (error: Error) => {
      setErrorMessage(t('failedtoSetEmail') + (error.message ? `: ${error.message}` : ''));
      setSuccessMessage('');
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: async () => {
      setSuccessMessage(t('accountDeleted'));
      setErrorMessage('');
      setIsDeleteModalOpen(false);
      await signOut();
      logout();
      navigate('/login');
    },
    onError: (error: Error) => {
      setErrorMessage(t('failedToDeleteAccount') + (error.message ? `: ${error.message}` : ''));
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
      setSuccessMessage(t('passwordUpdated'));
      setErrorMessage('');
      setIsPasswordModalOpen(false);
      setPasswordChangeStep('initial');
      setVerificationCode('');
      setNewPassword('');
      setConfirmNewPassword('');
      await refreshUser();
    },
    onError: (error: Error) => {
      setErrorMessage(t('failedToUpdatePassword') + (error.message ? `: ${error.message}` : ''));
      setSuccessMessage('');
    },
  });

  const updateEmailMutation = useMutation({
    mutationFn: updateEmail,
    onSuccess: async () => {
      setSuccessMessage(t('emailUpdated'));
      setErrorMessage('');
      setIsEmailChangeModalOpen(false);
      setEmailChangeStep('initial');
      setVerificationCode('');
      setNewEmail('');
      await refreshUser();
    },
    onError: (error: Error) => {
      setErrorMessage(t('failedToUpdateEmail') + (error.message ? `: ${error.message}` : ''));
      setSuccessMessage('');
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: updateUser,
    onSuccess: async () => {
      setSuccessMessage(t('userDetailsUpdated'));
      setErrorMessage('');
      setIsUpdateUserModalOpen(false);
      await queryClient.invalidateQueries({ queryKey: ['user'] });

      if (refreshUser) {
        await refreshUser();
      }
    },
    onError: (error: Error) => {
      console.error('Error updating user details:', error);
      setErrorMessage(t('failedToUpdateUserDetails') + (error.message ? `: ${error.message}` : ''));
      setSuccessMessage('');
    },
  });

  const uploadAvatarMutation = useMutation({
    mutationFn: uploadAvatar,
    onSuccess: async () => {
      setSuccessMessage(t('avatarUploaded'));
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
      setErrorMessage(t('userNotFound'));
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
      setErrorMessage(t('pleaseEnterVerificationCode'));
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
      setErrorMessage(t('pleaseEnterVerificationCode'));
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
      setErrorMessage(t('passwordsNotMatching'));
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      setErrorMessage(t('passwordTooShort'));
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
      setErrorMessage(t('emailIsRequired'));
      return;
    }
    if (!isValidEmail(newEmail)) {
      setErrorMessage(t('invalidEmailFormat'));
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
        setErrorMessage(t('selectImageFile'));
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
      setErrorMessage(t('noImageOrCropAreaDefined'));
      return;
    }
    if (typeof imageSrc !== 'string') {
      setErrorMessage(t('imageNotString'));
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
      setErrorMessage(t('failedToUpload') + (error instanceof Error && error.message ? `: ${error.message}` : ''));
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
      ? user.roles
          .map((role) => {
            const roleKey = role.replace('ROLE_', '').toLowerCase();
            return t(roleKey);
          })
          .join(', ')
      : t('noRoles');

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
            {t('AccountSettings')}
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
                {t('firstName')}
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
                  {t('middleName')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user.middleName}
                </Typography>
              </Box>
            ) : (
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 'bold', marginBottom: '4px', color: 'black' }}>
                  {t('middleName')}
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
                {t('lastName')}
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
                {t('phoneNumber')}
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
                {t('gender')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user.gender === 'FEMALE' ? t('female') : user.gender === 'MALE' ? t('male') : t('other')}
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
                {t('email')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user.email}
              </Typography>
            </Box>
            <Button variant="contained" onClick={handleOpenEmailModal} sx={{ textTransform: 'none' }}>
              {t('change')}
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
              {t('changePassword')}
            </Button>
            <Button variant="contained" onClick={handleOpenUpdateUserModal} sx={{ mt: 2, textTransform: 'none' }}>
              {t('updateProfile')}
            </Button>
          </Box>
        </Box>

        <Box sx={{ width: '100%', mt: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
            {t('deleteAccount')}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ marginBottom: '16px' }}>
            {t('wouldyouliketodeletetheaccount')}
          </Typography>
          <Button
            variant="contained"
            onClick={handleOpenDeleteModal}
            sx={{ mt: 2, textTransform: 'none' }}
            color="error"
          >
            {t('iwanttodeletetheaccount')}
          </Button>
        </Box>
      </Box>

      <Dialog open={showCropperModal} onClose={closeCropperModal} maxWidth="sm" fullWidth>
        <Typography variant="h6" sx={{ p: 2 }}>
          {t('cropYourAvatar')}
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
            <Typography gutterBottom>{t('zoom')}</Typography>
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
              {t('cancel')}
            </Button>
            <Button
              variant="contained"
              onClick={handleUploadCroppedImage}
              disabled={uploadAvatarMutation.isPending}
              sx={{ width: '45%' }}
            >
              {uploadAvatarMutation.isPending ? <CircularProgress size={24} /> : t('upload')}
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
        isLoadingDelete={deleteUserMutation.isPending}
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
