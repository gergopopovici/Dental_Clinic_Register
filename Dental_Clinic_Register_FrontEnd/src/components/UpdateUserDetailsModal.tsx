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
import { useUser } from '../context/UserContext'; // Assuming this path is correct

export enum Gender {
  // eslint-disable-next-line no-unused-vars
  MALE = 'MALE',
  // eslint-disable-next-line no-unused-vars
  FEMALE = 'FEMALE',
  // eslint-disable-next-line no-unused-vars
  OTHER = 'OTHER',
}

// Define a new DTO specifically for updating profile details
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
  // Use the new UpdateProfileDTO for the onSubmit callback
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

  // State to manage form inputs, initialized with user data using the new DTO
  const [formData, setFormData] = useState<UpdateProfileDTO>({
    firstName: '',
    middleName: '',
    lastName: '',
    phoneNumber: '',
    gender: Gender.OTHER, // Default to 'OTHER' or handle null explicitly
  });

  // Effect to update form data when the modal opens or user data changes
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
  }, [user, open]); // Re-initialize when user data changes or modal opens

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
      [name as string]: value as Gender, // Cast value to Gender enum
    }));
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Update User Details</DialogTitle>
      <DialogContent dividers>
        <TextField
          margin="dense"
          name="firstName"
          label="First Name"
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
          label="Middle Name"
          type="text"
          fullWidth
          variant="outlined"
          value={formData.middleName}
          onChange={handleChange}
          placeholder={user?.middleName ? '' : '-'} // Display dash if middleName is null
          sx={{ mb: 2 }}
        />
        <TextField
          margin="dense"
          name="lastName"
          label="Last Name"
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
          label="Phone Number"
          type="text"
          fullWidth
          variant="outlined"
          value={formData.phoneNumber}
          onChange={handleChange}
          sx={{ mb: 2 }}
        />
        <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
          <InputLabel id="gender-label">Gender</InputLabel>
          <Select
            labelId="gender-label"
            name="gender"
            value={formData.gender}
            label="Gender"
            onChange={handleSelectChange}
          >
            <MenuItem value={Gender.FEMALE}>Female</MenuItem>
            <MenuItem value={Gender.MALE}>Male</MenuItem>
            <MenuItem value={Gender.OTHER}>Other</MenuItem>
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
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          color="primary"
          variant="contained"
          disabled={isLoadingUpdate}
          startIcon={isLoadingUpdate ? <CircularProgress size={20} /> : null}
        >
          {isLoadingUpdate ? 'Updating...' : 'Submit'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default UpdateUserModal;
