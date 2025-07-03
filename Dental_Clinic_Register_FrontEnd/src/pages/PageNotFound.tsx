import React from 'react';
import { Box, Typography, Link } from '@mui/material';
import { pageNotFound } from '../assets';

function NotFoundPage() {
  return (
    <Box
      sx={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        bgcolor: '#fff',
        overflow: 'hidden',
      }}
    >
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
      <Typography variant="body2" sx={{ mt: 2, color: 'red' }}>
        <Link href="http://www.freepik.com" target="_blank" rel="noopener noreferrer" underline="hover" color="red">
          Designed by Freepik
        </Link>
      </Typography>
    </Box>
  );
}

export default NotFoundPage;
