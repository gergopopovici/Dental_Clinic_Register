import React, { useState } from 'react';
import {
  Box,
  Button,
  Link,
  TextField,
  Typography,
  CircularProgress,
  FormControlLabel,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Paper,
} from '@mui/material';
import { loginLeftSvg, loginRightSvg } from '../assets';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { loginIn, resendActivation } from '../services/AuthorisationService';
import { getCurrentUserDetails } from '../services/UserService';
import { Login, LoginResponse } from '../models/Login';
import { useUser, UserDetails } from '../context/UserContext';
import axios from 'axios';
import LanguageSelector from '../components/LanguageSelector';
import { ThemeToggleButton } from '../components/ThemeToggleButton';
import { useTranslation } from 'react-i18next';
import { MessageResponse } from '../models/MessageResponse';

function LoginPage() {
  const [hoveredSection, setHoveredSection] = useState<'login' | 'signup' | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [resendDialogOpen, setResendDialogOpen] = useState(false);
  const [resendEmail, setResendEmail] = useState('');
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { login } = useUser();

  const fetchUserDetailsMutation = useMutation<UserDetails, Error>({
    mutationFn: () => getCurrentUserDetails(),
    onSuccess: (userDetails) => {
      login(userDetails);
      setTimeout(() => {
        if (userDetails.roles?.includes('ROLE_ADMIN')) {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      }, 100);
    },
    onError: () => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('refresh_token');
      }
      alert(t('loginSuccessfulButFailedToFetchUserData'));
      navigate('/login');
    },
  });

  const loginMutation = useMutation<LoginResponse, Error, Login>({
    mutationFn: (loginData: Login) => loginIn(loginData),
    onSuccess: (data) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('refresh_token', data.refreshToken);
      }
      fetchUserDetailsMutation.mutate();
    },
    onError: (error) => {
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        alert(`${t('loginFailed')}: ${error.response.data.message}`);
      } else {
        alert(t('loginCredentialsInvalid'));
      }
    },
  });

  const resendMutation = useMutation<MessageResponse, Error, string>({
    mutationFn: (email: string) => resendActivation(email),
    onSuccess: () => {
      alert(t('success.activation.resent'));
      setResendDialogOpen(false);
      setResendEmail('');
    },
    onError: () => {
      alert(t('error.email.required'));
    },
  });

  const isLoading = loginMutation.isPending || fetchUserDetailsMutation.isPending;

  const handleLoginSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    loginMutation.mutate({ username, password });
  };

  const handleResendSubmit = () => {
    if (!resendEmail) return;
    resendMutation.mutate(resendEmail);
  };

  const sharedSectionStyles = {
    transition: 'width 0.5s ease-in-out, opacity 0.5s ease-in-out',
    padding: '32px',
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    height: '100%',
    minHeight: '100vh',
    backgroundColor: 'transparent',
    backgroundBlendMode: 'normal' as const,
    filter: 'none',
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          minWidth: '100vw',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          bgcolor: 'background.default',
        }}
      >
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          {t('loggingIn')}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        bgcolor: 'transparent',
        '& img, & svg': { filter: 'none' },
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 24,
          right: 24,
          zIndex: 1000,
          display: 'flex',
          gap: 1,
          alignItems: 'center',
        }}
      >
        <ThemeToggleButton />
        <LanguageSelector />
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          minHeight: '100%',
          width: '100%',
        }}
      >
        <Box
          onMouseEnter={() => setHoveredSection('login')}
          onMouseLeave={() => setHoveredSection(null)}
          sx={{
            ...sharedSectionStyles,
            width: hoveredSection === 'login' ? '66.67%' : hoveredSection === 'signup' ? '33.33%' : '50%',
            opacity: hoveredSection === 'signup' ? 0.5 : 1,
            backgroundImage: loginLeftSvg,
            backgroundColor: '#ffffff',
          }}
        >
          <Paper
            component="form"
            onSubmit={handleLoginSubmit}
            elevation={3}
            sx={{
              width: '100%',
              maxWidth: 320,
              display: 'flex',
              flexDirection: 'column',
              padding: 4,
              borderRadius: 2,
              bgcolor: 'background.paper',
            }}
          >
            <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', mb: 3 }}>
              {t('welcomeBack')}
            </Typography>
            <TextField
              label={t('username')}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              fullWidth
              required
              sx={{ mb: 2 }}
            />
            <TextField
              label={t('password')}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              required
              sx={{ mb: 2 }}
            />
            <FormControlLabel
              control={<Checkbox checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />}
              label={t('rememberMe')}
            />
            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', mb: 2, mt: 1 }}>
              <Link
                component="button"
                type="button"
                variant="body2"
                onClick={(e) => {
                  e.preventDefault();
                  setResendDialogOpen(true);
                }}
                underline="hover"
              >
                {t('resendActivationLink')}
              </Link>
              <Link href="/forgot-password" variant="body2" underline="hover">
                {t('forgotPassword')}
              </Link>
            </Box>
            <Button variant="contained" type="submit" sx={{ py: 1.5, fontWeight: 'bold' }}>
              {t('login')}
            </Button>
            <Box display="flex" justifyContent="center" mt={2}>
              <Typography variant="body2" sx={{ textAlign: 'center' }}>
                <Link href="http://www.freepik.com" target="_blank" rel="noopener noreferrer" underline="hover">
                  Design from publicdomainvectors.org
                </Link>
              </Typography>
            </Box>
          </Paper>
        </Box>

        <Box
          onMouseEnter={() => setHoveredSection('signup')}
          onMouseLeave={() => setHoveredSection(null)}
          sx={{
            ...sharedSectionStyles,
            width: hoveredSection === 'signup' ? '66.67%' : hoveredSection === 'login' ? '33.33%' : '50%',
            opacity: hoveredSection === 'login' ? 0.5 : 1,
            backgroundImage: loginRightSvg,
          }}
        >
          <Paper
            elevation={3}
            sx={{
              width: '100%',
              maxWidth: 320,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              padding: 4,
              borderRadius: 2,
              bgcolor: 'background.paper',
            }}
          >
            <Typography variant="h4" gutterBottom>
              {t('newHere')}
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              {t('createAccount')}
            </Typography>
            <Button
              variant="outlined"
              onClick={() => navigate('/register')}
              sx={{ py: 1.5, px: 5, fontWeight: 'bold' }}
            >
              {t('signUp')}
            </Button>
            <Typography variant="body2" sx={{ mt: 2 }}>
              <Link href="http://www.freepik.com" target="_blank" rel="noopener noreferrer" underline="hover">
                Designed by macrovector / Freepik
              </Link>
            </Typography>
          </Paper>
        </Box>
      </Box>

      <Dialog open={resendDialogOpen} onClose={() => setResendDialogOpen(false)}>
        <DialogTitle>{t('resendActivationTitle')}</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>{t('resendActivationDescription')}</DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label={t('emailAddress')}
            type="email"
            fullWidth
            variant="outlined"
            value={resendEmail}
            onChange={(e) => setResendEmail(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setResendDialogOpen(false)}>{t('cancel')}</Button>
          <Button
            onClick={handleResendSubmit}
            variant="contained"
            disabled={resendMutation.isPending || !resendEmail}
            sx={{ fontWeight: 'bold' }}
          >
            {resendMutation.isPending ? <CircularProgress size={24} color="inherit" /> : t('send')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default LoginPage;
