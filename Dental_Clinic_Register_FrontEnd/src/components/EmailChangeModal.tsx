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
import React from 'react';
interface EmailChangeModalProps {
  open: boolean;
  onClose: () => void;
  step: 'initial' | 'verifyCode' | 'enterNewEmailAddress';
  onBack?: () => void;

  onRequestCode: () => void;
  isLoadingRequest: boolean;

  verificationCode: string;
  // eslint-disable-next-line no-unused-vars
  onVerificationCodeChange: (code: string) => void;
  // eslint-disable-next-line no-unused-vars
  onVerifyCodeSubmit: (e: React.FormEvent) => void;
  isLoadingVerify: boolean;

  newEmail: string;
  // eslint-disable-next-line no-unused-vars
  onNewEmailChange: (email: string) => void;
  // eslint-disable-next-line no-unused-vars
  onNewEmailSubmit: (e: React.FormEvent) => void;

  isLoadingUpdate: boolean;

  successMessage: string;
  errorMessage: string;
}
function EmailChangeModal({
  open,
  onClose,
  step,
  onBack,
  onRequestCode,
  isLoadingRequest,
  verificationCode,
  onVerificationCodeChange,
  onVerifyCodeSubmit,
  isLoadingVerify,
  newEmail,
  onNewEmailChange,
  onNewEmailSubmit,
  isLoadingUpdate,
  successMessage,
  errorMessage,
}: EmailChangeModalProps) {
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
      case 'enterNewEmailAddress':
        return (
          <form onSubmit={onNewEmailSubmit}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Enter your new Email address
            </Typography>
            <TextField
              label="Email Address"
              value={newEmail}
              fullWidth
              required
              margin="normal"
              disabled={isLoading}
              onChange={(e) => onNewEmailChange(e.target.value)}
            />
            <DialogActions sx={{ pt: 2, pb: 0, px: 0 }}>
              {onBack && (
                <Button onSubmit={onClose} disabled={isLoading} sx={{ textTransform: 'none' }}>
                  Back
                </Button>
              )}
              <Button onClick={onClose} disabled={isLoading} sx={{ textTransform: 'none' }}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" disabled={isLoading} sx={{ textTransform: 'none' }}>
                Save Email Address
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
        return 'Change Email Address';
      case 'verifyCode':
        return 'Verify Email Change';
      case 'enterNewEmailAddress':
        return 'Set New Email Address';
      default:
        return 'Email Settings';
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

export default EmailChangeModal;
