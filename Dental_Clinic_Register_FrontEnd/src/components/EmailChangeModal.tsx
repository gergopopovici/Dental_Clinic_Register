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
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const renderContent = () => {
    switch (step) {
      case 'initial':
        return (
          <Box>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {t('clickSendCode')}
            </Typography>
            <Button variant="contained" onClick={onRequestCode} disabled={isLoading} sx={{ textTransform: 'none' }}>
              {t('sendCode')}
            </Button>
          </Box>
        );
      case 'verifyCode':
        return (
          <form onSubmit={onVerifyCodeSubmit}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {t('pleaseentertheverificationcode')}
            </Typography>
            <TextField
              label={t('verificationCode')}
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
                  {t('back')}
                </Button>
              )}
              <Button onClick={onClose} disabled={isLoading} sx={{ textTransform: 'none' }}>
                {t('cancel')}
              </Button>
              <Button type="submit" variant="contained" disabled={isLoading} sx={{ textTransform: 'none' }}>
                {t('verifyCode')}
              </Button>
            </DialogActions>
          </form>
        );
      case 'enterNewEmailAddress':
        return (
          <form onSubmit={onNewEmailSubmit}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {t('pleaseenterthenewemailaddress')}
            </Typography>
            <TextField
              label={t('emailAddress')}
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
                  {t('back')}
                </Button>
              )}
              <Button onClick={onClose} disabled={isLoading} sx={{ textTransform: 'none' }}>
                {t('cancel')}
              </Button>
              <Button type="submit" variant="contained" disabled={isLoading} sx={{ textTransform: 'none' }}>
                {t('saveEmailAddress')}
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
        return t('changeEmailAddress');
      case 'verifyCode':
        return t('verifyEmailChange');
      case 'enterNewEmailAddress':
        return t('setNewEmailAddress');
      default:
        return t('emailSettings');
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
            <Typography sx={{ ml: 1 }}>{t('processing')}</Typography>
          </Box>
        )}
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}

export default EmailChangeModal;
