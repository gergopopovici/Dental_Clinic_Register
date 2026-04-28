import { Avatar, Box, Card, Typography, CircularProgress } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import ErrorIcon from '@mui/icons-material/Error';
import { Navigate, useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { verifyAccount } from '../services/AuthorisationService';
import { useEffect, useState } from 'react';
import { genericBackground2 } from '../assets';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '../components/LanguageSelector';

function EmailConfirmation() {
  const [searchparams] = useSearchParams();
  const token = searchparams.get('token');
  const { t } = useTranslation();

  const verifyMutation = useMutation({
    mutationFn: verifyAccount,
  });

  const [hasMutated, setHasMutated] = useState(false);

  useEffect(() => {
    if (token && !hasMutated) {
      console.log('This is the token' + token);
      verifyMutation.mutate(token);
      setHasMutated(true);
    }
  }, [token, hasMutated, verifyMutation]);

  if (!token) {
    return <Navigate to="/login" replace={true} />;
  }

  let content;
  if (verifyMutation.isPending) {
    content = (
      <>
        <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
          <CircularProgress size={28} sx={{ color: 'white' }} />
        </Avatar>
        <Typography variant="body2" align="center" mt={2}>
          {t('verifyingEmail')}
        </Typography>
      </>
    );
  } else if (verifyMutation.isSuccess) {
    content = (
      <>
        <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
          <CheckIcon fontSize="large" />
        </Avatar>
        <Typography variant="h5" align="center" gutterBottom>
          {t('emailConfirmed')}
        </Typography>
        <Typography variant="body2" align="center" mb={3}>
          {t('accountVerified')}
        </Typography>
      </>
    );
  } else if (verifyMutation.isError) {
    content = (
      <>
        <Avatar sx={{ bgcolor: 'error.main', width: 56, height: 56 }}>
          <ErrorIcon fontSize="large" />
        </Avatar>
        <Typography variant="h5" align="center" color="error" gutterBottom>
          {t('verificationFailed')}
        </Typography>
        <Typography variant="body2" align="center" mb={3}>
          {t('emailConfirmationFailed')}
        </Typography>
      </>
    );
  }

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      minWidth="100vw"
      sx={{
        backgroundImage: genericBackground2,
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
      <Card sx={{ maxWidth: 400, width: '90%', p: 3 }}>
        <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
          {content}
        </Box>
        <Box component="footer" textAlign="center" width="100%">
          <Typography variant="body2">
            <a
              href="http://www.freepik.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'red', textDecoration: 'none' }}
            >
              Background designed by freepik.com
            </a>
          </Typography>
        </Box>
      </Card>
    </Box>
  );
}

export default EmailConfirmation;
