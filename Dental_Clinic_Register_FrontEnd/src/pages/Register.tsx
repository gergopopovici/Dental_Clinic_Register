import { Alert, Avatar, Box, Button, Card, CardContent, CircularProgress, Link, TextField, Typography } from '@mui/material';
import AppRegistrationIcon from '@mui/icons-material/AppRegistration';
import { FormEvent, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { RequestUserDTO } from '../models/User';
import { signup } from '../services/AuthorisationService';
import { AxiosError } from 'axios';
import { registerPageBackground } from '../assets';

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const registerMutation = useMutation({
    mutationFn: (data: RequestUserDTO) => signup(data),
    onSuccess: () => {
      setSuccessMessage('Your account has been successfully registered.');
      setErrorMessage('');
    },
    onError: (error: AxiosError<{ message: string }>) => {
      const message = error.response?.data?.message || 'An error occurred.';
      setErrorMessage(message);
      setSuccessMessage('');
    },
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password !== passwordConfirm) {
      setErrorMessage('Passwords do not match');
    }
    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters');
    }
    const data: RequestUserDTO = {
      username,
      password,
      email,
      phoneNumber,
      firstName,
      middleName,
      lastName,
    };
    registerMutation.mutate(data);
  };

  return (
    <Box
      display={'flex'}
      flexDirection="column"
      minHeight="100vh"
      minWidth="100vw"
      bgcolor="#f4f6f8"
      sx={{
        backgroundImage:registerPageBackground,
        width: '100%',
        height: '100%',
        backgroundRepeat: 'repeat',
        backgroundPosition: 'center',
        backgroundSize: 'contain'
      }}
    >
      <Box
        display="flex"
        flexGrow={1}
        justifyContent="center"
        alignItems="center"
      >
      <Card sx={{ maxWidth: 400, width: '90%', p: 3 }}>
        <Box display={'flex'} justifyContent={'center'} mb={2}>
          <Avatar sx={{ backgroundColor: 'primary.main', width: 56, height: 56 }}>
            <AppRegistrationIcon fontSize={'large'} />
          </Avatar>
        </Box>
        <CardContent>
          <Typography variant={'h5'} align={'center'} gutterBottom>
            Welcome to Our Clinic! Please fill out the form below!
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
              label={'username'}
              type={'text'}
              fullWidth={true}
              required={true}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              label={'password'}
              type={'password'}
              fullWidth={true}
              required={true}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              label={'Confirm Password'}
              type={'password'}
              fullWidth={true}
              required={true}
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              label={'email'}
              type={'text'}
              fullWidth={true}
              required={true}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              label={'Phone Number'}
              type={'text'}
              fullWidth={true}
              required={true}
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              label={'First Name'}
              type={'text'}
              fullWidth={true}
              required={true}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              label={'Middle Name'}
              type={'text'}
              fullWidth={true}
              required={false}
              value={middleName}
              onChange={(e) => setMiddleName(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              label={'Last Name'}
              type={'text'}
              fullWidth={true}
              required={true}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button
              type={'submit'}
              variant={'contained'}
              color={'primary'}
              fullWidth
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? <CircularProgress size={24} color="inherit" /> : 'Register'}
            </Button>
          </form>
          <Box component="footer" textAlign="center" py={2}>
            <Link
              href="http://www.vecteezy.com"
              target="_blank"
              rel="noopener noreferrer"
              underline="hover"
              color="red">
              Background designed by vecteezy.com
            </Link>
          </Box>
        </CardContent>
      </Card>
    </Box>
    </Box>
  );
}
export default Register;
