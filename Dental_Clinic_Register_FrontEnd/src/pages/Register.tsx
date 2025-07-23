import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  FormControl,
  InputLabel,
  Link,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
} from '@mui/material';
import AppRegistrationIcon from '@mui/icons-material/AppRegistration';
import { FormEvent, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Gender, RequestUserDTO } from '../models/User';
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
  const [dobDay, setDobDay] = useState('');
  const [dobMonth, setDobMonth] = useState('');
  const [dobYear, setDobYear] = useState('');
  const [gender, setGender] = useState<Gender | ''>('');
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
      return;
    }
    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters');
      return;
    }
    let dateOfBirth: string | null = null;
    try {
      const yearNum = parseInt(dobYear, 10);
      const monthNum = parseInt(dobMonth, 10);
      const dayNum = parseInt(dobDay, 10);

      if (
        isNaN(yearNum) ||
        isNaN(monthNum) ||
        isNaN(dayNum) ||
        monthNum < 1 ||
        monthNum > 12 ||
        dayNum < 1 ||
        dayNum > 31
      ) {
        setErrorMessage('Please enter a valid date of birth.');
        return;
      }
      const date = new Date(yearNum, monthNum - 1, dayNum);
      if (date.getFullYear() !== yearNum || date.getMonth() !== monthNum - 1 || date.getDate() !== dayNum) {
        setErrorMessage('Please enter a valid date of birth (e.g., Feb 30th is invalid).');
        return;
      }
      const formattedMonth = String(monthNum).padStart(2, '0');
      const formattedDay = String(dayNum).padStart(2, '0');
      dateOfBirth = `${yearNum}-${formattedMonth}-${formattedDay}`;
    } catch (error) {
      console.error('Error formatting date of birth:', error);
      setErrorMessage('Invalid date of birth format.');
      return;
    }
    if (!gender) {
      setErrorMessage('Please select your gender.');
      return;
    }
    const data: RequestUserDTO = {
      username,
      password,
      email,
      phoneNumber,
      firstName,
      middleName,
      lastName,
      dateOfBirth,
      gender,
      roles: ['ROLE_PATIENT'],
    };
    registerMutation.mutate(data);
  };

  const handleGenderChange = (event: SelectChangeEvent<Gender | ''>) => {
    setGender(event.target.value as Gender);
  };

  return (
    <Box
      display={'flex'}
      flexDirection="column"
      minHeight="100vh"
      minWidth="100vw"
      sx={{
        backgroundImage: registerPageBackground,
        backgroundColor: '#f4f6f8',
        backgroundRepeat: 'repeat',
        backgroundPosition: 'top left',
        backgroundSize: '800px 800px',
        backgroundAttachment: 'scroll',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(244, 246, 248, 0.7)',
          zIndex: 1,
        },
        position: 'relative',
        overflow: 'auto',
      }}
    >
      <Box
        display="flex"
        flexGrow={1}
        justifyContent="center"
        alignItems="center"
        sx={{
          position: 'relative',
          zIndex: 2,
          padding: '20px',
          minHeight: '100vh',
        }}
      >
        <Card
          sx={{
            maxWidth: 400,
            width: '90%',
            p: 3,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            borderRadius: 2,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
          }}
        >
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
              <Typography variant="body2" sx={{ mt: 1, mb: 1, fontWeight: 'bold' }}>
                User name:
              </Typography>
              <TextField
                label={'User name'}
                type={'text'}
                fullWidth={true}
                required={true}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Typography variant="body2" sx={{ mt: 1, mb: 1, fontWeight: 'bold' }}>
                Password:
              </Typography>
              <TextField
                label={'Password'}
                type={'password'}
                fullWidth={true}
                required={true}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Typography variant="body2" sx={{ mt: 1, mb: 1, fontWeight: 'bold' }}>
                Confirm Password:
              </Typography>
              <TextField
                label={'Confirm Password'}
                type={'password'}
                fullWidth={true}
                required={true}
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Typography variant="body2" sx={{ mt: 1, mb: 1, fontWeight: 'bold' }}>
                Email:
              </Typography>
              <TextField
                label={'Email'}
                type={'email'}
                fullWidth={true}
                required={true}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Typography variant="body2" sx={{ mt: 1, mb: 1, fontWeight: 'bold' }}>
                Phone Number:
              </Typography>
              <TextField
                label={'Phone Number'}
                type={'tel'}
                fullWidth={true}
                required={true}
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Typography variant="body2" sx={{ mt: 1, mb: 1, fontWeight: 'bold' }}>
                First Name:
              </Typography>
              <TextField
                label={'First Name'}
                type={'text'}
                fullWidth={true}
                required={true}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Typography variant="body2" sx={{ mt: 1, mb: 1, fontWeight: 'bold' }}>
                Middle Name:
              </Typography>
              <TextField
                label={'Middle Name'}
                type={'text'}
                fullWidth={true}
                required={false}
                value={middleName}
                onChange={(e) => setMiddleName(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Typography variant="body2" sx={{ mt: 1, mb: 1, fontWeight: 'bold' }}>
                Last Name:
              </Typography>
              <TextField
                label={'Last Name'}
                type={'text'}
                fullWidth={true}
                required={true}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Typography variant="body2" sx={{ mt: 1, mb: 1, fontWeight: 'bold' }}>
                Date of Birth:
              </Typography>
              <Box display="flex" gap={1} mb={2}>
                <TextField
                  label="Day"
                  type="number"
                  InputProps={{
                    inputProps: {
                      min: 1,
                      max: 31,
                    },
                  }}
                  value={dobDay}
                  onChange={(e) => setDobDay(e.target.value)}
                  sx={{ width: '30%' }}
                  required
                />
                <TextField
                  label="Month"
                  type="number"
                  InputProps={{
                    inputProps: {
                      min: 1,
                      max: 12,
                    },
                  }}
                  value={dobMonth}
                  onChange={(e) => setDobMonth(e.target.value)}
                  sx={{ width: '30%' }}
                  required
                />
                <TextField
                  label="Year"
                  type="number"
                  InputProps={{
                    inputProps: {
                      min: 1900,
                      max: new Date().getFullYear(),
                    },
                  }}
                  value={dobYear}
                  onChange={(e) => setDobYear(e.target.value)}
                  sx={{ width: '40%' }}
                  required
                />
              </Box>
              <Typography variant="body2" sx={{ mt: 1, mb: 1, fontWeight: 'bold' }}>
                Gender:
              </Typography>
              <FormControl fullWidth sx={{ mb: 2 }} required>
                <InputLabel id="gender-select-label">Gender</InputLabel>
                <Select
                  labelId="gender-select-label"
                  id="gender-select"
                  value={gender}
                  label="Gender"
                  onChange={handleGenderChange}
                >
                  <MenuItem value="MALE">Male</MenuItem>
                  <MenuItem value="FEMALE">Female</MenuItem>
                  <MenuItem value="OTHER">Other</MenuItem>
                </Select>
              </FormControl>
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

export default Register;
