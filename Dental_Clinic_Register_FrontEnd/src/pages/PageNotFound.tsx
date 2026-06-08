import React from 'react';
import { Box, Button, Typography, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { pageNotFound } from '../assets';
import { ThemeToggleButton } from '../components/ThemeToggleButton';
import LanguageSelector from '../components/LanguageSelector';

function NotFoundPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        bgcolor: 'background.default',
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
          width: '100%',
          height: '80%',
          backgroundImage: pageNotFound,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundSize: 'contain',
        }}
      />

      <Button variant="contained" onClick={() => navigate('/dashboard')} sx={{ mt: 3, px: 4, py: 1.5 }}>
        {t('navDashboard')}
      </Button>

      <Typography variant="body2" sx={{ mt: 2 }}>
        <Link href="http://www.freepik.com" target="_blank" rel="noopener noreferrer" underline="hover">
          Designed by Freepik
        </Link>
      </Typography>
    </Box>
  );
}

export default NotFoundPage;
