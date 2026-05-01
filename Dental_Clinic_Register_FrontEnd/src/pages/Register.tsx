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
import { useSearchParams } from 'react-router-dom';
import { Gender, RequestUserDTO } from '../models/User';
import { signup, registerDoctor } from '../services/AuthorisationService';
import { AxiosError } from 'axios';
import { registerPageBackground } from '../assets';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '../components/LanguageSelector';

function Register() {
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get('inviteToken');

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
  const [licenseNumber, setLicenseNumber] = useState('');
  const [specialisation, setSpecialisation] = useState('');

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const { t } = useTranslation();

  const registerMutation = useMutation({
    mutationFn: (data: RequestUserDTO) => signup(data),
    onSuccess: () => {
      setSuccessMessage(t('success.user.registered'));
      setErrorMessage('');
    },
    onError: (error: AxiosError<{ message: string }>) => {
      const message = error.response?.data?.message || 'error.unknown';
      setErrorMessage(t(message));
      setSuccessMessage('');
    },
  });

  const doctorRegisterMutation = useMutation({
    mutationFn: (data: RequestUserDTO) => registerDoctor(data, inviteToken as string),
    onSuccess: () => {
      setSuccessMessage(t('success.doctor.registered'));
      setErrorMessage('');
    },
    onError: (error: AxiosError<{ message: string }>) => {
      const message = error.response?.data?.message || 'error.unknown';
      setErrorMessage(t(message));
      setSuccessMessage('');
    },
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password !== passwordConfirm) {
      setErrorMessage(t('passwordsNotMatching'));
      return;
    }
    if (password.length < 8) {
      setErrorMessage(t('passwordTooShort'));
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
        setErrorMessage(t('errorMessage'));
        return;
      }
      const date = new Date(yearNum, monthNum - 1, dayNum);
      if (date.getFullYear() !== yearNum || date.getMonth() !== monthNum - 1 || date.getDate() !== dayNum) {
        setErrorMessage(t('errorMessage'));
        return;
      }
      const formattedMonth = String(monthNum).padStart(2, '0');
      const formattedDay = String(dayNum).padStart(2, '0');
      dateOfBirth = `${yearNum}-${formattedMonth}-${formattedDay}`;
    } catch (error) {
      console.error('Error formatting date of birth:', error);
      setErrorMessage(t('errorMessage'));
      return;
    }
    if (!gender) {
      setErrorMessage(t('errorMessage'));
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
      licenseNumber: inviteToken ? licenseNumber : undefined,
      specialisation: inviteToken ? specialisation : undefined,
      roles: inviteToken ? ['ROLE_DOCTOR'] : ['ROLE_PATIENT'],
    };

    if (inviteToken) {
      doctorRegisterMutation.mutate(data);
    } else {
      registerMutation.mutate(data);
    }
  };

  const handleGenderChange = (event: SelectChangeEvent<Gender | ''>) => {
    setGender(event.target.value as Gender);
  };

  const isPending = registerMutation.isPending || doctorRegisterMutation.isPending;

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
              {t('welcomeRegisterMessage')}
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
                {t('username')}:
              </Typography>
              <TextField
                label={t('username')}
                type={'text'}
                fullWidth={true}
                required={true}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Typography variant="body2" sx={{ mt: 1, mb: 1, fontWeight: 'bold' }}>
                {t('password')}:
              </Typography>
              <TextField
                label={t('password')}
                type={'password'}
                fullWidth={true}
                required={true}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Typography variant="body2" sx={{ mt: 1, mb: 1, fontWeight: 'bold' }}>
                {t('confirmPassword')}:
              </Typography>
              <TextField
                label={t('confirmPassword')}
                type={'password'}
                fullWidth={true}
                required={true}
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Typography variant="body2" sx={{ mt: 1, mb: 1, fontWeight: 'bold' }}>
                {t('email')}:
              </Typography>
              <TextField
                label={t('email')}
                type={'email'}
                fullWidth={true}
                required={true}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Typography variant="body2" sx={{ mt: 1, mb: 1, fontWeight: 'bold' }}>
                {t('phoneNumber')}:
              </Typography>
              <TextField
                label={t('phoneNumber')}
                type={'tel'}
                fullWidth={true}
                required={true}
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Typography variant="body2" sx={{ mt: 1, mb: 1, fontWeight: 'bold' }}>
                {t('firstName')}:
              </Typography>
              <TextField
                label={t('firstName')}
                type={'text'}
                fullWidth={true}
                required={true}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Typography variant="body2" sx={{ mt: 1, mb: 1, fontWeight: 'bold' }}>
                {t('middleName')}:
              </Typography>
              <TextField
                label={t('middleName')}
                type={'text'}
                fullWidth={true}
                required={false}
                value={middleName}
                onChange={(e) => setMiddleName(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Typography variant="body2" sx={{ mt: 1, mb: 1, fontWeight: 'bold' }}>
                {t('lastName')}:
              </Typography>
              <TextField
                label={t('lastName')}
                type={'text'}
                fullWidth={true}
                required={true}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Typography variant="body2" sx={{ mt: 1, mb: 1, fontWeight: 'bold' }}>
                {t('dateOfBirth')}:
              </Typography>
              <Box display="flex" gap={1} mb={2}>
                <TextField
                  label={t('day')}
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
                  label={t('month')}
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
                  label={t('year')}
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
                {t('gender')}:
              </Typography>
              <FormControl fullWidth sx={{ mb: 2 }} required>
                <InputLabel id="gender-select-label">{t('gender')}</InputLabel>
                <Select
                  labelId="gender-select-label"
                  id="gender-select"
                  value={gender}
                  label={t('gender')}
                  onChange={handleGenderChange}
                >
                  <MenuItem value="MALE">{t('male')}</MenuItem>
                  <MenuItem value="FEMALE">{t('female')}</MenuItem>
                  <MenuItem value="OTHER">{t('other')}</MenuItem>
                </Select>
              </FormControl>

              {/* DOCTOR SPECIFIC FIELDS */}
              {inviteToken && (
                <>
                  <Typography variant="body2" sx={{ mt: 1, mb: 1, fontWeight: 'bold' }}>
                    {t('licenseNumber')}:
                  </Typography>
                  <TextField
                    label={t('licenseNumber')}
                    type={'text'}
                    fullWidth={true}
                    required={true}
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    sx={{ mb: 2 }}
                  />
                  <Typography variant="body2" sx={{ mt: 1, mb: 1, fontWeight: 'bold' }}>
                    {t('specialisation')}:
                  </Typography>
                  <TextField
                    label={t('specialisation')}
                    type={'text'}
                    fullWidth={true}
                    required={true}
                    value={specialisation}
                    onChange={(e) => setSpecialisation(e.target.value)}
                    sx={{ mb: 2 }}
                  />
                </>
              )}

              <Button type={'submit'} variant={'contained'} color={'primary'} fullWidth disabled={isPending}>
                {isPending ? <CircularProgress size={24} color="inherit" /> : t('registerButton')}
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
                {t('alreadyHaveAnAccount')}
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
