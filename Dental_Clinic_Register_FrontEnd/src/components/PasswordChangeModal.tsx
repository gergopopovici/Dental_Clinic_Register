import React from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material';

interface PasswordChangeModalProps {
  open: boolean;
  onClose: () => void;
  step: 'initial' | 'verifyCode' | 'enterNewPassword';
  onBack?: () => void;

  onRequestCode: () => void;
  isLoadingRequest: boolean;

  verificationCode: string;

  // eslint-disable-next-line no-unused-vars
  onVerificationCodeChange: (code: string) => void;
  // eslint-disable-next-line no-unused-vars
  onVerifyCodeSubmit: (e: React.FormEvent) => void;
  isLoadingVerify: boolean;

  newPassword: string;
  // eslint-disable-next-line no-unused-vars
  onNewPasswordChange: (password: string) => void;
  confirmNewPassword: string;
  // eslint-disable-next-line no-unused-vars
  onConfirmNewPasswordChange: (password: string) => void;
  // eslint-disable-next-line no-unused-vars
  onNewPasswordSubmit: (e: React.FormEvent) => void;
  isLoadingUpdate: boolean;

  successMessage: string;
  errorMessage: string;
}

function PasswordChangeModal({
  open,
  onClose,
  onBack,
  step,
  onRequestCode,
  isLoadingRequest,
  verificationCode,
  onVerificationCodeChange,
  onVerifyCodeSubmit,
  isLoadingVerify,
  newPassword,
  onNewPasswordChange,
  confirmNewPassword,
  onConfirmNewPasswordChange,
  onNewPasswordSubmit,
  isLoadingUpdate,
  successMessage,
  errorMessage,
}: PasswordChangeModalProps) {
  const isLoading = isLoadingRequest || isLoadingVerify || isLoadingUpdate;

  const renderContent = () => {
    switch (step) {
      case 'initial':
        return (
          <Box>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Click 'Send Code' to receive a verification code on your registered email address to change your password.
            </Typography>
            <Button variant="contained" onClick={onRequestCode} disabled={isLoading} sx={{ textTransform: 'none' }}>
              Send Code
            </Button>
          </Box>
        );

      case 'verifyCode':
        return (
          <form onSubmit={onVerifyCodeSubmit}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Please enter the 6-digit verification code sent to your **registered** email.
            </Typography>
            <TextField
              label="Verification Code"
              value={verificationCode}
              onChange={(e) => onVerificationCodeChange(e.target.value)}
              fullWidth
              required
              margin="normal"
              disabled={isLoading}
            />
            <DialogActions sx={{ pt: 2, pb: 0, px: 0 }}>
              {onBack && (
                <Button onClick={onBack} disabled={isLoading} sx={{ textTransform: 'none' }}>
                  Back
                </Button>
              )}
              <Button onClick={onClose} disabled={isLoading} sx={{ textTransform: 'none' }}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" disabled={isLoading} sx={{ textTransform: 'none' }}>
                Verify Code
              </Button>
            </DialogActions>
          </form>
        );
      case 'enterNewPassword':
        return (
          <form onSubmit={onNewPasswordSubmit}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Enter and confirm your new password.
            </Typography>
            <TextField
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => onNewPasswordChange(e.target.value)}
              fullWidth
              required
              margin="normal"
              disabled={isLoading}
            />
            <TextField
              label="Confirm New Password"
              type="password"
              value={confirmNewPassword}
              onChange={(e) => onConfirmNewPasswordChange(e.target.value)}
              fullWidth
              required
              margin="normal"
              disabled={isLoading}
            />
            <DialogActions sx={{ pt: 2, pb: 0, px: 0 }}>
              {onBack && (
                <Button onClick={onBack} disabled={isLoading} sx={{ textTransform: 'none' }}>
                  Back
                </Button>
                )}
              <Button onClick={onClose} disabled={isLoading} sx={{ textTransform: 'none' }}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" disabled={isLoading} sx={{ textTransform: 'none' }}>
                Save Password
              </Button>
            </DialogActions>
          </form>
        );
      default:
        return null;
    }
  };

  const getTitle = () => {
    switch (step) {
      case 'initial':
        return 'Change Password';
      case 'verifyCode':
        return 'Verify Password Change';
      case 'enterNewPassword':
        return 'Set New Password';
      default:
        return 'Password Settings';
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{getTitle()}</DialogTitle>
      <DialogContent dividers>
        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMessage}
          </Alert>
        )}
        {errorMessage && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Alert>
        )}
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <CircularProgress size={24} />
            <Typography sx={{ ml: 1 }}>Processing...</Typography>
          </Box>
        )}
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}

export default PasswordChangeModal;
