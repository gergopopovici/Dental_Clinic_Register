import { useState } from 'react';
import { Box, Button, Link, TextField, Typography } from '@mui/material';
import { loginLeftSvg, loginRightSvg } from '../assets';


function LoginPage() {
  const [hoveredSection, setHoveredSection] = useState<'login' | 'signup' | null>(null);

  return (
    <Box sx={{ position: 'relative', height: '100vh', width: '100vw' }}>
      <Box
        sx={{
          display: 'flex',
          height: '100%',
          width: '100%',
          fontFamily: 'Arial, sans-serif',
          overflow: 'hidden',
        }}
      >
        {/* Login Section (Left Side) */}
        <Box
          onMouseEnter={() => setHoveredSection('login')}
          onMouseLeave={() => setHoveredSection(null)}
          sx={{
            flex: hoveredSection === 'login' ? 2 : 1,
            transition: 'flex 0.5s ease, opacity 0.5s ease',
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            color: 'black',
            opacity: hoveredSection === 'signup' ? 0.3 : 1,
            backgroundColor: '#f9f9f9',
            backgroundImage:loginLeftSvg
          }}
        >
          <Typography variant="h4" gutterBottom>
            Welcome Back!
          </Typography>
          <Box
            component="form"
            sx={{
              width: '100%',
              maxWidth: 300,
              display: 'flex',
              flexDirection: 'column',
              color: 'black',
              backgroundColor: 'rgba(255,255,255,0.8)',
              padding: 3,
              borderRadius: 2,
              backdropFilter: 'blur(5px)',
            }}
          >
            <TextField label="Username" type="text" fullWidth required sx={{ mb: 2 }}/>
            <TextField label="Password" type="password" fullWidth required sx={{ mb: 2 }}/>
            <Box sx={{ width: '100%', textAlign: 'right', mb: 2 }}>
              <Link href="#" underline="hover">
                Forgot your password?
              </Link>
            </Box>
            <Button variant="contained" color="primary" type="submit">
              Login
            </Button>
            <Typography variant="caption" sx={{ mt: 2, color: 'grey.600' }}>
              Design from{' '}
              <Link href="https://freesvg.org/teeth-seamless-pattern" target="_blank" rel="noopener noreferrer">
                publicdomainvectors.org
              </Link>{' '}
              (Public Domain)
            </Typography>
          </Box>
        </Box>

        {/* Sign Up Section (Right Side) */}
        <Box
          onMouseEnter={() => setHoveredSection('signup')}
          onMouseLeave={() => setHoveredSection(null)}
          sx={{
            flex: hoveredSection === 'signup' ? 2 : 1,
            transition: 'flex 0.5s ease, opacity 0.5s ease',
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            color: 'black',
            opacity: hoveredSection === 'login' ? 0.3 : 1,
            backgroundColor: '#e0f7fa',
            backgroundImage: loginRightSvg,
          }}
        >
          <Box sx={{width: '100%',
            maxWidth: 300,
            display: 'flex',
            flexDirection: 'column',
            color: 'black',
            backgroundColor: 'rgba(255,255,255,0.8)',
            padding: 3,
            borderRadius: 2,
            backdropFilter: 'blur(5px)'}}>
          <Typography variant="h4" gutterBottom>
            Are you new to our clinic?
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Create an account to get started!
          </Typography>
          <Button variant="outlined" onClick={() => console.log('Redirecting...')}>
            Sign Up
          </Button>

          <Typography variant="caption" sx={{ mt: 2, color: 'grey.600' }}>
            Designed by{' '}
            <Link href="http://www.freepik.com" target="_blank" rel="noopener noreferrer">
              macrovector / Freepik
            </Link>
          </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default LoginPage;
