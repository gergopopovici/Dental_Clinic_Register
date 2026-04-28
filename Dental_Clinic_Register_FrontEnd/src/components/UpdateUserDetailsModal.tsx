import React, { useState, useEffect } from 'react';
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import { useUser } from '../context/UserContext';
import { useTranslation } from 'react-i18next';

export enum Gender {
  // eslint-disable-next-line no-unused-vars
  MALE = 'MALE',
  // eslint-disable-next-line no-unused-vars
  FEMALE = 'FEMALE',
  // eslint-disable-next-line no-unused-vars
  OTHER = 'OTHER',
}

export interface UpdateProfileDTO {
  firstName: string;
  middleName: string;
  lastName: string;
  phoneNumber: string;
  gender: Gender;
}

interface UpdateUserModalProps {
  open: boolean;
  onClose: () => void;
  // eslint-disable-next-line no-unused-vars
  onSubmit: (updatedUser: UpdateProfileDTO) => void;

  isLoadingUpdate: boolean;
  successMessage: string;
  errorMessage: string;
}

function UpdateUserModal({
  open,
  onClose,
  onSubmit,
  isLoadingUpdate,
  successMessage,
  errorMessage,
}: UpdateUserModalProps) {
  const { user } = useUser();
  const { t } = useTranslation();

  const [formData, setFormData] = useState<UpdateProfileDTO>({
    firstName: '',
    middleName: '',
    lastName: '',
    phoneNumber: '',
    gender: Gender.OTHER,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        middleName: user.middleName || '',
        lastName: user.lastName || '',
        phoneNumber: user.phoneNumber || '',
        gender: user.gender || Gender.OTHER,
      });
    }
  }, [user, open]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | { name?: string; value: unknown }>,
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name as string]: value,
    }));
  };

  const handleSelectChange = (event: SelectChangeEvent<Gender>) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name as string]: value as Gender,
    }));
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('updateUserDetails')}</DialogTitle>
      <DialogContent dividers>
        <TextField
          margin="dense"
          name="firstName"
          label={t('firstName')}
          type="text"
          fullWidth
          variant="outlined"
          value={formData.firstName}
          onChange={handleChange}
          sx={{ mb: 2 }}
        />
        <TextField
          margin="dense"
          name="middleName"
          label={t('middleName')}
          type="text"
          fullWidth
          variant="outlined"
          value={formData.middleName}
          onChange={handleChange}
          placeholder={user?.middleName ? '' : '-'}
          sx={{ mb: 2 }}
        />
        <TextField
          margin="dense"
          name="lastName"
          label={t('lastName')}
          type="text"
          fullWidth
          variant="outlined"
          value={formData.lastName}
          onChange={handleChange}
          sx={{ mb: 2 }}
        />
        <TextField
          margin="dense"
          name="phoneNumber"
          label={t('phoneNumber')}
          type="text"
          fullWidth
          variant="outlined"
          value={formData.phoneNumber}
          onChange={handleChange}
          sx={{ mb: 2 }}
        />
        <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
          <InputLabel id="gender-label">{t('gender')}</InputLabel>
          <Select
            labelId="gender-label"
            name="gender"
            value={formData.gender}
            label={t('gender')}
            onChange={handleSelectChange}
          >
            <MenuItem value={Gender.FEMALE}>{t('female')}</MenuItem>
            <MenuItem value={Gender.MALE}>{t('male')}</MenuItem>
            <MenuItem value={Gender.OTHER}>{t('other')}</MenuItem>
          </Select>
        </FormControl>

        {successMessage && (
          <Typography variant="body2" color="success.main" sx={{ mt: 2 }}>
            {successMessage}
          </Typography>
        )}
        {errorMessage && (
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            {errorMessage}
          </Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ pt: 2, pb: 0, px: 0 }}>
        <Button onClick={onClose} disabled={isLoadingUpdate}>
          {t('cancel')}
        </Button>
        <Button
          onClick={handleSubmit}
          color="primary"
          variant="contained"
          disabled={isLoadingUpdate}
          startIcon={isLoadingUpdate ? <CircularProgress size={20} /> : null}
        >
          {isLoadingUpdate ? t('updating') : t('submit')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default UpdateUserModal;
