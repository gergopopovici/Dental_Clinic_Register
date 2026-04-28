import { FormEvent, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Link,
} from '@mui/material';
import LockResetIcon from '@mui/icons-material/LockReset';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { requestPasswordReset } from '../services/AuthorisationService';
import { genericBackground } from '../assets';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '../components/LanguageSelector';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const { t } = useTranslation();

  const resetMutation = useMutation({
    mutationFn: requestPasswordReset,
    onSuccess: () => {
      setSuccessMessage(t('passwordResetEmailSent'));
      setErrorMessage('');
    },
    onError: (error: AxiosError<{ message: string }>) => {
      const message = error.response?.data?.message || t('passwordResetFailed');
      setErrorMessage(message);
      setSuccessMessage('');
    },
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    resetMutation.mutate({ email });
  };

  return (
    <Box
      display={'flex'}
      flexDirection="column"
      minHeight="100vh"
      minWidth="100vw"
      bgcolor="#f4f6f8"
      sx={{
        backgroundImage: genericBackground,
        width: '100%',
        height: '100%',
        backgroundRepeat: 'repeat',
        backgroundPosition: 'center',
        backgroundSize: 'contain',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 24,
          right: 24,
          zIndex: 1000,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          borderRadius: '4px',
        }}
      >
        <LanguageSelector />
      </Box>
      <Box display="flex" flexGrow={1} justifyContent="center" alignItems="center">
        <Card sx={{ maxWidth: 400, width: '90%', p: 3 }}>
          <Box display={'flex'} justifyContent={'center'} mb={2}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
              <LockResetIcon fontSize={'large'} />
            </Avatar>
          </Box>
          <CardContent>
            <Typography variant={'h5'} align={'center'} gutterBottom>
              {t('forgotPassword')}
            </Typography>
            <Typography variant={'body2'} align={'center'} mb={3}>
              {t('passwordResetInstructions')}
            </Typography>

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

            <form onSubmit={handleSubmit}>
              <TextField
                label={t('emailAddress')}
                type={'email'}
                variant={'outlined'}
                fullWidth
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Button
                type={'submit'}
                variant={'contained'}
                color={'primary'}
                fullWidth
                disabled={resetMutation.isPending}
              >
                {resetMutation.isPending ? <CircularProgress size={24} color="inherit" /> : t('sendResetLink')}
              </Button>
              <Button
                variant="text"
                color="primary"
                fullWidth
                sx={{ mt: 2 }}
                onClick={() => {
                  window.location.href = '/login';
                }}
              >
                {t('backToLogin')}
              </Button>
            </form>
            <Box component="footer" textAlign="center" py={2}>
              <Link
                href="http://www.vecteezy.com"
                target="_blank"
                rel="noopener noreferrer"
                underline="hover"
                color="red"
              >
                Background designed by vecteezy.com
              </Link>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}

export default ForgotPassword;
